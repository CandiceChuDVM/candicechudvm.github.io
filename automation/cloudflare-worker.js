/**
 * Chu Lab CV Sync — Cloudflare Worker
 * =====================================
 * Receives Slack interactive component payloads (button clicks)
 * and dispatches a GitHub Actions workflow to apply or dismiss the change.
 *
 * Deploy:
 *   1. wrangler deploy  (or paste into Cloudflare Workers dashboard)
 *   2. Set secrets in Cloudflare Workers dashboard:
 *        SLACK_SIGNING_SECRET  — from Slack App → Basic Information
 *        GITHUB_TOKEN          — PAT with repo + workflow scopes
 *        GITHUB_OWNER          — candicechudvm
 *        GITHUB_REPO           — candicechudvm.github.io
 */

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const body = await request.text();

    // Verify Slack signature
    const isValid = await verifySlackSignature(request.headers, body, env.SLACK_SIGNING_SECRET);
    if (!isValid) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Slack sends payload as URL-encoded form
    const params = new URLSearchParams(body);
    const payloadRaw = params.get('payload');
    if (!payloadRaw) {
      return new Response('Bad Request', { status: 400 });
    }

    const payload = JSON.parse(payloadRaw);
    const action  = payload.actions?.[0];
    if (!action) {
      return new Response('No action', { status: 400 });
    }

    const actionId    = action.action_id;          // 'cv_approve' or 'cv_reject'
    const responseUrl = payload.response_url;      // For updating the original message
    const valueRaw    = action.value;

    let itemData;
    try {
      itemData = JSON.parse(valueRaw);
    } catch {
      return new Response('Invalid value JSON', { status: 400 });
    }

    const { section, item } = itemData;

    if (actionId === 'cv_approve') {
      // Trigger GitHub Actions to apply the change
      await dispatchGitHub(env, {
        event_type: 'cv-item-approved',
        client_payload: {
          section,
          item,
          response_url: responseUrl,
        },
      });

      // Immediately acknowledge to Slack (replace button message)
      await updateSlackMessage(responseUrl, {
        replace_original: true,
        text: `⏳ Approved! Committing *${item.title || item.course_name || item.headline || 'item'}* to the website...`,
      });

    } else if (actionId === 'cv_reject') {
      // Just update the Slack message — no GitHub dispatch needed
      await updateSlackMessage(responseUrl, {
        replace_original: true,
        text: `❌ Rejected: *${item.title || item.course_name || item.headline || 'item'}* will not be added.`,
      });
    }

    // Slack requires a 200 response within 3 seconds
    return new Response('', { status: 200 });
  },
};

// ----------------------------------------------------------------

async function dispatchGitHub(env, payload) {
  const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/dispatches`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'ChuLabBot/1.0',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error(`GitHub dispatch failed ${resp.status}: ${text}`);
  }
}

async function updateSlackMessage(responseUrl, message) {
  if (!responseUrl) return;
  await fetch(responseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
}

async function verifySlackSignature(headers, body, signingSecret) {
  if (!signingSecret) return true; // skip in dev

  const timestamp = headers.get('x-slack-request-timestamp');
  const slackSig  = headers.get('x-slack-signature');

  if (!timestamp || !slackSig) return false;

  // Reject requests older than 5 minutes (replay protection)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > 300) return false;

  const baseString = `v0:${timestamp}:${body}`;
  const encoder    = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const sig    = await crypto.subtle.sign('HMAC', key, encoder.encode(baseString));
  const hexSig = 'v0=' + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

  return hexSig === slackSig;
}
