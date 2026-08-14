<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml">
<xsl:output method="html" encoding="UTF-8" indent="yes" />
<xsl:template match="/">
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title><xsl:value-of select="rss/channel/title" /></title>
<meta name="robots" content="noindex, follow" />
<link rel="stylesheet" href="/css/style.css" />
<link rel="stylesheet" href="/css/site.css" />
</head>
<body>
<main class="page-sm">
<div class="page-header">
<h1>Subscribe to this feed</h1>
<p><xsl:value-of select="rss/channel/description" /></p>
</div>
<p class="feed-note">This page is a web feed. Copy the address below into a feed reader such as Feedly, Inoreader or NetNewsWire and new entries will arrive automatically — no account with this site, and no email address, required.</p>
<p class="feed-url"><code><xsl:value-of select="rss/channel/atom:link/@href" xmlns:atom="http://www.w3.org/2005/Atom" /></code></p>
<p class="feed-note"><a href="/ai-policy.html">Back to the Veterinary AI Policy Tracker</a></p>
<h2 class="year-head">Latest entries</h2>
<div class="pub-grid">
<xsl:for-each select="rss/channel/item">
<div class="pub-card policy-card">
<div>
<p class="pub-number"><xsl:value-of select="category" /> · <xsl:value-of select="substring(pubDate, 6, 11)" /></p>
<h3 class="pub-title"><a href="{link}"><xsl:value-of select="title" /></a></h3>
<p class="pub-summary"><xsl:value-of select="description" /></p>
</div>
</div>
</xsl:for-each>
</div>
</main>
<footer class="footer"><p>© 2026 Candice P. Chu · <a href="https://candicechudvm.com/">candicechudvm.com</a></p></footer>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
