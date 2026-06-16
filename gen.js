// Static multi-language site generator for EggTimer Max.
//
// One source of truth per language in i18n/<lang>.json; this script renders
// every page for every language. English is written to the site root (so the
// existing App Store URLs like /privacy.html keep working); each other language
// goes in its own folder (/nl/, /de/, …).
//
// Usage: node gen.js

const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const DOMAIN = 'https://eggtimermax.github.io';
// Desired order; only languages that actually have an i18n/<lang>.json file
// are built, so new languages can be added by simply dropping in their JSON.
const ALL_LANGS = ['en', 'nl', 'de', 'es', 'fr', 'it', 'ja'];
const PAGES = ['index', 'guide', 'support', 'privacy', 'contact'];

const strings = {};
const LANGS = ALL_LANGS.filter(l => fs.existsSync(path.join(DIR, 'i18n', `${l}.json`)));
for (const l of LANGS) {
  strings[l] = JSON.parse(fs.readFileSync(path.join(DIR, 'i18n', `${l}.json`), 'utf8'));
}

// absolute site path for a page in a language (en = root, others = /<lang>/)
function urlFor(lang, page) {
  const file = `${page}.html`;
  return lang === 'en' ? `/${file}` : `/${lang}/${file}`;
}

// ---- shared chrome ---------------------------------------------------------

function head(t, lang, page, title, desc) {
  const root = lang === 'en' ? '' : '../';
  const alternates = LANGS.map(l =>
    `  <link rel="alternate" hreflang="${strings[l].htmlLang}" href="${DOMAIN}${urlFor(l, page)}">`
  ).join('\n');
  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>${desc ? `\n  <meta name="description" content="${desc}">` : ''}
  <link rel="icon" href="${root}icon.png">
  <link rel="stylesheet" href="${root}styles.css">
${alternates}
  <link rel="alternate" hreflang="x-default" href="${DOMAIN}${urlFor('en', page)}">
  <script>
    // Route to the visitor's language before paint (no flash). Respects a manual
    // choice stored in localStorage; otherwise uses the browser language once.
    (function(){
      var SUP=${JSON.stringify(LANGS)}, page=${JSON.stringify(page)}, lang=${JSON.stringify(lang)};
      function u(l){var f=page+'.html';return l==='en'?'/'+f:'/'+l+'/'+f;}
      try{
        var stored=localStorage.getItem('preferredLang'), target=stored;
        if(!target){
          var n=navigator.languages||[navigator.language||'en'];
          for(var i=0;i<n.length;i++){var c=n[i].slice(0,2).toLowerCase();if(SUP.indexOf(c)>=0){target=c;break;}}
        }
        if(!target)target='en';
        if(target!==lang&&!sessionStorage.getItem('autoRouted')){
          sessionStorage.setItem('autoRouted','1');
          location.replace(u(target));
        }
      }catch(e){}
    })();
  </script>
</head>
<body>`;
}

function langPicker(lang, page) {
  const opts = LANGS.map(l =>
    `<option value="${l}" data-url="${urlFor(l, page)}"${l === lang ? ' selected' : ''}>${strings[l].label}</option>`
  ).join('');
  return `<div class="langpick">
        <select aria-label="Language" onchange="try{localStorage.setItem('preferredLang',this.value)}catch(e){};location.href=this.options[this.selectedIndex].dataset.url">${opts}</select>
      </div>`;
}

function nav(t, lang, page) {
  const root = lang === 'en' ? '' : '../';
  return `<div class="bubbles" id="bubbles"></div>

<nav class="bar">
  <div class="inner">
    <a class="brand" href="index.html">
      <img src="${root}icon.png" alt="EggTimer Max">
      <b>EggTimer <span>Max</span></b>
    </a>
    <div class="links">
      <a href="guide.html">${t.nav.guide}</a>
      <a href="support.html">${t.nav.support}</a>
      <a href="privacy.html">${t.nav.privacy}</a>
      <a href="contact.html">${t.nav.contact}</a>
      ${langPicker(lang, page)}
    </div>
  </div>
</nav>`;
}

function footer(t, lang) {
  const root = lang === 'en' ? '' : '../';
  return `<footer class="site wrap">
  <div class="flinks">
    <a href="guide.html">${t.nav.guide}</a>
    <a href="support.html">${t.nav.support}</a>
    <a href="privacy.html">${t.footer.privacyPolicy}</a>
    <a href="contact.html">${t.nav.contact}</a>
  </div>
  <div>&copy; 2026 EggTimer Max</div>
</footer>

<script src="${root}bubbles.js"></script>
<script src="${root}main.js"></script>`;
}

// ---- pages -----------------------------------------------------------------

function pageIndex(t, lang) {
  const root = lang === 'en' ? '' : '../';
  const i = t.index;
  const cards = ['science', 'doneness', 'live', 'altitude', 'batch', 'private'].map((k, n) => `    <div class="card reveal rd${n + 1}">
      <img class="ico" src="${root}icons/icon-${k}.svg" alt="">
      <h3>${i.features[k].h}</h3>
      <p>${i.features[k].p}</p>
    </div>`).join('\n');
  return `${head(t, lang, 'index', i.title, i.metaDesc)}
${nav(t, lang, 'index')}

<header class="hero wrap">
  <img class="appicon reveal" src="${root}icon.png" alt="EggTimer Max icon">
  <h1 class="reveal rd1">${i.heroH1}</h1>
  <p class="lead reveal rd2">${i.heroLead}</p>
  <div class="actions reveal rd3" id="download">
    <a class="badge-appstore" href="#">
      <img src="${root}appstore-badge.svg" alt="Download on the App Store">
    </a>
    <a class="btn btn-ghost" href="support.html">${i.learnMore}</a>
  </div>
  <div class="showcase reveal rd4">
    <img src="${root}screenshot-main.png" alt="${i.shotMain}">
    <img src="${root}screenshot-timer.png" alt="${i.shotTimer}">
    <img src="${root}screenshot-batch.png" alt="${i.shotBatch}">
  </div>
</header>

<section class="section wrap">
  <h2 class="reveal">${i.whyTitle}</h2>
  <p class="sub reveal rd1">${i.whySub}</p>
  <div class="grid">
${cards}
  </div>
</section>

${footer(t, lang)}
</body>
</html>`;
}

function steps(items) {
  return items.map(it =>
    `      <li>${it.main}${it.sub ? `<span class="sub">${it.sub}</span>` : ''}</li>`
  ).join('\n');
}

function tip(svg, text) {
  return `    <div class="tip">
      <span class="ic">${svg}</span>
      <p>${text}</p>
    </div>`;
}

const SVG_ALT = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 19h18L14.5 7l-3.2 5.4-2.1-2.8L3 19z" stroke="#C06800" stroke-width="1.8" stroke-linejoin="round"/><circle cx="14.5" cy="6" r="1.6" fill="#F59B23"/></svg>';
const SVG_CLOCK = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="13" r="8" stroke="#C06800" stroke-width="1.8"/><path d="M12 9v4l2.8 2" stroke="#C06800" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 2.5h6" stroke="#F59B23" stroke-width="1.8" stroke-linecap="round"/></svg>';
const SVG_SCIENCE = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.5 3v6L5 17.5A2 2 0 006.8 20.5h10.4A2 2 0 0019 17.5L14.5 9V3" stroke="#C06800" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 3h7" stroke="#C06800" stroke-width="1.8" stroke-linecap="round"/><circle cx="10.5" cy="16" r="1.2" fill="#F59B23"/><circle cx="13.5" cy="17.5" r="1" fill="#F59B23"/></svg>';

function pageGuide(t, lang) {
  const g = t.guide;
  return `${head(t, lang, 'guide', g.title, g.metaDesc)}
${nav(t, lang, 'guide')}

<main class="page wrap">
  <article class="panel reveal">
    <h1>${g.h1}</h1>
    <p class="meta">${g.meta}</p>
    <p class="guide-intro">${g.intro}</p>

    <hr class="divider">

    <h2>${g.s1.h}</h2>
    <span class="lead-note">${g.s1.note}</span>
    <ol class="steps">
${steps(g.s1.steps)}
    </ol>

${tip(SVG_ALT, g.tipAltitude)}

    <hr class="divider">

    <h2>${g.s2.h}</h2>
    <span class="lead-note">${g.s2.note}</span>
    <ol class="steps">
${steps(g.s2.steps)}
    </ol>

    <hr class="divider">

    <h2>${g.s3.h}</h2>
    <span class="lead-note">${g.s3.note}</span>
    <p>${g.s3.intro}</p>
    <ol class="steps">
${steps(g.s3.steps)}
    </ol>

${tip(SVG_CLOCK, g.tipCold)}

    <hr class="divider">

    <h2>${g.s4.h}</h2>
    <ul>
${g.tips.map(x => `      <li>${x}</li>`).join('\n')}
    </ul>

${tip(SVG_SCIENCE, g.tipScience)}

    <p style="margin-top:28px;">${g.stillStuck}</p>
  </article>
</main>

${footer(t, lang)}
</body>
</html>`;
}

function pageSupport(t, lang) {
  const s = t.support;
  const faqs = s.faqs.map(f => `    <h2>${f.q}</h2>
    <p>${f.a}</p>`).join('\n\n');
  return `${head(t, lang, 'support', s.title)}
${nav(t, lang, 'support')}

<main class="page wrap">
  <article class="panel reveal">
    <h1>${s.h1}</h1>
    <p class="meta">${s.meta}</p>

    <h2>${s.faqHeading}</h2>

${faqs}

    <h2>${s.contactHeading}</h2>
    <p>${s.contactBody}</p>
  </article>
</main>

${footer(t, lang)}
</body>
</html>`;
}

function pagePrivacy(t, lang) {
  const p = t.privacy;
  const secs = p.sections.map(x => `    <h2>${x.h}</h2>
    <p>${x.p}</p>`).join('\n\n');
  return `${head(t, lang, 'privacy', p.title)}
${nav(t, lang, 'privacy')}

<main class="page wrap">
  <article class="panel reveal">
    <h1>${p.h1}</h1>
    <p class="meta">${p.meta}</p>

${secs}
  </article>
</main>

${footer(t, lang)}
</body>
</html>`;
}

function pageContact(t, lang) {
  const c = t.contact;
  return `${head(t, lang, 'contact', c.title)}
${nav(t, lang, 'contact')}

<main class="page wrap">
  <article class="panel reveal">
    <h1>${c.h1}</h1>
    <p class="meta">${c.meta}</p>

    <form class="form" id="contactForm" novalidate>
      <input type="checkbox" name="botcheck" style="display:none !important" tabindex="-1" autocomplete="off">

      <div>
        <label for="name">${c.nameLabel}</label>
        <input type="text" id="name" name="name" placeholder="${c.namePlaceholder}" required autocomplete="name">
      </div>
      <div>
        <label for="email">${c.emailLabel}</label>
        <input type="email" id="email" name="email" placeholder="${c.emailPlaceholder}" required autocomplete="email">
      </div>
      <div>
        <label for="subject">${c.subjectLabel}</label>
        <input type="text" id="subject" name="subject" placeholder="${c.subjectPlaceholder}" required>
      </div>
      <div>
        <label for="message">${c.messageLabel}</label>
        <textarea id="message" name="message" placeholder="${c.messagePlaceholder}" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary" id="submitBtn">${c.send}</button>
    </form>

    <div class="success-msg" id="thankYou">
      <div class="check">✓</div>
      <h2>${c.successTitle}</h2>
      <p>${c.successBody}</p>
      <a href="index.html" class="btn btn-ghost">${c.backHome}</a>
    </div>
  </article>
</main>

${footer(t, lang)}
<script>
  document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (this.botcheck && this.botcheck.checked) return;
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = ${JSON.stringify(c.sending)};
    const payload = {
      access_key:  '6161d962-9e6c-4838-8408-2c210109eede',
      from_name:   'EggTimer Max',
      name:        this.name.value,
      email:       this.email.value,
      subject:     '[EggTimer Max] ' + this.subject.value,
      message:     this.message.value,
    };
    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById('contactForm').style.display = 'none';
        document.getElementById('thankYou').style.display = 'block';
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      btn.disabled = false;
      btn.textContent = ${JSON.stringify(c.send)};
      alert(${JSON.stringify(c.alertError)});
    }
  });
</script>
</body>
</html>`;
}

const BUILDERS = { index: pageIndex, guide: pageGuide, support: pageSupport, privacy: pagePrivacy, contact: pageContact };

// ---- run -------------------------------------------------------------------

let count = 0;
for (const lang of LANGS) {
  const t = strings[lang];
  const outDir = lang === 'en' ? DIR : path.join(DIR, lang);
  if (lang !== 'en') fs.mkdirSync(outDir, { recursive: true });
  for (const page of PAGES) {
    const html = BUILDERS[page](t, lang);
    fs.writeFileSync(path.join(outDir, `${page}.html`), html);
    count++;
  }
}
console.log(`generated ${count} pages across ${LANGS.length} languages`);
