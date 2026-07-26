/**
 * Chu Lab CV Sync — Google Apps Script
 * ======================================
 * Watches a Google Drive folder for a new/updated CV PDF.
 * When detected, triggers the GitHub Actions cv-sync workflow
 * via the repository_dispatch API.
 *
 * SETUP:
 *  1. Open script.google.com → New Project
 *  2. Paste this file
 *  3. Fill in CONFIG below
 *  4. Run installTrigger() once to register the time-based trigger
 *  5. Authorize when prompted
 */

const CONFIG = {
  // Google Drive folder ID where you upload your CV
  // (from the URL: drive.google.com/drive/folders/FOLDER_ID)
  DRIVE_FOLDER_ID: 'YOUR_GOOGLE_DRIVE_FOLDER_ID',

  // The exact filename of your CV in Drive
  CV_FILENAME: 'Candice_Chu_CV.pdf',

  // GitHub personal access token (needs repo + workflow scopes)
  GITHUB_TOKEN: 'YOUR_GITHUB_PAT',

  // GitHub repo owner and name
  GITHUB_OWNER: 'candicechudvm',
  GITHUB_REPO:  'candicechudvm.github.io',

  // How often to check for changes (minutes). installTrigger uses this.
  CHECK_INTERVAL_MINUTES: 30,
};

// --------------------------------------------------------------------------

/**
 * Main function — called by the time-based trigger.
 * Checks if the CV was modified since last check.
 */
function checkForCVUpdate() {
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const files = folder.getFilesByName(CONFIG.CV_FILENAME);

  if (!files.hasNext()) {
    Logger.log('CV file not found in Drive folder.');
    return;
  }

  const file = files.next();
  const lastModified = file.getLastUpdated().getTime();
  const props = PropertiesService.getScriptProperties();
  const lastChecked = parseInt(props.getProperty('lastModifiedTime') || '0', 10);

  if (lastModified <= lastChecked) {
    Logger.log('No CV changes detected.');
    return;
  }

  Logger.log('CV updated! Triggering GitHub Actions...');
  props.setProperty('lastModifiedTime', String(lastModified));

  // Get a short-lived download URL for the file
  const fileId = file.getId();
  triggerGitHubActions(fileId, file.getName());
}

/**
 * Dispatches a repository_dispatch event to GitHub Actions.
 */
function triggerGitHubActions(fileId, fileName) {
  const url = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/dispatches`;

  const payload = {
    event_type: 'cv-updated',
    client_payload: {
      drive_file_id: fileId,
      cv_filename: fileName,
      triggered_at: new Date().toISOString(),
    },
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${CONFIG.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  Logger.log(`GitHub dispatch response: ${response.getResponseCode()}`);

  if (response.getResponseCode() !== 204) {
    Logger.log('Error body: ' + response.getContentText());
  } else {
    Logger.log('GitHub Actions workflow triggered successfully!');
  }
}

/**
 * Run this ONCE manually to install the recurring trigger.
 */
function installTrigger() {
  // Remove any existing triggers to avoid duplicates
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('checkForCVUpdate')
    .timeBased()
    .everyMinutes(CONFIG.CHECK_INTERVAL_MINUTES)
    .create();

  Logger.log(`Trigger installed — checking every ${CONFIG.CHECK_INTERVAL_MINUTES} minutes.`);
}

/**
 * Run this to test your configuration without waiting for a trigger.
 */
function testManualTrigger() {
  // Temporarily reset last-modified time so the check fires
  PropertiesService.getScriptProperties().deleteProperty('lastModifiedTime');
  checkForCVUpdate();
}
