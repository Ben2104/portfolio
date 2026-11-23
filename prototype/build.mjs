// Builds the prototype pages from data.mjs: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { projects, cats, icons } from './data.mjs';

// the address is read from the site's own data, never written here
const email = readFileSync('../src/data/portfolio.ts', 'utf8').match(/email:\s*"([^"]+)"/)[1];
const mail = 'mailto:' + email + '?subject=' + encodeURIComponent('Hello Khoi');
const GH = 'https://github.com/Ben2104', LI = 'https://www.linkedin.com/in/hoang-khoi-do';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const arrow = '<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/><path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg>';
const chev = '<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const initials = t => t.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const team = n => n === 1 ? 'Solo' : 'Team of ' + n;
// shape and ink classes icons.mjs printed for each fetched file
const icx = { 'tailwindcss-icon': 'ic-land', 'docker-icon': 'ic-land', playwright: 'ic-land', 'mongodb-icon': 'ic-tall', 'firebase-icon': 'ic-tall', 'html-5': 'ic-tall', sqlite: 'ic-wide', 'openai-icon': 'ic-ink', 'github-icon': 'ic-ink', 'vercel-icon': 'ic-ink', 'langchain-icon': 'ic-ink', threejs: 'ic-ink', fastify: 'ic-wide ic-ink', express: 'ic-wide ic-ink', flask: 'ic-tall ic-ink' };
const icon = (name, a, s = 40) => icons[name] ? '<img class="ic ic-' + s + (icx[icons[name]] ? ' ' + icx[icons[name]] : '') + '" src="' + a + 'assets/icons/' + icons[name] + '.svg" alt="" width="' + s + '" height="' + s + '">' : '';
const tool = (name, a) => '<li class="tool">' + (icons[name] ? '<span class="ic-tile">' + icon(name, a) + '</span>' : '<span class="ic-tile tool__word" aria-hidden="true">' + esc(initials(name)) + '</span>') + '<span class="t-label">' + esc(name) + '</span></li>';

const head = (a, { title, desc, extra = '' }) => `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${a}share.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${a}favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#141414">
<!-- <link rel="canonical" href="https://www.khoido.com/"> -->
<meta name="site-kind" content="software">
<meta name="page-type" content="software">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Mona+Sans:wdth,wght@75..125,400..600&family=Geist+Mono:wght@400..500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${a}assets/system.css">
<link rel="stylesheet" href="${a}assets/ui/cards.css">
<link rel="stylesheet" href="${a}assets/motion/motion.css">
<link rel="stylesheet" href="${a}assets/backgrounds/backgrounds.css">
<link rel="stylesheet" href="${a}assets/layout/layout.css">
<link rel="stylesheet" href="${a}assets/icons/icon.css">
<style>
:root {
  --p-bg: #141414; --p-surface: #1d1d1c; --p-ink: #f2efe9; --p-muted: #8c8b88;
  --p-accent: #ff8a3d; --p-accent-ink: #141414; --p-action: #ff8a3d; --p-action-ink: #141414;
  --p-inv-bg: #f2efe9; --p-inv-surface: #e0ddd8; --p-inv-ink: #141414; --p-inv-muted: #5f5e5c;
  --p-inv-accent: #141414; --p-inv-accent-ink: #f2efe9; --p-inv-action: #141414; --p-inv-action-ink: #f2efe9;
  --font-display: "Mona Sans", system-ui, sans-serif;
  --font-text: "Mona Sans", system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  --display-weight: 500;
  --display-tracking: -0.03em;
  --display-tracking-xl: -0.04em;
  --display-stretch: 104%;
  --ly-scale: 0.96;
}
</style>
<link rel="stylesheet" href="${a}assets/ui/base.css">
<link rel="stylesheet" href="${a}assets/ui/window/fragment.css">
<link rel="stylesheet" href="${a}page.css">
<script>document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700)</script>
<script src="${a}assets/backgrounds/backgrounds.js"></script>
${extra}</head>`;

const nav = a => `<header class="nav">
  <div class="wrap nav__bar">
    <a class="skip-link" href="#top">Skip to content</a>
    <a class="nav__logo" href="${a}index.html#top"><span class="mark mark--initial" aria-hidden="true">K</span>Khoi Do</a>
    <nav class="nav__links" aria-label="Main">
      <div class="nav__item">
        <a class="nav__link" href="${a}index.html#work">Work ${chev}</a>
        <div class="nav__menu">
          <div class="wrap grid">
            <div class="menu-col span-3">
              <p class="t-label">AI and ML</p>
              <a href="${a}work/lobe.html">Lobe<span>Review brain MRI scans together</span></a>
              <a href="${a}work/crisislineai.html">CrisisLineAI<span>AI company until a counselor joins</span></a>
              <a href="${a}work/911-operator-assistant.html">911 Operator Assistant<span>Call audio to a map pin</span></a>
            </div>
            <div class="menu-col span-3">
              <p class="t-label">Web and automation</p>
              <a href="${a}work/material-enhancement-assistant.html">Material Enhancement Assistant<span>Clearer course material for professors</span></a>
              <a href="${a}work/pickleball-bot.html">Pickleball Bot<span>Books courts on a schedule</span></a>
              <a href="${a}index.html#work">All ten projects<span>The full archive with filters</span></a>
            </div>
            <a class="menu-card span-3 start-10" href="${a}work/shape-sign.html">
              <div class="panel"><img class="frame__img" src="${a}img/shape-sign.webp" alt="The Shape-Sign lesson screen with a webcam view of a hand"></div>
              <span class="t-card">Best Overall at BeachHacks 8.0</span>
              <span class="t-small muted">Shape-Sign teaches sign language by webcam.</span>
            </a>
          </div>
        </div>
      </div>
      <div class="nav__item"><a class="nav__link" href="${a}index.html#experience">Experience</a></div>
      <div class="nav__item"><a class="nav__link" href="${a}index.html#tools">Tools</a></div>
      <div class="nav__item"><a class="nav__link" href="${a}index.html#about">About</a></div>
    </nav>
    <div class="nav__actions">
      <a class="btn btn--primary" href="${mail}">Email Khoi</a>
    </div>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-label="Menu"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
  </div>
</header>`;

const links = a => `<div class="closing__links">
      <div class="grid">
        <div class="span-4 stack-4">
          <a class="nav__logo" href="${a}index.html#top"><span class="mark mark--initial" aria-hidden="true">K</span>Khoi Do</a>
          <p class="footer__lede">Software that ships, AI included.</p>
        </div>
        <div class="span-2 footer__col"><h3>Work</h3><ul><li><a href="${a}work/lobe.html">Lobe</a></li><li><a href="${a}work/crisislineai.html">CrisisLineAI</a></li><li><a href="${a}work/shape-sign.html">Shape-Sign</a></li><li><a href="${a}index.html#work">All projects</a></li></ul></div>
        <div class="span-2 footer__col"><h3>Experience</h3><ul><li><a href="${a}index.html#experience">Netsservice</a></li><li><a href="${a}index.html#experience">DFM Europe</a></li><li><a href="${a}index.html#experience">ACM at CSULB</a></li></ul></div>
        <div class="span-2 footer__col"><h3>Tools</h3><ul><li><a href="${a}index.html#tools">Languages</a></li><li><a href="${a}index.html#tools">Frameworks</a></li><li><a href="${a}index.html#tools">AI services</a></li></ul></div>
        <div class="span-2 footer__col"><h3>About</h3><ul><li><a href="${a}index.html#about">Education</a></li><li><a href="${LI}">LinkedIn</a></li><li><a href="${GH}">GitHub</a></li></ul></div>
      </div>
      <div class="footer__legal">
        <span>&copy; 2026 Khoi Do</span>
        <span class="t-small muted">Product names and logos are trademarks of their owners.</span>
      </div>
    </div>`;

const tail = (a, moments) => `<script type="module" src="${a}assets/system.js"></script>
<script type="module" src="${a}assets/motion/motion.js"></script>
<script type="module" src="${a}assets/layout/layout.js"></script>
</body>
</html>
`;

/* ---------------------------------------------------------------- index */
const row = p => `<li class="ui-win__row arc-row" data-row data-peek-to="${p.slug}" data-cat="${p.cat}" data-team="${p.team > 1 ? 'team' : 'solo'}" tabindex="0"><span class="ui-avatar" data-tone="${p.tone}">${initials(p.title)}</span><a class="ui-win__who" href="work/${p.slug}.html">${esc(p.title)}</a><span class="ui-win__sub">${esc(p.short)}</span><span class="ui-win__st${p.award ? ' is-work' : ''}">${p.award ? 'Best Overall' : cats[p.cat]}</span><span class="ui-win__age">${p.year}</span></li>`;
const open = (p, i) => `<article class="arc-open" data-peek-for="${p.slug}"${i ? ' hidden' : ''}>
          <div class="arc-open__bar"><span class="ui-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="arc-open__crumb">${esc(cats[p.cat])} / <b>${esc(p.title)}</b></span></div>
          <div class="arc-open__body">
            <div class="arc-open__shot"><img src="img/${p.img}.webp" alt="${esc(p.title)}, its main screen" loading="lazy"></div>
            <div class="arc-open__text">
              <p class="t-card">${esc(p.title)}</p>
              <p>${esc(p.line)}</p>
              <dl class="arc-open__facts"><div><dt>Year</dt><dd>${p.year}</dd></div><div><dt>Team</dt><dd>${team(p.team)}</dd></div><div><dt>Context</dt><dd>${esc(p.event)}</dd></div></dl>
              <p class="arc-open__stack">${p.stack.slice(0, 5).map(s => '<span>' + (icons[s] ? icon(s, '', 16) : '') + esc(s) + '</span>').join('')}</p>
              <a class="link" href="work/${p.slug}.html">Read the ${esc(p.title)} case study</a>
            </div>
          </div>
        </article>`;
const count = f => projects.filter(f).length;

const index = `<!doctype html>
<html lang="en" data-type="software" data-radius="soft" data-ground="sand" data-buttons="solid" data-motion>
${head('', { title: 'Khoi Do: software engineer for AI and web products', desc: 'Khoi Do builds full-stack and AI software: ten projects, two Best Overall hackathon wins, now at Netsservice and finishing CS at CSULB.', extra: `<script>document.documentElement.classList.add('mo-js');setTimeout(()=>document.documentElement.classList.add('mo-safe'),2500)</script>
<link rel="modulepreload" href="assets/moments/moments.js"><link rel="modulepreload" href="assets/moments/lib.js">
<link rel="modulepreload" href="assets/moments/letters-assemble/moment.js"><link rel="modulepreload" href="assets/moments/iris-opens/moment.js">
` })}
<body>
<!-- type: software (a portfolio of software projects; site-kind software)
     deal: hero collage -> replaced by the client's Canva hero (giant name, cut-out portrait in front: deviation, the client's own design),
     nav nav-mega, close close-word, footer footer-columns, rhythm space, buttons solid, mark initial (K), grounds none
     palette: the client's Canva colours via start.mjs brand (#141414 / #f2efe9 / #ff8a3d), type mona
     moments: letters-assemble (#approach, statement), iris-opens (#about, the move to the light ground)
     deviation: the app-frame is a working archive (rows link to case studies, hover previews), not role=img -->
${nav('')}

<main id="top">
  <section class="hero hero--name" data-enter aria-labelledby="hero-h">
    <p class="hero__name" aria-hidden="true">Khoi Do</p>
      <img class="hero__cut" src="img/portrait-cut.webp" alt="Khoi Do in a dark suit, hands folded" width="900" height="2194" fetchpriority="high">
    <div class="wrap"><div class="hero-text">
      <div class="grid hero__foot">
        <div class="hero-copy span-4">
          <p class="hero-notice"><b>Software engineer</b>, Long Beach, California</p>
          <h1 id="hero-h">Full-stack engineer for AI products</h1>
          <p class="t-lead">I build the screens people use and the parts that talk to the model. Two of my hackathon projects won Best Overall.</p>
          <div class="btn-row">
            <a class="btn btn--primary" href="#work">See the projects${arrow}</a>
            <a class="btn btn--secondary" href="${GH}">View GitHub</a>
          </div>
        </div>
        <dl class="hero-facts hero-facts--col span-3 start-10">
          <div><dt>Now</dt><dd>Full stack developer, Netsservice</dd></div>
          <div><dt>Studying</dt><dd>Computer science, CSULB, Dec 2026</dd></div>
          <div><dt>Shipped</dt><dd>${projects.length} projects, 2 hackathon wins</dd></div>
        </dl>
      </div>
    </div></div>
  </section>

  <section class="section g2m" id="work" aria-labelledby="work-h">
    <div class="wrap">
      <div class="grid grid--top">
        <h2 id="work-h" class="span-5">Software I have built</h2>
        <div class="span-6 start-7 stack-4">
          <p>Point at a project to see its screen and stack, then open the case study for the problem, my part and how it works.</p>
          <a class="link" href="work/lobe.html">Read the Lobe case study</a>
        </div>
      </div>
      <div class="ui app fill" data-peek aria-label="Project archive">
        <div class="app__pane app__pane--list">
          <div class="ui ui-panel ui-win">
            <div class="ui-win__bar">
              <span class="ui-dots" aria-hidden="true"><i></i><i></i><i></i></span>
              <span class="ui-win__crumb">Khoi <i>/</i> <b>Projects</b></span>
              <span class="ui-spacer"></span>
            </div>
            <div class="ui-win__body">
              <div class="ui-win__side" role="group" aria-label="Filter projects">
                <button class="ui-win__nav is-on" type="button" data-filter="all" aria-pressed="true">All<em>${projects.length}</em></button>
                <button class="ui-win__nav" type="button" data-filter="ai" aria-pressed="false">AI and ML<em>${count(p => p.cat === 'ai')}</em></button>
                <button class="ui-win__nav" type="button" data-filter="web" aria-pressed="false">Web apps<em>${count(p => p.cat === 'web')}</em></button>
                <button class="ui-win__nav" type="button" data-filter="auto" aria-pressed="false">Automation<em>${count(p => p.cat === 'auto')}</em></button>
                <span class="ui-win__label">Built by</span>
                <button class="ui-win__nav" type="button" data-filter="team" aria-pressed="false"><span class="ui-win__hash">#</span>A team<em>${count(p => p.team > 1)}</em></button>
                <button class="ui-win__nav" type="button" data-filter="solo" aria-pressed="false"><span class="ui-win__hash">#</span>Me alone<em>${count(p => p.team === 1)}</em></button>
              </div>
              <div class="ui-win__main">
                <div class="ui-win__cols" aria-hidden="true"><span>Project</span><span>What it does</span><span>Kind</span><span>Year</span></div>
                <ul class="ui-win__rows">
                  ${projects.map(row).join('\n                  ')}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="app__pane app__pane--open">
        ${projects.map(open).join('\n        ')}
        </div>
      </div>
    </div>
  </section>

  <section class="section statement" id="approach" data-moment="letters-assemble" aria-labelledby="approach-h">
    <div class="wrap">
      <h2 class="mo-la__type" id="approach-h">Ship the weekend build</h2>
      <p class="mo-la__sub">Most of these began at a hackathon with three or four people. I usually take the interface: the screens people touch and the calls that reach the model.</p>
    </div>
  </section>

  <section class="section" id="experience" aria-labelledby="experience-h">
    <div class="wrap">
      <div class="section-head section-head--row">
        <h2 id="experience-h">Work history</h2>
        <a class="link" href="${LI}">See the full history on LinkedIn</a>
      </div>
      <ol class="grid rail">
        <li class="span-3">
          <div class="panel rail__panel"><p class="t-stat">58 → 94</p><p class="t-small">Lighthouse performance score</p></div>
          <span class="rail__dot" aria-hidden="true"></span>
          <p class="t-label muted">Jan to May 2026</p>
          <p class="t-card">Webmaster, ACM at CSULB</p>
          <p>Rebuilt the club site in Next.js for 1,000+ monthly visitors.</p>
        </li>
        <li class="span-3">
          <div class="panel rail__panel"><p class="t-stat">60% → 87%</p><p class="t-small">Drawing accuracy after the rebuild</p></div>
          <span class="rail__dot" aria-hidden="true"></span>
          <p class="t-label muted">May to Aug 2026</p>
          <p class="t-card">Software intern, DFM Europe</p>
          <p>LangGraph agents turning 3D models into 2D drawings.</p>
        </li>
        <li class="span-3">
          <div class="panel rail__panel"><p class="t-stat">4 people</p><p class="t-small">A faculty-mentored sensor research team</p></div>
          <span class="rail__dot" aria-hidden="true"></span>
          <p class="t-label muted">Jun 2026 to now</p>
          <p class="t-card">Project manager, AI Club</p>
          <p>Scope, milestones and CI/CD pipelines to Render.</p>
        </li>
        <li class="span-3">
          <div class="panel rail__panel rail__panel--icons"><span class="ic-tile">${icon('Swift', '')}</span><span class="ic-tile">${icon('Fastify', '')}</span><p class="t-small">iOS app, Fastify API, WebSockets</p></div>
          <span class="rail__dot" aria-hidden="true"></span>
          <p class="t-label muted">Aug 2026 to now</p>
          <p class="t-card">Full stack developer, Netsservice</p>
          <p>An iOS ride-hailing app in SwiftUI, remote from Denmark.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="section" id="tools" aria-labelledby="tools-h">
    <div class="wrap">
      <div class="grid grid--top">
        <h2 id="tools-h" class="span-5">Languages, frameworks and APIs</h2>
        <p class="span-6 start-7">Every tool here is in at least one project or job above. TypeScript and Python carry most of it; the models change with the job.</p>
      </div>
      <div class="grid"><div class="frame span-12 tools-frame"><ul class="tools">
        ${['TypeScript', 'JavaScript', 'Python', 'Swift', 'React', 'Next.js', 'Node.js', 'FastAPI', 'Tailwind CSS', 'React Three Fiber', 'Express', 'Flask', 'TensorFlow', 'Docker', 'GitHub Actions', 'Playwright', 'MongoDB', 'Firebase', 'SQLite', 'Vercel', 'OpenAI API', 'Claude API', 'Gemini', 'Twilio'].map(t => tool(t, '')).join('\n        ')}
      </ul></div></div>
    </div>
  </section>

  <section class="section ground-inverse" id="about" data-moment="iris-opens" data-moment-opts='{"from": "base"}' aria-labelledby="about-h">
    <div class="wrap grid grid--top">
      <div class="span-6 stack-4">
        <h2 id="about-h">About Khoi</h2>
        <p class="t-lead">I study computer science at Cal State Long Beach and build software for Netsservice, a team in Denmark. Before CSULB I was at De Anza College, tutoring C++ and fixing laptops for students who needed one.</p>
        <ul class="rows about__rows">
          <li><span class="rows__name">B.S. Computer Science, CSULB</span><span class="rows__value">Dec 2026</span></li>
          <li><span class="rows__name">De Anza College</span><span class="rows__value">2022 to 2024</span></li>
          <li><span class="rows__name">Instructional student assistant, CSULB</span><span class="rows__value">150+ students a term</span></li>
        </ul>
      </div>
      <figure class="about__photo span-5 start-8"><img src="img/photo-about.webp" alt="Khoi Do in a suit by a window, in warm light" loading="lazy" width="1064" height="1600"></figure>
    </div>
  </section>
</main>

<footer class="footer closing" id="contact" aria-labelledby="close-h">
  <div class="wrap">
    <div class="closing__cta close--word">
      <div class="section-head--split">
        <div><h2 id="close-h">Hiring for a software role?</h2><p class="t-lead">Write to me. I answer within a day.</p></div>
        <a class="btn btn--primary" href="${mail}">Email Khoi${arrow}</a>
      </div>
      <p class="close__word" aria-hidden="true">Khoi Do</p>
    </div>
    ${links('')}
  </div>
</footer>
<script>
// the archive's filters: show the rows of one kind, keep the open item on a visible row
document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => {
  const f = b.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b); });
  const rows = [...document.querySelectorAll('.arc-row')];
  rows.forEach(r => { r.hidden = !(f === 'all' || r.dataset.cat === f || r.dataset.team === f); });
  rows.find(r => !r.hidden)?.dispatchEvent(new FocusEvent('focusin'));
}));
</script>
${tail('')}`;
writeFileSync('index.html', index);

/* ---------------------------------------------------------------- case studies */
mkdirSync('work', { recursive: true });
projects.forEach((p, i) => {
  const next = projects[(i + 1) % projects.length];
  const L = p.links;
  const btns = [L.live && '<a class="btn btn--primary" href="' + L.live + '">Open the live app' + arrow + '</a>',
    L.source && '<a class="btn ' + (L.live ? 'btn--secondary' : 'btn--primary') + '" href="' + L.source + '">View the source' + (L.live ? '' : arrow) + '</a>',
    !L.live && L.devpost && '<a class="btn btn--secondary" href="' + L.devpost + '">See it on Devpost</a>'].filter(Boolean).slice(0, 2).join('\n            ');
  const page = `<!doctype html>
<html lang="en" data-type="software" data-radius="soft" data-ground="sand" data-buttons="solid" data-motion>
${head('../', { title: p.title + ': a case study by Khoi Do', desc: p.line })}
<body>
${nav('../')}
<main id="top">
  <section class="hero hero--case" data-enter aria-labelledby="hero-h">
    <div class="wrap"><div class="hero-text">
      <div class="grid grid--top">
        <div class="hero-copy span-5">
          <p class="hero-notice"><a class="link" href="../index.html#work">All projects</a> · <b>${esc(p.event)}</b></p>
          <h1 id="hero-h">${esc(p.title)}</h1>
          <p class="t-lead">${esc(p.line)}</p>
          <div class="btn-row">
            ${btns}
          </div>
          <dl class="hero-facts">
            <div><dt>Year</dt><dd>${p.year}</dd></div>
            <div><dt>Team</dt><dd>${team(p.team)}</dd></div>
            <div><dt>Kind</dt><dd>${cats[p.cat]}</dd></div>
          </dl>
        </div>
        <div class="hero-visual frame frame--photo case__shot span-7 start-6">
          <img class="frame__img" src="../img/${p.img}.webp" alt="${esc(p.title)}, its main screen" fetchpriority="high">
        </div>
      </div>
    </div></div>
  </section>

  <section class="section" id="overview" aria-labelledby="overview-h">
    <div class="wrap">
      <h2 id="overview-h">The problem and the fix</h2>
      <div class="grid grid--top case__pair">
        <div class="span-6 stack-4"><p class="t-label muted">Problem</p><p class="t-lead">${esc(p.problem)}</p></div>
        <div class="span-6 stack-4"><p class="t-label muted">What we built</p><p class="t-lead">${esc(p.solution)}</p></div>
      </div>
      <ol class="grid case__flow">
        ${p.flow.map((s, k) => '<li class="span-3"><span class="case__step">' + (k + 1) + '</span><p>' + esc(s) + '</p></li>').join('\n        ')}
      </ol>
    </div>
  </section>

  <section class="section" id="build" aria-labelledby="build-h">
    <div class="wrap grid grid--top">
      <div class="span-5 stack-4">
        <h2 id="build-h">My part</h2>
        <p class="t-lead">${esc(p.role)}</p>
        <ul class="tools tools--case">
          ${p.stack.map(t => tool(t, '../')).join('\n          ')}
        </ul>
      </div>
      <ul class="rows span-6 start-7 case__features">
        ${p.features.map(([h, d]) => '<li><span class="rows__name">' + esc(h) + '<small>' + esc(d) + '</small></span></li>').join('\n        ')}
      </ul>
    </div>
  </section>
</main>

<footer class="footer closing" id="contact" aria-labelledby="close-h">
  <div class="wrap">
    <div class="closing__cta close--word">
      <div class="section-head--split">
        <div><h2 id="close-h">Next project: ${esc(next.title)}</h2><p class="t-lead">${esc(next.line)}</p></div>
        <a class="btn btn--primary" href="${next.slug}.html">Read the ${esc(next.title)} case study${arrow}</a>
      </div>
      <p class="close__word" aria-hidden="true">${esc(p.title.length > 14 ? initials(p.title) : p.title)}</p>
    </div>
    ${links('../')}
  </div>
</footer>
${tail('../')}`;
  writeFileSync('work/' + p.slug + '.html', page);
});
console.log('built index.html and', projects.length, 'case studies');
