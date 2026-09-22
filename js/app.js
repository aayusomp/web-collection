/* =========================================================================
   Colección de chapas — lógica de la web pública.
   Sin dependencias ni build: se abre tal cual en cualquier navegador.
   ========================================================================= */

/* ---- de qué continente es cada país (código ISO de 2 letras) ---- */
const CONTINENT_CODES = {
  europe: 'AD AL AT BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GI GR HR HU IE IS IT LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SK SM TR UA VA XK',
  america: 'AG AR AW BB BM BO BR BS BZ CA CL CO CR CU CW DM DO EC GD GT GY HN HT JM KN KY LC MX NI PA PE PR PY SR SV TT US UY VC VE',
  asia: 'AE AF AM AZ BD BH BN BT CN GE HK ID IL IN IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MO MV MY NP OM PH PK PS QA SA SG SY TH TJ TL TM TW UZ VN YE',
  africa: 'AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RW SC SD SL SN SO SS ST SZ TD TG TN TZ UG ZA ZM ZW',
  oceania: 'AS AU CK FJ FM GU KI MH NC NR NU NZ PF PG PW SB TO TV VU WS',
};

const CONTINENT_OF = {};
for (const [continent, codes] of Object.entries(CONTINENT_CODES)) {
  for (const code of codes.split(' ')) CONTINENT_OF[code] = continent;
}

/* ---- textos ---- */
const I18N = {
  es: {
    skip: 'Ir al contenido',
    siteTitle: 'Mi colección de chapas',
    siteTagline: 'Cervezas y refrescos de todo el mundo',
    intro: 'Colecciono chapas desde hace años: cervezas, refrescos y todo lo que lleve una corona de metal. Cada una es el recuerdo de un sitio, un viaje o una buena tarde. Aquí está la colección al completo.',
    statCaps: 'Chapas', statCountries: 'Países', statBeers: 'Cervezas', statSodas: 'Refrescos',
    searchPh: 'Buscar marca, país, estilo…',
    country: 'País', sort: 'Orden',
    sortCountry: 'Por país', sortName: 'Por nombre', sortRecent: 'Añadidas recientemente',
    allTypes: 'Todas', beer: 'Cerveza', soda: 'Refresco',
    allContinents: 'Todo el mundo',
    europe: 'Europa', america: 'América', asia: 'Asia', africa: 'África', oceania: 'Oceanía', other: 'Otros',
    allCountries: 'Todos los países',
    results: (n, t) => n === t ? `${n} chapas en la colección` : `${n} de ${t} chapas`,
    emptyTitle: 'No hay chapas que coincidan.',
    clearFilters: 'Quitar los filtros',
    producer: 'Fabricante', city: 'Ciudad', abv: 'Alcohol', style: 'Estilo', year: 'Año', type: 'Tipo',
    footer: (n, c) => `${n} chapas de ${c} países. Actualizada continuamente.`,
    loadError: 'No se han podido cargar los datos de la colección.',
  },
  en: {
    skip: 'Skip to content',
    siteTitle: 'My bottle cap collection',
    siteTagline: 'Beer and soft drinks from around the world',
    intro: 'I have been collecting bottle caps for years: beers, soft drinks and anything that comes with a metal crown. Each one is a memory of a place, a trip or a good afternoon. Here is the whole collection.',
    statCaps: 'Caps', statCountries: 'Countries', statBeers: 'Beers', statSodas: 'Soft drinks',
    searchPh: 'Search brand, country, style…',
    country: 'Country', sort: 'Sort',
    sortCountry: 'By country', sortName: 'By name', sortRecent: 'Recently added',
    allTypes: 'All', beer: 'Beer', soda: 'Soft drink',
    allContinents: 'Worldwide',
    europe: 'Europe', america: 'America', asia: 'Asia', africa: 'Africa', oceania: 'Oceania', other: 'Other',
    allCountries: 'All countries',
    results: (n, t) => n === t ? `${n} caps in the collection` : `${n} of ${t} caps`,
    emptyTitle: 'No caps match those filters.',
    clearFilters: 'Clear the filters',
    producer: 'Producer', city: 'City', abv: 'ABV', style: 'Style', year: 'Year', type: 'Type',
    footer: (n, c) => `${n} caps from ${c} countries. Updated all the time.`,
    loadError: 'The collection data could not be loaded.',
  },
};

/* ---- estado ---- */
const state = {
  lang: 'es',
  type: 'all',
  continent: 'all',
  country: 'all',
  q: '',
  sort: 'country',
  items: [],
  visible: [],
  lbIndex: 0,
};

const $ = (sel) => document.querySelector(sel);
const t = (key) => I18N[state.lang][key];

/* ---- utilidades ---- */
const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* modo privado */ } },
};

function countryName(code, lang = state.lang) {
  if (!code) return '';
  try {
    return new Intl.DisplayNames([lang], { type: 'region' }).of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

const flagUrl = (code) => `https://flagcdn.com/w40/${String(code || '').toLowerCase()}.png`;
const continentOf = (item) => CONTINENT_OF[String(item.countryCode || '').toUpperCase()] || 'other';

/* Color estable para la chapa de relleno cuando todavía no hay foto. */
function placeholderColors(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  return [`hsl(${hash} 62% 42%)`, `hsl(${hash} 62% 30%)`];
}

function initials(name) {
  return String(name || '?')
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function capMarkup(item, sizeAttr = '') {
  if (item.image) {
    const alt = `${item.name} — ${countryName(item.countryCode)}`;
    return `<span class="cap"><img src="${escapeAttr(item.image)}" alt="${escapeAttr(alt)}" loading="lazy" decoding="async"${sizeAttr}
      onerror="this.parentNode.innerHTML = window.capPlaceholder(${escapeAttr(JSON.stringify(item.name))})"></span>`;
  }
  return `<span class="cap">${capPlaceholder(item.name)}</span>`;
}

function capPlaceholder(name) {
  const [c1, c2] = placeholderColors(String(name));
  return `<span class="cap-ph" style="--c1:${c1};--c2:${c2}"><span>${escapeHtml(initials(name))}</span></span>`;
}
window.capPlaceholder = capPlaceholder;

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}
const escapeAttr = (str) => escapeHtml(str);

/* ---- filtrado ---- */
function applyFilters() {
  const q = state.q.trim().toLowerCase();
  let items = state.items.filter((item) => {
    if (state.type !== 'all' && item.type !== state.type) return false;
    if (state.continent !== 'all' && continentOf(item) !== state.continent) return false;
    if (state.country !== 'all' && item.countryCode !== state.country) return false;
    if (q && !item._haystack.includes(q)) return false;
    return true;
  });

  const collator = new Intl.Collator(state.lang);
  if (state.sort === 'name') {
    items.sort((a, b) => collator.compare(a.name, b.name));
  } else if (state.sort === 'recent') {
    items.sort((a, b) => String(b.addedAt || '').localeCompare(String(a.addedAt || '')));
  } else {
    items.sort((a, b) =>
      collator.compare(countryName(a.countryCode), countryName(b.countryCode)) ||
      collator.compare(a.name, b.name));
  }

  state.visible = items;
  return items;
}

/* ---- render ---- */
function renderGrid() {
  const items = applyFilters();
  const grid = $('#grid');

  grid.innerHTML = items.map((item, index) => `
    <button type="button" class="card" data-index="${index}">
      ${capMarkup(item)}
      <span class="card-name">${escapeHtml(item.name)}</span>
      <span class="card-sub">
        <img class="flag" src="${flagUrl(item.countryCode)}" alt="" loading="lazy" width="17" height="12">
        ${escapeHtml(countryName(item.countryCode))}
      </span>
    </button>`).join('');

  $('#empty').hidden = items.length > 0;
  $('#results').textContent = t('results')(items.length, state.items.length);
}

function renderChips() {
  const countBy = (predicate) => state.items.filter(predicate).length;

  const types = [
    { value: 'all', label: t('allTypes'), n: state.items.length },
    { value: 'beer', label: t('beer'), n: countBy((i) => i.type === 'beer') },
    { value: 'soda', label: t('soda'), n: countBy((i) => i.type === 'soda') },
  ];
  $('#typeChips').innerHTML = types.map((c) => chip(c, state.type)).join('');

  const present = ['europe', 'america', 'asia', 'africa', 'oceania', 'other']
    .map((key) => ({ value: key, label: t(key), n: countBy((i) => continentOf(i) === key) }))
    .filter((c) => c.n > 0);
  const continents = [{ value: 'all', label: t('allContinents'), n: state.items.length }, ...present];
  $('#continentChips').innerHTML = continents.map((c) => chip(c, state.continent)).join('');
}

function chip({ value, label, n }) {
  return `<button type="button" class="chip" data-value="${value}" aria-pressed="false">
    ${escapeHtml(label)} <span class="n">${n}</span></button>`;
}

function syncChipState() {
  $('#typeChips').querySelectorAll('.chip').forEach((el) => {
    el.setAttribute('aria-pressed', String(el.dataset.value === state.type));
  });
  $('#continentChips').querySelectorAll('.chip').forEach((el) => {
    el.setAttribute('aria-pressed', String(el.dataset.value === state.continent));
  });
}

function renderCountrySelect() {
  const codes = [...new Set(state.items
    .filter((i) => state.continent === 'all' || continentOf(i) === state.continent)
    .map((i) => i.countryCode))];
  const collator = new Intl.Collator(state.lang);
  codes.sort((a, b) => collator.compare(countryName(a), countryName(b)));

  if (!codes.includes(state.country)) state.country = 'all';

  $('#countrySelect').innerHTML =
    `<option value="all">${escapeHtml(t('allCountries'))}</option>` +
    codes.map((code) => {
      const n = state.items.filter((i) => i.countryCode === code).length;
      return `<option value="${code}"${code === state.country ? ' selected' : ''}>${escapeHtml(countryName(code))} (${n})</option>`;
    }).join('');
}

function renderStats() {
  const countries = new Set(state.items.map((i) => i.countryCode)).size;
  $('#statTotal').textContent = state.items.length;
  $('#statCountries').textContent = countries;
  $('#statBeers').textContent = state.items.filter((i) => i.type === 'beer').length;
  $('#statSodas').textContent = state.items.filter((i) => i.type === 'soda').length;
  $('#footerLine').textContent = t('footer')(state.items.length, countries);
}

function renderTexts() {
  document.documentElement.lang = state.lang;
  document.title = t('siteTitle');
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = I18N[state.lang][el.dataset.i18n];
    if (typeof value === 'string') el.textContent = value;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    el.placeholder = I18N[state.lang][el.dataset.i18nPh];
  });
  document.querySelectorAll('[data-lang]').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.lang === state.lang);
  });
}

function renderAll() {
  renderTexts();
  renderStats();
  renderChips();
  syncChipState();
  renderCountrySelect();
  renderGrid();
}

/* ---- lightbox ---- */
function openLightbox(index) {
  state.lbIndex = index;
  fillLightbox();
  const dialog = $('#lightbox');
  if (!dialog.open) dialog.showModal();
}

function fillLightbox() {
  const item = state.visible[state.lbIndex];
  if (!item) return;

  $('#lbFigure').innerHTML = capMarkup(item);
  $('#lbKicker').textContent = t(item.type === 'soda' ? 'soda' : 'beer');
  $('#lbName').textContent = item.name;
  $('#lbProducer').textContent = item.producer || item.brand || '';
  $('#lbNotes').textContent = (item.notes && item.notes[state.lang]) || item.notes || '';

  const rows = [
    [t('country'), `<img class="flag" src="${flagUrl(item.countryCode)}" alt="" width="17" height="12"> ${escapeHtml(countryName(item.countryCode))}`],
    [t('city'), item.city && escapeHtml(item.city)],
    [t('style'), item.style && escapeHtml(item.style)],
    [t('abv'), item.abv && escapeHtml(item.abv)],
    [t('year'), item.year && escapeHtml(item.year)],
  ].filter(([, value]) => value);

  $('#lbMeta').innerHTML = rows
    .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${value}</dd></div>`)
    .join('');
}

function stepLightbox(step) {
  const total = state.visible.length;
  if (!total) return;
  state.lbIndex = (state.lbIndex + step + total) % total;
  fillLightbox();
}

/* ---- tema ---- */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  store.set('theme', theme);
}

function currentTheme() {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'dark' || explicit === 'light') return explicit;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/* ---- eventos ---- */
function wireEvents() {
  $('#search').addEventListener('input', (e) => {
    state.q = e.target.value;
    renderGrid();
  });

  $('#typeChips').addEventListener('click', (e) => {
    const chipEl = e.target.closest('.chip');
    if (!chipEl) return;
    state.type = chipEl.dataset.value;
    syncChipState();
    renderGrid();
  });

  $('#continentChips').addEventListener('click', (e) => {
    const chipEl = e.target.closest('.chip');
    if (!chipEl) return;
    state.continent = chipEl.dataset.value;
    state.country = 'all';
    syncChipState();
    renderCountrySelect();
    renderGrid();
  });

  $('#countrySelect').addEventListener('change', (e) => {
    state.country = e.target.value;
    renderGrid();
  });

  $('#sortSelect').addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderGrid();
  });

  $('#clearFilters').addEventListener('click', () => {
    Object.assign(state, { type: 'all', continent: 'all', country: 'all', q: '' });
    $('#search').value = '';
    syncChipState();
    renderCountrySelect();
    renderGrid();
  });

  $('#grid').addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) openLightbox(Number(card.dataset.index));
  });

  const dialog = $('#lightbox');
  dialog.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') || e.target === dialog) return dialog.close();
    const nav = e.target.closest('[data-step]');
    if (nav) stepLightbox(Number(nav.dataset.step));
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') stepLightbox(1);
    if (e.key === 'ArrowLeft') stepLightbox(-1);
  });

  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.lang = btn.dataset.lang;
      store.set('lang', state.lang);
      renderAll();
      if (dialog.open) fillLightbox();
    });
  });

  $('#themeToggle').addEventListener('click', () => {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
}

/* ---- carga de datos ----
   Hoy lee data/collection.js. El día que conectemos el panel de administración,
   basta con que esta función devuelva las chapas del servidor: nada más cambia. */
async function loadCollection() {
  return Array.isArray(window.COLLECTION) ? window.COLLECTION : [];
}

function prepare(items) {
  return items.map((item) => ({
    ...item,
    countryCode: String(item.countryCode || '').toUpperCase(),
    _haystack: [item.name, item.brand, item.producer, item.style, item.city,
      countryName(item.countryCode, 'es'), countryName(item.countryCode, 'en')]
      .filter(Boolean).join(' ').toLowerCase(),
  }));
}

async function init() {
  const savedTheme = store.get('theme');
  if (savedTheme) {
    document.documentElement.dataset.theme = savedTheme;
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  const savedLang = store.get('lang');
  state.lang = savedLang === 'en' || savedLang === 'es'
    ? savedLang
    : (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';

  try {
    state.items = prepare(await loadCollection());
  } catch (error) {
    console.error(error);
    $('#results').textContent = t('loadError');
  }

  wireEvents();
  renderAll();
}

init();
