/* ============================================================
   Chu Lab — Shared JS: dark mode + mobile nav
   ============================================================ */

(function () {
  /* --- theme --- */
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initial);

  document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
      });
    }

    /* --- mobile nav --- */
    const hamburger = document.getElementById('nav-hamburger');
    const drawer = document.getElementById('nav-drawer');
    if (hamburger && drawer) {
      hamburger.addEventListener('click', function () {
        drawer.classList.toggle('open');
      });
      drawer.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { drawer.classList.remove('open'); });
      });
    }

    /* --- mark active nav link --- */
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(function (a) {
      const href = a.getAttribute('href').split('/').pop() || 'index.html';
      if (href === current) a.classList.add('active');
    });
  });
})();

(function(){function initRotators(){document.querySelectorAll('.quote-rotator').forEach(function(el){var cards=[].slice.call(el.querySelectorAll('.student-quote')),dots=[].slice.call(el.querySelectorAll('.quote-dot'));if(cards.length<2)return;var i=0,timer=null;function show(n){i=(n+cards.length)%cards.length;cards.forEach(function(c,k){c.classList.toggle('is-active',k===i)});dots.forEach(function(d,k){d.classList.toggle('is-active',k===i);d.setAttribute('aria-selected',k===i?'true':'false')})}
function stop(){if(timer){clearInterval(timer);timer=null}}
function start(){stop();timer=setInterval(function(){show(i+1)},6500)}
dots.forEach(function(d,k){d.addEventListener('click',function(){show(k);start()})});
el.addEventListener('mouseenter',stop);el.addEventListener('mouseleave',start);
show(0);if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)start()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initRotators);else initRotators()})();

(function(){function initMedia(){document.querySelectorAll('.media-card[data-embed]').forEach(function(card){var btn=card.querySelector('.media-thumb');if(!btn)return;btn.addEventListener('click',function(){var f=document.createElement('iframe');f.src=card.getAttribute('data-embed');f.title=btn.getAttribute('aria-label')||'Audio player';f.style.height=(card.getAttribute('data-embed-height')||'150')+'px';f.style.aspectRatio='auto';f.allow='autoplay';f.loading='lazy';btn.replaceWith(f)})});document.querySelectorAll('.media-card[data-yt]').forEach(function(card){var btn=card.querySelector('.media-thumb');if(!btn)return;btn.addEventListener('click',function(){var f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+card.getAttribute('data-yt')+'?autoplay=1&rel=0';f.title=btn.getAttribute('aria-label')||'Video player';f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture';f.setAttribute('allowfullscreen','');f.loading='lazy';btn.replaceWith(f)})})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMedia);else initMedia()})();
