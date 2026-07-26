// Chu Lab / Candice Chu site renderer — pure functions, no I/O.
// Single source of truth for HTML. Design lives here; facts live in _data/*.json.

export const esc = (s = '') => String(s)
  .replace(/&(?![a-zA-Z#][a-zA-Z0-9]*;)/g, '&amp;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Rich fields in _data are trusted inline HTML (a/em/strong/br only) — see validate.mjs */
const rich = (s = '') => String(s == null ? '' : s);
const attr = (s = '') => String(s).replace(/"/g, '&quot;');
const pub = (arr = []) => arr.filter(x => x && x.publish !== false);

const tag = (t) => typeof t === 'string'
  ? `<span class="tag tag-pub">${esc(t)}</span>`
  : `<span class="tag tag-${esc(t.cat || 'pub')}">${esc(t.label)}</span>`;
const tags = (list = []) => list.map(tag).join('');

const isExt = (href = '') => /^(https?:|mailto:)/.test(href);
const btn = ({ href, label, style = 'outline', small = false }) =>
  `<a class="btn btn-${style}"${small ? ' style="font-size:12px;padding:6px 12px;"' : ''} href="${attr(href)}"${isExt(href) && !href.startsWith('mailto:') ? ' target="_blank" rel="noopener"' : ''}>${esc(label)}</a>`;

/* ── icons + chrome ──────────────────────────────────────── */

const THEME_SVGS = `<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg><svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

const ICON = {
  linkedin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
  scholar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.94A8 8 0 0 1 12 9a8 8 0 0 1 7.162 4.44L24 9.5z"/></svg>`,
  youtube: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  download: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  instagram: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>`,
  mail: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>`,
};

function nav(site, current) {
  const links = site.nav.map(n =>
    `<a href="${attr(n.href)}"${n.href === current ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`).join('');
  return `<nav class="nav">
<div class="nav-inner">
<a class="nav-brand" href="index.html"><img src="assets/logo.png" alt="${attr(site.brand.name)} logo" /><div><div class="nav-brand-text">${esc(site.brand.name)}</div><div class="nav-brand-sub">${esc(site.brand.tagline)}</div></div></a>
<div class="nav-links">${links}</div>
<div class="nav-right">
<button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">${THEME_SVGS}</button>
<button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu"><span></span><span></span><span></span></button>
</div>
</div>
</nav>
<div class="nav-drawer" id="nav-drawer">${links}</div>`;
}

const footer = (site) => `<footer class="footer"><p>© ${esc(site.footer.year)} ${esc(site.person.name)} · All Rights Reserved · <a href="${attr(site.person.linkedin)}" target="_blank" rel="noopener">LinkedIn</a> · <a href="mailto:${attr(site.person.email)}">Contact</a></p></footer>`;

function personJsonLd(site) {
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Person',
    name: site.person.name, honorificSuffix: site.person.credentials,
    jobTitle: site.person.title, email: `mailto:${site.person.email}`,
    url: site.seo.baseUrl + '/', image: site.seo.baseUrl + '/assets/profile-square.jpg',
    worksFor: { '@type': 'Organization', name: site.person.affiliation },
    affiliation: { '@type': 'Organization', name: site.person.affiliation },
    knowsAbout: site.person.knowsAbout, sameAs: site.person.sameAs,
  });
}

/* ── analytics ────────────────────────────────────────────
   One provider at a time, chosen in _data/site.json. Emits nothing at all when the
   provider is "none" or its id is blank, so the site ships cookie-free by default. */
function analyticsTag(site) {
  const a = site.analytics || {};
  const id = {
    cloudflare: a.cloudflareToken, plausible: a.plausibleDomain, umami: a.umamiWebsiteId,
    goatcounter: a.goatcounterCode, ga4: a.ga4MeasurementId,
  }[a.provider];
  if (!a.provider || a.provider === 'none' || !id) return '';
  if (a.provider === 'cloudflare') {
    return `\n<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${attr(id)}"}'></script>`;
  }
  if (a.provider === 'plausible') {
    return `\n<script defer data-domain="${attr(id)}" src="${attr((a.plausibleHost || 'https://plausible.io').replace(/\/$/, ''))}/js/script.js"></script>`;
  }
  if (a.provider === 'umami') {
    return `\n<script defer data-website-id="${attr(id)}" src="${attr((a.umamiHost || '').replace(/\/$/, ''))}/script.js"></script>`;
  }
  if (a.provider === 'goatcounter') {
    return `\n<script defer data-goatcounter="https://${attr(id)}.goatcounter.com/count" src="//gc.zgo.at/count.js"></script>`;
  }
  return `\n<script async src="https://www.googletagmanager.com/gtag/js?id=${attr(id)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${attr(id)}');</script>`;
}

/* Site-level entity graph, home page only — ties the domain to the person. */
function siteJsonLd(site) {
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': 'WebSite',
    name: site.brand.full, alternateName: site.brand.name,
    url: site.seo.baseUrl + '/', inLanguage: 'en-US',
    author: { '@type': 'Person', name: site.person.name, url: site.seo.baseUrl + '/about.html' },
    publisher: { '@type': 'Person', name: site.person.name },
    about: site.person.knowsAbout,
  });
}

function layout(site, page, body) {
  const canonical = `${site.seo.baseUrl}/${page.file === 'index.html' ? '' : page.file}`;
  const ld = [personJsonLd(site), ...(page.file === 'index.html' ? [siteJsonLd(site)] : []),
    ...(page.jsonld || []).map(j => JSON.stringify(j))];
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(page.title)}</title>
<meta name="description" content="${attr(page.description)}" />
<meta name="keywords" content="${attr((page.keywords || site.seo.keywords).join(', '))}" />
<meta name="author" content="${attr(site.person.name)}" />
<meta name="robots" content="${page.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'}" />
<link rel="canonical" href="${attr(canonical)}" />
<meta property="og:type" content="${page.file === 'index.html' ? 'website' : 'article'}" />
<meta property="og:title" content="${attr(page.title)}" />
<meta property="og:description" content="${attr(page.description)}" />
<meta property="og:url" content="${attr(canonical)}" />
<meta property="og:image" content="${attr(site.seo.baseUrl + '/assets/profile-square.jpg')}" />
<meta property="og:image:alt" content="${attr(site.person.name + ', ' + site.person.credentials)}" />
<meta property="og:site_name" content="${attr(site.brand.full)}" />
<meta property="og:locale" content="en_US" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${attr(page.title)}" />
<meta name="twitter:description" content="${attr(page.description)}" />
<meta name="twitter:image" content="${attr(site.seo.baseUrl + '/assets/profile-square.jpg')}" />
<meta name="twitter:image:alt" content="${attr(site.person.name + ', ' + site.person.credentials)}" />
<link rel="stylesheet" href="css/style.css" />
<link rel="stylesheet" href="css/site.css" />
${ld.map(j => `<script type="application/ld+json">${j}</script>`).join('\n')}
<script src="js/main.js"></script>
</head>
<body>
${nav(site, page.file)}
<main class="${page.mainClass || 'page-sm'}">
${body}
</main>
${footer(site)}${page.tail || ''}${analyticsTag(site)}
</body>
</html>
`;
}

const pageHeader = (h1, sub) =>
  `<div class="page-header"><h1>${esc(h1)}</h1>${sub ? `<p>${rich(sub)}</p>` : ''}</div>`;

/* Rich data HTML -> plain text, for clipboard payloads. Derived at build time so the
   copyable text can never drift from the rendered prose. */
const toPlain = (html) => String(html)
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, "'")
  .replace(/[ \t]+/g, ' ').trim();
const words = (s) => toPlain(s).split(/\s+/).filter(Boolean).length;
const sectionTitle = (t) => `<p class="section-title">${esc(t)}</p>`;
const bandHead = (title, href, linkLabel, extra = '') => `<div class="band-head">
<p class="section-title" style="margin-bottom:0;">${esc(title)}</p>${extra}${href ? `<div class="chip-row" style="gap:8px;"><a class="btn btn-ghost" href="${attr(href)}">${esc(linkLabel)}</a></div>` : ''}
</div>`;

/* ── reusable cards ──────────────────────────────────────── */

function pubCard(p, { compact = false } = {}) {
  const links = (p.links || []).map(l =>
    btn({ href: l.href, label: l.label, style: l.primary ? 'primary' : 'outline' })).join('');
  return `<div class="pub-card" data-topics="${attr((p.topics || []).join('|'))}">
<div>
<p class="pub-number">${esc(p.number)}</p>
<h3 class="pub-title">${rich(p.title)}</h3>
<p class="pub-authors">${rich(p.authors)}</p>
<p class="pub-journal">${rich(p.journal)}</p>
<div class="pub-tags">${tags(p.tags)}</div>${!compact && p.summary ? `\n<p class="pub-summary">${rich(p.summary)}</p>` : ''}${links ? `\n<div class="pub-links">${links}</div>` : ''}
</div>${!compact && p.thumb ? `\n<img class="pub-thumb" src="${attr(p.thumb.src)}" alt="${attr(p.thumb.alt)}" />` : ''}
</div>`;
}

function projectCard(c, color) {
  const img = c.image
    ? `\n<div class="project-img-wrap"><img src="${attr(c.image.src)}" alt="${attr(c.image.alt)}"${c.image.style ? ` style="${attr(c.image.style)}"` : ''} /></div>` : '';
  const foot = c.link ? `<a class="btn btn-ghost" href="${attr(c.link.href)}">${esc(c.link.label)}</a>`
    : (c.status ? `<span class="project-status active">${esc(c.status)}</span>` : '');
  return `<div class="project-card">
<div class="project-card-accent" style="background:${attr(color)};"></div>
<div class="project-card-body">
<div class="project-num" style="color:${attr(color)};">${esc(c.kicker)}</div>
<h3 class="project-title">${rich(c.title)}</h3>
<p class="project-desc">${rich(c.description)}</p>
<div class="chip-row">${tags(c.tags)}</div>
${foot}
</div>${img}
</div>`;
}

function talkCard(t) {
  const inner = `<div class="item-card-label">${esc(t.label)}</div>
<div class="item-card-title">${rich(t.title)}</div>${t.sub ? `\n<div class="item-card-sub">${rich(t.sub)}</div>` : ''}`;
  if (!t.tag) return `<div class="item-card">${inner}</div>`;
  return `<div class="item-card"><div class="item-card-split"><div>${inner}</div>${tag(t.tag)}</div></div>`;
}

function personCard(m) {
  return `<div class="person-card">
<div class="person-photo-wrap">${m.photo
    ? `<img class="person-photo" src="${attr(m.photo)}" alt="${attr(m.name)}" />`
    : `<div class="person-photo person-photo-empty" role="img" aria-label="Photo of ${attr(m.name)} coming soon"><span>${esc(m.name.split(' ').map(w => w[0]).join(''))}</span></div>`}</div>
<div class="person-body">
<div class="person-name">${esc(m.name)}</div>
<div class="person-role">${esc(m.role)}</div>
<p class="person-bio">${rich(m.bio)}</p>${m.outsideLab ? `\n<p class="person-aside"><span>Outside the lab</span> ${rich(m.outsideLab)}</p>` : ''}
<div class="chip-row" style="margin-top:10px;">${tags(m.tags)}</div>
</div>
</div>`;
}

/* Funding card — privacy flags decide what is public. Amounts, grant numbers
   and collaborator lists are NEVER rendered, regardless of data present. */
function fundingCard(f, { compact = false } = {}) {
  const logo = f.showLogo && f.logo
    ? `<a class="fund-logo" href="${attr(f.agencyUrl)}" target="_blank" rel="noopener"><img src="${attr(f.logo.src)}" alt="${attr(f.logo.alt)}" /></a>` : '';
  return `<div class="fund-card">
<div class="fund-body">
<p class="fund-agency">Supported by ${f.agencyUrl ? `<a href="${attr(f.agencyUrl)}" target="_blank" rel="noopener">${esc(f.agency)}</a>` : esc(f.agency)}</p>
<h3 class="fund-title">${rich(f.title)}</h3>
<p class="fund-role">${esc(f.role)}${f.status ? ` · <span class="fund-status">${esc(f.status)}</span>` : ''}</p>${!compact && f.summary ? `\n<p class="fund-summary">${rich(f.summary)}</p>` : ''}${!compact && f.significance ? `\n<p class="fund-sig"><span>Significance</span> ${rich(f.significance)}</p>` : ''}
</div>${logo}
</div>`;
}

const metricCard = (m) => `<div class="metric">
<div class="metric-value">${esc(m.value)}</div>
<div class="metric-label">${rich(m.label)}</div>${m.note ? `<div class="metric-note">${esc(m.note)}</div>` : ''}
</div>`;

const roleRow = (r) => `<li class="role-row"><span class="role-period">${esc(r.period)}</span><span class="role-what"><strong>${rich(r.role)}</strong>${r.org ? `<em>${rich(r.org)}</em>` : ''}</span></li>`;

/* ── HOME ────────────────────────────────────────────────── */

/* Home-only behaviour: the publication card stack shuffles itself, pauses on hover or
   keyboard focus, and a click on a back card brings that card to the front. */
const pubStackScript = `
<script>
(function(){
var stack=document.getElementById('pub-stack');if(!stack)return;
var cards=Array.prototype.slice.call(stack.querySelectorAll('.pub-stack-card'));
if(cards.length<2)return;
var order=cards.slice(),timer=null;
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function place(){order.forEach(function(c,i){c.style.setProperty('--d',i);c.style.zIndex=String(order.length-i);c.classList.toggle('is-front',i===0);c.tabIndex=i===0?0:-1;});}
function shuffle(){var front=order[0];front.classList.add('is-flying');setTimeout(function(){order.push(order.shift());place();front.classList.remove('is-flying');},340);}
function start(){if(reduce||timer)return;timer=setInterval(shuffle,3800);}
function stop(){if(timer){clearInterval(timer);timer=null;}}
cards.forEach(function(c){c.addEventListener('click',function(e){if(!c.classList.contains('is-front')){e.preventDefault();while(order[0]!==c){order.push(order.shift());}place();}});});
stack.addEventListener('pointerenter',stop);stack.addEventListener('pointerleave',start);
stack.addEventListener('focusin',stop);stack.addEventListener('focusout',start);
place();start();
})();
</script>`;

function renderHome(site, d, partials) {
  const h = d.home;
  const plates = [
    ...d.funding.items.filter(f => f.logo).map(f => ({ href: f.agencyUrl, label: f.agency, ...f.logo })),
    ...(h.partners || []).map(p => ({ href: p.url, label: p.name, ...p.logo })),
  ].map(p => `<a class="fund-logo" href="${attr(p.href)}" target="_blank" rel="noopener" aria-label="${attr(p.label)}"><img src="${attr(p.src)}" alt="${attr(p.alt)}" loading="lazy" /></a>`);
  const logoMarquee = `<div class="logo-marquee"><div class="logo-track">${plates.join('')}${plates.map(x => x.replace('<a class="fund-logo"', '<a class="fund-logo" aria-hidden="true" tabindex="-1"')).join('')}</div></div>`;
  /* Overlapping, auto-shuffling cards — one figure per peer-reviewed paper, newest first.
     Count comes from _data/home.json so it can be tuned without touching the renderer. */
  const stackPubs = d.publications.items
    .filter(p => p.kind === 'peer-reviewed' && p.thumb).slice(0, h.heroStackCount || 6);
  const heroStack = `<div class="pub-stack-wrap">
<div class="pub-stack" id="pub-stack" role="group" aria-label="Recent peer-reviewed publications — the cards shuffle automatically">
${stackPubs.map((p, i) => {
    const primary = (p.links || []).find(l => l.primary) || (p.links || [])[0];
    const href = primary ? primary.href : (p.doi ? `https://doi.org/${p.doi}` : 'publications.html');
    const ext = /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '';
    return `<a class="pub-stack-card" href="${attr(href)}"${ext} style="--d:${i}">
<span class="pub-stack-img"><img src="${attr(p.thumb.src)}" alt="${attr(p.thumb.alt)}" loading="lazy" /></span>
<span class="pub-stack-meta"><span class="pub-stack-journal">${esc(p.journal)}</span><span class="pub-stack-title">${esc(p.title)}</span></span>
</a>`;
  }).join('')}
</div>
<p class="pub-stack-hint"><a href="publications.html">All publications →</a></p>
</div>`;

  const newsItems = d.news.items.slice(0, h.newsCount).map(n =>
    `<div class="news-item"><span class="news-date">${esc(n.date)}</span><p class="news-text">${rich(n.html)}</p></div>`).join('');

  const body = `<div class="hero-banner">
<p class="hero-eyebrow">${esc(site.person.name)}, ${esc(site.person.credentials)}</p>
<h1>${rich(h.headline)}</h1>
<div class="hero-split">
<div class="hero-banner-left">
<p class="hero-lede">${rich(h.intro)}</p>
<div class="hero-ctas">${h.ctas.map((c, i) => btn({ href: c.href, label: c.label, style: i === 0 ? 'primary' : 'outline' })).join('')}</div>
<div class="hero-concept-tags">${h.pillars.map(x => `<span>${esc(x)}</span>`).join('')}</div>
</div>
${heroStack}
</div>
</div>

<section class="band band-tint">
${bandHead('Current Roles')}
<p class="sub-head">${esc(h.roles.appointment.title)}</p>
<ul class="role-list role-list-wide" style="margin-bottom:26px;">${h.roles.appointment.items.map(roleRow).join('')}</ul>
<div class="roles-grid">
<div><p class="sub-head">${esc(h.roles.institutional.title)}</p><ul class="role-list">${h.roles.institutional.items.map(roleRow).join('')}</ul></div>
<div><p class="sub-head">${esc(h.roles.professional.title)}</p><ul class="role-list">${h.roles.professional.items.map(roleRow).join('')}</ul></div>
</div>
</section>

<section class="band">
${bandHead('Latest Updates', 'news.html', 'All news →', `<a class="btn btn-outline" href="${attr(site.person.linkedin)}" target="_blank" rel="noopener">${ICON.linkedin} Follow me on LinkedIn</a>`)}
<div class="news-list">${newsItems}</div>
</section>

<section class="band">
${bandHead('Selected Impact')}
<div class="metric-grid">${h.metrics.map(metricCard).join('')}</div>
</section>

<section class="band">
${bandHead('Research Support & Collaborators', 'research.html', 'All research →')}
${logoMarquee}
</section>

<section class="band contact-band">
<h2>${rich(h.contact.title)}</h2>
<p>${rich(h.contact.body)}</p>
<div class="hero-ctas">
<a class="btn btn-primary" href="mailto:${attr(site.person.email)}">${ICON.mail} Email Dr. Chu</a>
<a class="btn btn-outline" href="${attr(site.speaking.inviteMailto)}">Invite me to speak</a>
${btn({ href: 'about.html', label: 'About &amp; CV' })}
</div>
</section>`;

  return layout(site, {
    file: 'index.html', title: h.metaTitle, description: h.metaDescription,
    mainClass: 'page', tail: pubStackScript,
  }, body);
}

/* ── RESEARCH ────────────────────────────────────────────── */

function renderResearch(site, d) {
  const r = d.research;
  const ov = r.overview;
  const overview = ov ? `<figure class="overview-fig">
<a class="overview-link" href="${attr(ov.image.src)}" target="_blank" rel="noopener">
<img src="${attr(ov.image.src)}" alt="${attr(ov.image.alt)}" loading="lazy" />
<span class="overview-zoom">${esc(ov.zoomLabel)}</span>
</a>${ov.caption ? `\n<figcaption>${rich(ov.caption)}</figcaption>` : ''}
</figure>` : '';
  const body = pageHeader(r.h1, r.intro) +
    `<div class="quote-block"><p>"${esc(r.quote.text)}"</p>${r.quote.author ? `<cite>— ${esc(r.quote.author)}</cite>` : ''}</div>` +
    `<nav class="pillar-jump" aria-label="Research pillars">${r.pillars.map(p =>
      `<a href="#${attr(p.id)}"><span class="dot" style="background:${attr(p.color)};"></span>${esc(p.title)}</a>`).join('')}</nav>` +
    r.pillars.map(p => `<div class="research-section" id="${attr(p.id)}">
<div class="research-section-header">
<div class="research-category-dot" style="background:${attr(p.color)};"></div>
<h2 class="research-section-title" style="color:${attr(p.color)};">${esc(p.title)}</h2>
<span class="research-section-desc">${esc(p.description)}</span>
</div>${p.overview ? `\n<p class="pillar-overview">${rich(p.overview)}</p>` : ''}
<div class="project-grid">${pub(p.cards).map(c => projectCard(c, p.color)).join('')}</div>
</div>`).join('\n') + (overview ? `<hr class="divider" />\n${overview}` : '');

  return layout(site, {
    file: 'research.html', title: r.metaTitle, description: r.metaDescription,
    keywords: r.keywords, mainClass: 'page',
  }, body);
}

/* ── AI EDUCATION ────────────────────────────────────────── */

function renderAiEducation(site, d) {
  const e = d.aiEducation;
  const need = `<ul class="need-list">${e.need.points.map(p => `<li>${rich(p)}</li>`).join('')}</ul>`;
  const modules = `<ol class="module-list">${e.modules.map((m, i) => `<li class="module">
<span class="module-num">${String(i + 1).padStart(2, '0')}</span>
<div><h3>${rich(m.title)}</h3><p>${rich(m.summary)}</p></div>
</li>`).join('')}</ol>`;

  const course = e.course;
  const schedule = course.schedule?.length
    ? `<div class="table-wrap"><table class="course-table">
<caption>${rich(course.scheduleCaption)}</caption>
<thead><tr><th scope="col">Week</th><th scope="col">Topic</th><th scope="col">Hands-on work</th></tr></thead>
<tbody>${course.schedule.map(w => `<tr><th scope="row">${esc(w.week)}</th><td>${rich(w.topic)}</td><td>${rich(w.activity)}</td></tr>`).join('')}</tbody>
</table></div>`
    : (course.scheduleNote ? `<p class="prose" style="margin-bottom:34px;">${rich(course.scheduleNote)}</p>` : '');

  const evidence = `<div class="item-list">${pub(e.evidence).map(x => `<div class="item-card">
<div class="item-card-label">${esc(x.label)}</div>
<div class="item-card-title">${rich(x.title)}</div>${x.sub ? `\n<div class="item-card-sub">${rich(x.sub)}</div>` : ''}
</div>`).join('')}</div>`;

  const resources = `<div class="item-list">${pub(e.resources).map(x => `<div class="item-card">
<div class="item-card-label">${esc(x.label)}</div>
<div class="item-card-title">${rich(x.title)}</div>${x.sub ? `\n<div class="item-card-sub">${rich(x.sub)}</div>` : ''}${x.link ? `\n<div style="margin-top:10px;">${btn({ href: x.link.href, label: x.link.label })}</div>` : ''}
</div>`).join('')}</div>`;

  /* Nothing is rendered when there are no cleared quotations — an empty section is
     correct here, and internal notes belong in _todo keys the renderer never reads. */
  const media = e.media && pub(e.media.items).length ? `<p class="section-title" style="margin-top:46px;">${esc(e.media.title)}</p>
<div class="media-grid">${pub(e.media.items).slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).map(m => `<article class="media-card"${m.embed ? ` data-embed="${attr(m.embed)}" data-embed-height="${attr(m.embedHeight || 150)}"` : ` data-yt="${attr(m.youtubeId)}"`}>
<button class="media-thumb${m.embed ? ' media-thumb-audio' : ''}" type="button" aria-label="Play: ${attr(m.title)}">
${m.embed ? `<span class="media-audio-label">${esc(m.label.split(' · ')[0])}</span>` : `<img src="https://i.ytimg.com/vi/${attr(m.youtubeId)}/hqdefault.jpg" alt="${attr(m.title)} — video thumbnail" loading="lazy" />`}
<span class="media-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
</button>
<div class="media-body">
<div class="media-kicker"><span class="media-kind">${esc(m.kind)}</span>${esc(m.label)}</div>
<h3 class="media-title">${rich(m.title)}</h3>${m.sub ? `\n<p class="media-sub">${rich(m.sub)}</p>` : ''}
</div>
</article>`).join('')}</div>` : '';

  const qs = pub(e.studentComments || []);
  const quotes = qs.length
    ? `<div class="quote-rotator" aria-roledescription="carousel" aria-label="Student comments">
<div class="quote-stack">${qs.map((q, i) => `<blockquote class="student-quote${i === 0 ? ' is-active' : ''}"><p>${rich(q.text)}</p><cite>${esc(q.source)}</cite></blockquote>`).join('')}</div>
<div class="quote-dots" role="tablist" aria-label="Choose a comment">${qs.map((q, i) => `<button class="quote-dot${i === 0 ? ' is-active' : ''}" type="button" role="tab" aria-selected="${i === 0}" aria-label="Comment ${i + 1} of ${qs.length}"></button>`).join('')}</div>
</div>
`
    : '';

  const award = e.award ? `<figure class="award-fig">
<img src="${attr(e.award.image.src)}" alt="${attr(e.award.image.alt)}" loading="lazy" />
<figcaption><span class="award-label">${esc(e.award.label)}</span><strong>${rich(e.award.title)}</strong>${rich(e.award.org)}</figcaption>
</figure>` : '';

  const body = `<div class="edu-head">${pageHeader(e.h1, e.intro)}${award}</div>` +
    sectionTitle('Educational Need') + need +
    sectionTitle('Five-Module Curriculum Framework') +
    `<p class="src-note" style="margin-bottom:18px;">${rich(e.modulesNote)}</p>` + modules +
    sectionTitle(course.title) +
    `<p class="pillar-overview">${rich(course.overview)}</p>` +
    `<div class="chip-row" style="margin-bottom:20px;">${tags(course.tags)}</div>` + schedule +
    sectionTitle(e.resourcesTitle) + resources + media +
    `<p class="section-title" style="margin-top:46px;">Educational Evidence</p>` + quotes;

  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'Course',
    name: course.courseCode + ' — ' + course.courseName,
    description: course.overview.replace(/<[^>]+>/g, ''),
    provider: { '@type': 'CollegeOrUniversity', name: site.person.affiliation },
    instructor: { '@type': 'Person', name: site.person.name },
    inLanguage: 'en',
  }];
  return layout(site, {
    file: 'ai-education.html', title: e.metaTitle, description: e.metaDescription,
    keywords: e.keywords, jsonld,
  }, body);
}

/* ── VETCLINPATHGPT ──────────────────────────────────────── */

function renderVetClinPathGpt(site, d) {
  const v = d.vetclinpathgpt;
  const section = (s) => `<div class="vcp-block" id="${attr(s.id)}">
<h2>${rich(s.title)}</h2>
${s.body ? `<p>${rich(s.body)}</p>` : ''}${s.list?.length ? `\n<ul class="need-list">${s.list.map(i => `<li>${rich(i)}</li>`).join('')}</ul>` : ''}
</div>`;

  const body = pageHeader(v.h1, v.intro) +
    `<div class="vcp-hero">
<div class="metric-grid metric-grid-tight">${v.metrics.map(metricCard).join('')}</div>
<div class="chip-row">${v.links.map((l, i) => btn({ href: l.href, label: l.label, style: i === 0 ? 'primary' : 'outline' })).join('')}</div>
</div>
<div class="callout callout-warn"><strong>${esc(v.disclaimer.title)}</strong> ${rich(v.disclaimer.body)}</div>` +
    v.sections.map(section).join('\n') +
    /* The paper is pulled from _data/publications.json by id and drawn with the same card
       component as the Publications page, so the two can never disagree. */
    sectionTitle(v.publication.sectionTitle) +
    `<div class="pub-grid">${pubCard(d.publications.items.find(p => p.id === v.publication.id))}</div>` +
    sectionTitle(v.presentation.sectionTitle) +
    `<div class="pub-grid">${pubCard({
      number: v.presentation.number, title: v.presentation.title,
      authors: v.presentation.authors, journal: v.presentation.venue,
      tags: v.presentation.tags, summary: v.presentation.summary,
      links: v.presentation.links,
    })}</div>` +
    sectionTitle(v.news.sectionTitle) +
    `<div class="item-list">${v.news.items.map(n => `<div class="item-card">
<div class="item-card-label">${rich(n.outlet)} · ${esc(n.date)}</div>
<div class="item-card-title">${rich(n.headline)}</div>
<p class="item-card-sub">${rich(n.byline)}</p>
<p class="pub-summary">${rich(n.summary)}</p>
<div style="margin-top:12px;">${btn({ href: n.href, label: n.linkLabel })}</div>
</div>`).join('')}</div>` +
    sectionTitle(v.course.sectionTitle) +
    `<div class="item-list"><div class="item-card">
<div class="item-card-label">${esc(v.course.label)}</div>
<div class="item-card-title">${rich(v.course.title)}</div>
<p class="item-card-sub">${rich(v.course.sub)}</p>
<div style="margin-top:12px;">${btn({ href: v.course.link.href, label: v.course.link.label })}</div>
</div></div>`;

  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'SoftwareApplication',
    name: 'VetClinPathGPT', applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web', url: v.links[0]?.href,
    description: v.metaDescription,
    author: { '@type': 'Person', name: site.person.name },
    isAccessibleForFree: true,
  }];
  return layout(site, {
    file: 'vetclinpathgpt.html', title: v.metaTitle, description: v.metaDescription,
    keywords: v.keywords, jsonld,
  }, body);
}

/* ── PUBLICATIONS ────────────────────────────────────────── */

function renderPublications(site, d) {
  const items = d.publications.items;
  const other = d.publications.otherWriting || [];
  const years = [...new Set(items.filter(p => p.year).map(p => p.year))].sort((a, b) => b - a);
  const topics = [...new Set([...items, ...other].flatMap(p => p.topics || []))];

  const yearHead = (y, muted) =>
    `<h2${muted ? '' : ` id="y${y}"`} class="year-head${muted ? ' year-head-muted' : ''}">${esc(y)}</h2>`;

  let body = pageHeader(d.publications.h1, d.publications.intro) +
    `<a class="btn btn-outline scholar-btn" href="${attr(site.person.scholar)}" target="_blank" rel="noopener">${ICON.scholar} Google Scholar</a>
<div class="filter-bar">
<span class="filter-label">Filter by topic</span>
<button class="tag tag-pub filter-chip is-on" data-topic="all" type="button">All</button>
${topics.map(t => `<button class="tag tag-pub filter-chip" data-topic="${attr(t)}" type="button">${esc(t)}</button>`).join('')}
</div>
<div class="filter-bar filter-bar-years">
<span class="filter-label">Jump to</span>
${years.map(y => `<a href="#y${y}" class="tag tag-pub">${y}</a>`).join('')}
</div>
<p class="filter-empty" hidden>No publications match this topic yet.</p>`;

  for (const y of years) {
    body += `<section class="pub-year" data-year="${y}">` + yearHead(y) +
      `<div class="pub-grid">${items.filter(p => p.year === y).map(p => pubCard(p)).join('')}</div></section>`;
  }
  if (other.length) {
    body += `<section class="pub-year" data-year="other">` + yearHead(d.publications.otherWritingTitle, true) +
      `<div class="pub-grid">${other.map(p => pubCard(p)).join('')}</div></section>`;
  }
  if (d.publications.inProgress?.length) {
    body += `<section class="pub-year" data-year="progress">` + yearHead('In Progress', true) +
      `<div class="pub-grid">${d.publications.inProgress.map(p => pubCard(p)).join('')}</div></section>`;
  }
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: 'Publications — ' + site.person.name,
    itemListElement: items.map((p, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: {
        '@type': 'ScholarlyArticle', headline: p.title, datePublished: String(p.year),
        author: { '@type': 'Person', name: site.person.name },
        ...(p.doi ? { sameAs: 'https://doi.org/' + p.doi } : {}),
      },
    })),
  }];

  const tail = `
<script>
(function(){
  var chips=document.querySelectorAll('.filter-chip');
  var cards=document.querySelectorAll('.pub-card[data-topics]');
  var empty=document.querySelector('.filter-empty');
  function apply(topic){
    var shown=0;
    cards.forEach(function(c){
      var on = topic==='all' || (c.dataset.topics||'').split('|').indexOf(topic)>-1;
      c.hidden=!on; if(on) shown++;
    });
    document.querySelectorAll('.pub-year').forEach(function(s){
      s.hidden = s.querySelectorAll('.pub-card:not([hidden])').length===0;
    });
    document.querySelectorAll('.filter-bar-years').forEach(function(b){ b.hidden = topic!=='all'; });
    if(empty) empty.hidden = shown>0;
  }
  chips.forEach(function(ch){
    ch.addEventListener('click',function(){
      chips.forEach(function(o){o.classList.remove('is-on');});
      ch.classList.add('is-on');
      apply(ch.dataset.topic);
    });
  });
})();
</script>`;

  return layout(site, {
    file: 'publications.html', title: d.publications.metaTitle,
    description: d.publications.metaDescription, jsonld, tail,
  }, body);
}

/* ── SPEAKING ────────────────────────────────────────────── */

function renderSpeaking(site, d) {
  const s = d.speaking;
  const headerPhoto = s.headerPhoto ? `<figure class="award-fig speaking-fig">
<img src="${attr(s.headerPhoto.src)}" alt="${attr(s.headerPhoto.alt)}" loading="lazy" />
<figcaption>${rich(s.headerPhoto.caption)}</figcaption>
</figure>` : '';
  const jumps = [];
  for (const sec of s.sections) {
    if (s.jumpInclude.includes(sec.title)) jumps.push({ id: sec.id, label: sec.title, color: sec.color });
    if (sec.groups) for (const g of sec.groups) if (s.jumpInclude.includes(g.title)) jumps.push({ id: g.id, label: g.title, color: sec.color });
  }
  const jumpNav = `<nav class="pillar-jump" aria-label="Talk categories">${jumps.map(j => `<a href="#${attr(j.id)}"><span class="dot" style="background:${attr(j.color)};"></span>${esc(j.label)}</a>`).join('')}</nav>`;
  const body = `<div class="edu-head"><div>${pageHeader(s.h1, s.intro)}<div class="chip-row" style="margin:22px 0 0;"><a class="btn btn-primary" href="${attr(s.inviteMailto)}">${ICON.mail} Invite Dr. Chu to Speak</a></div></div>${headerPhoto}</div>` +
    `${jumpNav}
${sectionTitle('Keynote Topics')}
<div class="topic-grid">${s.topics.map(t => `<div class="topic-card">${rich(t)}</div>`).join('')}</div>` +
    s.sections.map(sec => {
      let out = `<p class="section-title" id="${attr(sec.id)}">${esc(sec.title)}</p>`;
      if (sec.groups) {
        out += sec.groups.map(g =>
          `<p class="sub-head" id="${attr(g.id)}">${esc(g.title)}</p><div class="item-list" style="margin-bottom:28px;">${g.items.map(talkCard).join('')}</div>`).join('');
      } else {
        out += `<div class="item-list" style="margin-bottom:40px;">${sec.items.map(talkCard).join('')}</div>`;
      }
      return out;
    }).join('\n');

  return layout(site, {
    file: 'speaking.html', title: s.metaTitle, description: s.metaDescription,
    keywords: s.keywords,
  }, body);
}

/* ── TEAM ────────────────────────────────────────────────── */

function renderTeam(site, d) {
  const t = d.team;
  const pi = t.pi;
  const piCard = `<div class="pi-card">
<div class="pi-photo"><img class="person-photo" src="${attr(pi.photo)}" alt="${attr(pi.name)}" /></div>
<div class="person-body">
<span class="pi-badge">PI</span>
<div class="person-name">${esc(pi.name)}</div>
<div class="person-role">${esc(pi.role)}</div>
<p class="person-bio person-contact">${rich(pi.contact)}</p>
<p class="person-bio">${rich(pi.focus)}</p>
<div class="chip-row" style="margin-top:12px;">
<a class="btn btn-primary" style="font-size:12px;padding:6px 12px;" href="${attr(site.person.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
<a class="btn btn-outline" style="font-size:12px;padding:6px 12px;" href="${attr(site.person.scholar)}" target="_blank" rel="noopener">Google Scholar</a>
${btn({ href: 'about.html', label: 'About', small: true })}
</div>
</div>
</div>`;

  const alumni = pub(t.alumni || []);
  const body = pageHeader(t.h1, t.intro) +
    sectionTitle('Principal Investigator') + `<div style="margin-bottom:48px;">${piCard}</div>` +
    sectionTitle(t.membersTitle) + `<div class="people-grid">${pub(t.members).map(personCard).join('')}</div>` +
    (alumni.length ? `<hr class="divider" />${sectionTitle('Alumni')}<div class="item-list">${alumni.map(a =>
      `<div class="item-card"><div class="item-card-title">${rich(a.name)}</div><div class="item-card-sub">${rich(a.detail)}</div></div>`).join('')}</div>` : '') +
    `<hr class="divider" />
<div class="cta-panel">
<h2>${esc(t.join.title)}</h2>
<p>${rich(t.join.body)}</p>
<div class="chip-row">${t.join.links.map((l, i) => btn({ href: l.href, label: l.label, style: i === 0 ? 'primary' : 'outline' })).join('')}</div>
</div>`;

  return layout(site, {
    file: 'team.html', title: t.metaTitle, description: t.metaDescription, mainClass: 'page',
  }, body);
}

/* ── ABOUT ───────────────────────────────────────────────── */

function renderAbout(site, d) {
  const a = d.about;
  const p = site.person;

  const bioCard = (id, label, html, paras) => {
    const plain = paras ? paras.map(toPlain).join('\n\n') : toPlain(html);
    const n = paras ? words(paras.join(' ')) : words(html);
    return `<article class="bio-card" id="${attr(id)}">
<header class="bio-card-head">
<div><p class="bio-card-label">${esc(label)}</p><p class="bio-card-count">${n} words</p></div>
<button class="btn btn-outline bio-copy" type="button" data-copy="${attr(plain)}" data-label="Copy">Copy</button>
</header>
<div class="bio-card-body">${paras ? paras.map(x => `<p>${rich(x)}</p>`).join('') : `<p>${rich(html)}</p>`}</div>
</article>`;
  };

  const body = `<div class="about-head">
<img class="about-photo" src="assets/profile-square.jpg" alt="${attr(p.name)}, ${attr(p.credentials)}" />
<div>
<h1>${esc(p.name)}</h1>
<p class="about-cred">${esc(p.credentials)}</p>
<p class="about-affil">${esc(p.title)} · ${esc(p.department)}<br>${esc(p.affiliation)}</p>
<div class="chip-row" style="margin-top:14px;">
<a class="btn btn-primary" href="mailto:${attr(p.email)}">${ICON.mail} ${esc(p.email)}</a>
<a class="btn btn-outline" href="${attr(p.linkedin)}" target="_blank" rel="noopener">${ICON.linkedin} LinkedIn</a>
<a class="btn btn-outline" href="${attr(p.scholar)}" target="_blank" rel="noopener">${ICON.scholar} Scholar</a>
<a class="btn btn-outline" href="${attr(p.youtube)}" target="_blank" rel="noopener">${ICON.youtube} YouTube</a>
<a class="btn btn-outline" href="${attr(p.instagram)}" target="_blank" rel="noopener">${ICON.instagram} Instagram</a>
${btn({ href: 'cv.html', label: 'Full CV' })}
</div>
</div>
</div>
${sectionTitle(a.bioTitle)}
<p class="src-note" style="margin-bottom:18px;">${rich(a.bioNote)}</p>
<div class="bio-stack">
${bioCard('short-bio', 'Short bio', a.shortBio)}
${bioCard('full-bio', 'Full bio', null, a.bio)}
</div>
<div class="chip-row" style="margin:20px 0 8px;">${tags(a.interests)}</div>
<hr class="divider" />
${sectionTitle('Selected Honors')}
<ul class="role-list role-list-wide">${a.honors.map(roleRow).join('')}</ul>
<hr class="divider" />
${sectionTitle('Leadership & Service')}
<ul class="role-list role-list-wide">${a.leadership.map(roleRow).join('')}</ul>
<hr class="divider" />
${sectionTitle('Education & Training')}
<ul class="role-list role-list-wide">${a.education.map(roleRow).join('')}</ul>
<hr class="divider" />
<div class="cta-panel">
<h2>${rich(a.contact.title)}</h2>
<p>${rich(a.contact.body)}</p>
<div class="chip-row">
<a class="btn btn-primary" href="mailto:${attr(p.email)}">Email Dr. Chu</a>
<a class="btn btn-outline" href="${attr(site.speaking.inviteMailto)}">Invite me to speak</a>
${btn({ href: 'team.html', label: 'Join the lab' })}
</div>
</div>`;

  return layout(site, {
    file: 'about.html', title: a.metaTitle, description: a.metaDescription, mainClass: 'page',
    tail: `
<script>
(function(){
  document.querySelectorAll('.bio-copy').forEach(function(btn){
    btn.addEventListener('click',function(){
      var text=btn.getAttribute('data-copy');
      function done(ok){
        btn.textContent=ok?'Copied':'Press Ctrl+C';
        btn.classList.toggle('is-copied',ok);
        setTimeout(function(){btn.textContent=btn.getAttribute('data-label');btn.classList.remove('is-copied');},2000);
      }
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){done(true);},function(){fallback();});
      } else { fallback(); }
      function fallback(){
        var ta=document.createElement('textarea');
        ta.value=text; ta.setAttribute('readonly','');
        ta.style.position='fixed'; ta.style.top='-1000px';
        document.body.appendChild(ta); ta.select();
        var ok=false; try{ok=document.execCommand('copy');}catch(e){}
        document.body.removeChild(ta); done(ok);
      }
    });
  });
})();
</script>`,
  }, body);
}

/* ── NEWS + TEACHING + CV ────────────────────────────────── */

function renderTeaching(site, d) {
  const t = d.teaching;
  const philosophy = `<div class="teach-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:48px;">` +
    t.philosophy.map(p => `<div class="item-card" style="border-top:3px solid ${attr(p.accent)};">
<div class="item-card-label">${esc(p.label)}</div>
<div class="item-card-title" style="font-size:15px;">${esc(p.title)}</div>
<p class="item-card-desc">${rich(p.body)}</p>
</div>`).join('') + `</div>
<style>@media(max-width:600px){.teach-grid{grid-template-columns:1fr!important}}</style>`;

  const courseCard = (c) => `<div class="item-card"${c.highlight ? ' style="border-left:4px solid var(--c-purple);"' : ''}>
<div class="chip-row" style="margin-bottom:8px;">${tag(c.term)}</div>
<div class="item-card-title">${rich(c.title)}</div>${c.sub ? `\n<div class="item-card-sub">${rich(c.sub)}</div>` : ''}${c.tags?.length ? `\n<div class="chip-row" style="margin-top:10px;">${tags(c.tags)}</div>` : ''}
</div>`;

  const listCard = (i) => `<div class="item-card">
<div class="item-card-label">${esc(i.label)}</div>
<div class="item-card-title">${rich(i.title)}</div>${i.sub ? `\n<div class="item-card-sub">${rich(i.sub)}</div>` : ''}${i.link ? `\n<div style="margin-top:10px;">${btn({ href: i.link.href, label: i.link.label })}</div>` : ''}
</div>`;

  const body = pageHeader(t.h1, t.intro) +
    `<p class="hero-lede" style="font-style:italic;color:var(--c-purple);margin-bottom:34px;">${esc(t.motto)}</p>` +
    sectionTitle('Teaching Philosophy') + philosophy +
    sectionTitle(t.coursesTitle) +
    `<div class="item-list" style="margin-bottom:48px;">${t.courses.map(courseCard).join('')}</div>` +
    sectionTitle('On-Demand Webinars') +
    `<div class="item-list" style="margin-bottom:48px;">${t.webinars.map(listCard).join('')}</div>` +
    sectionTitle('YouTube') +
    `<div class="item-list" style="margin-bottom:48px;">${t.youtube.map(listCard).join('')}
<div style="margin-top:8px;"><a class="btn btn-primary" href="${attr(site.person.youtube)}" target="_blank" rel="noopener">${ICON.youtube} Watch on YouTube ${esc(site.person.youtubeHandle)}</a></div>
</div>` +
    sectionTitle('Podcast') +
    `<div class="item-list">${t.podcasts.map(listCard).join('')}</div>`;

  return layout(site, { file: 'teaching.html', title: t.metaTitle, description: t.metaDescription }, body);
}

function renderNews(site, d) {
  const body = pageHeader(d.news.h1, d.news.intro) +
    `<div class="news-list">${d.news.items.map(n =>
      `<div class="news-item"><span class="news-date">${esc(n.date)}</span><p class="news-text">${rich(n.html)}</p></div>`).join('')}</div>`;
  return layout(site, { file: 'news.html', title: d.news.metaTitle, description: d.news.metaDescription }, body);
}

function renderCv(site, d) {
  const cv = d.cv, p = site.person;
  const item = (i) => `<div class="cv-item"><span class="cv-year">${esc(i.year)}</span><div><div class="cv-content-title">${rich(i.title)}</div>${i.sub ? `<div class="cv-content-sub">${rich(i.sub)}</div>` : ''}</div></div>`;
  const body = `<div class="cv-head">
<div>
<h1>${esc(p.name)}</h1>
<p class="about-cred">${esc(p.credentials)}</p>
<p class="about-affil">${esc(p.title)} · ${esc(p.affiliation)}</p>
</div>
<div class="chip-row">
<a class="btn btn-primary" href="${attr(cv.pdf)}" target="_blank" rel="noopener">${ICON.download} Download PDF</a>
<a class="btn btn-outline" href="mailto:${attr(p.email)}">Contact</a>
</div>
</div>
<div class="filter-bar cv-jump">
<span class="filter-label">Jump to</span>${cv.sections.map(s => `<a href="#${attr(s.id)}" class="tag tag-pub">${esc(s.jump)}</a>`).join('')}
</div>` +
    cv.sections.map(s => `<div class="cv-section" id="${attr(s.id)}">
<h2>${esc(s.title)}</h2>
${s.items.map(item).join('\n')}${s.note ? `\n<p class="src-note" style="margin-top:12px;">${rich(s.note)}</p>` : ''}
</div>`).join('\n');
  return layout(site, { file: 'cv.html', title: cv.metaTitle, description: cv.metaDescription }, body);
}

/* ── BACKSTAGE (private) ─────────────────────────────────── */

function renderBackstage(site, d) {
  const b = d.backstage;
  const a = site.analytics || {};
  const active = a.provider && a.provider !== 'none' ? a.provider : null;
  const status = `<div class="bs-status">
<span class="bs-dot${active ? ' is-on' : ''}"></span>
<div><p class="bs-status-label">Analytics</p><p class="bs-status-value">${active ? esc(active) + ' — collecting' : 'not configured yet'}</p></div>
</div>`;
  const embed = b.embed && b.embed.url ? `<p class="section-title">${esc(b.embed.title)}</p>
<iframe class="bs-frame" src="${attr(b.embed.url)}" title="${attr(b.embed.title)}" height="${attr(String(b.embed.height || 700))}" loading="lazy"></iframe>` : '';
  const links = `<p class="section-title">Dashboards</p>
<div class="bs-grid">${b.links.map(l => `<a class="bs-card" href="${attr(l.href)}" target="_blank" rel="noopener">
<span class="bs-card-label">${esc(l.label)}</span>
<span class="bs-card-note">${esc(l.note)}</span>
</a>`).join('')}</div>`;
  const checklist = `<p class="section-title">Turning it on</p>
<ol class="bs-steps">${b.checklist.map(c => `<li>${rich(c)}</li>`).join('')}</ol>
<p class="src-note">${rich(b.privacyNote)}</p>`;
  const body = pageHeader(b.h1, b.intro) + status + embed + links + checklist;
  return layout(site, {
    file: 'backstage.html', title: b.metaTitle, description: b.metaDescription, noindex: true,
  }, body);
}

/* ── redirect stubs, sitemap, robots ─────────────────────── */

const redirectStub = (from, to, site) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Moved — ${esc(site.brand.name)}</title>
<link rel="canonical" href="${site.seo.baseUrl}/${to}" />
<meta http-equiv="refresh" content="0; url=${to}" />
<meta name="robots" content="noindex, follow" />
</head>
<body>
<p>This page has moved to <a href="${to}">${to}</a>.</p>
<script>location.replace('${to}');</script>
</body>
</html>
`;

function renderSitemap(site, lastmod) {
  const urls = ['index.html', ...site.nav.map(n => n.href), 'cv.html', 'news.html', 'teaching.html']
    .filter((v, i, a) => a.indexOf(v) === i);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `<url><loc>${site.seo.baseUrl}/${u === 'index.html' ? '' : u}</loc><lastmod>${lastmod}</lastmod><priority>${u === 'index.html' ? '1.0' : '0.7'}</priority></url>`).join('\n')}
</urlset>
`;
}

const renderRobots = (site) => `User-agent: *
Allow: /

# Answer engines and AI assistants are welcome to read and cite this site.
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: ${site.seo.baseUrl}/sitemap.xml
`;

/* llms.txt — a plain-text map of the site for AI assistants and answer engines.
   Derived from _data/site.json so it can never drift from the rendered pages. */
const renderLlms = (site) => `# ${site.person.name}, ${site.person.credentials}

> ${site.person.title}, ${site.person.department}, ${site.person.affiliation}. Board-certified veterinary clinical pathologist (DACVP) working on veterinary artificial intelligence, digital cytology, diagnostic AI, large language models, and AI education.

Canonical site: ${site.seo.baseUrl}/
Contact: ${site.person.email}
Preferred name and style: ${site.person.name}, ${site.person.credentials} — ${site.person.title}, ${site.person.affiliation}. Do not add titles she does not hold.

## Pages
${site.nav.map((n) => `- [${n.label}](${site.seo.baseUrl}/${n.href === 'index.html' ? '' : n.href})`).join('\n')}
- [Curriculum vitae](${site.seo.baseUrl}/cv.html)
- [News](${site.seo.baseUrl}/news.html)
- [Teaching & resources](${site.seo.baseUrl}/teaching.html)

## Areas of expertise
${site.person.knowsAbout.map((k) => `- ${k}`).join('\n')}

## Elsewhere
${site.person.sameAs.map((u) => `- ${u}`).join('\n')}

## Citing this work
Cite the peer-reviewed papers listed at ${site.seo.baseUrl}/publications.html, each of which carries a DOI. For speaking invitations, email ${site.person.email}.
`;

/* ── entry ───────────────────────────────────────────────── */

export function buildAll(d, partials, opts = {}) {
  const site = d.site;
  const lastmod = opts.lastmod || new Date().toISOString().slice(0, 10);
  const out = {
    'index.html': renderHome(site, d, partials),
    'research.html': renderResearch(site, d),
    'ai-education.html': renderAiEducation(site, d),
    'vetclinpathgpt.html': renderVetClinPathGpt(site, d),
    'publications.html': renderPublications(site, d),
    'speaking.html': renderSpeaking(site, d),
    'team.html': renderTeam(site, d),
    'about.html': renderAbout(site, d),
    'news.html': renderNews(site, d),
    'teaching.html': renderTeaching(site, d),
    'cv.html': renderCv(site, d),
    'backstage.html': renderBackstage(site, d),
    'sitemap.xml': renderSitemap(site, lastmod),
    'robots.txt': renderRobots(site),
    'llms.txt': renderLlms(site),
  };
  for (const [from, to] of Object.entries(site.redirects || {})) {
    out[from] = redirectStub(from, to, site);
  }
  return out;
}
