/* =========================================================================
   Panel para añadir, editar y borrar chapas desde el móvil.

   Quién puede escribir NO lo decide esta página: lo deciden las reglas de
   seguridad de Supabase (supabase/setup.sql). Sin sesión iniciada, la base
   de datos rechaza cualquier cambio aunque alguien manipule este código.
   ========================================================================= */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const cfg = window.SUPABASE_CONFIG || {};
const { countryName, flagUrl, sortedCountries } = window.Countries;

const BUCKET = 'caps';
const MAX_SIDE = 900;      // px: las fotos del móvil se reducen antes de subir
const JPEG_QUALITY = 0.85;

const $ = (sel) => document.querySelector(sel);
const state = { caps: [], editing: null, photoBlob: null, photoRemoved: false, q: '' };

/* ---------- arranque ---------- */

let supabase = null;

if (cfg.url && cfg.anonKey) {
  supabase = createClient(cfg.url, cfg.anonKey);
  const { data: { session } } = await supabase.auth.getSession();
  showView(session);
  supabase.auth.onAuthStateChange((_event, newSession) => showView(newSession));
} else {
  // Sin configurar todavía: se explica qué falta y no se muestra nada más.
  $('#notConfigured').hidden = false;
  $('#sessionLine').textContent = 'Sin configurar';
}

function showView(session) {
  const logged = Boolean(session);
  $('#loginView').hidden = logged;
  $('#panelView').hidden = !logged;
  $('#logout').hidden = !logged;
  $('#sessionLine').textContent = logged
    ? shortName(session.user.email)
    : 'Entra para editar la colección';
  if (logged) loadCaps();
}

const shortName = (email) => String(email || '').split('@')[0];

/* ---------- login ---------- */

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = $('#loginBtn');
  const raw = $('#user').value.trim();
  const email = raw.includes('@') ? raw : `${raw}@${cfg.loginDomain || 'chapas.local'}`;

  button.disabled = true;
  $('#loginError').textContent = '';

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: $('#pass').value,
  });

  button.disabled = false;
  if (error) {
    $('#loginError').textContent = 'Usuario o contraseña incorrectos.';
    return;
  }
  $('#pass').value = '';
});

$('#logout').addEventListener('click', async () => {
  await supabase.auth.signOut();
});

/* ---------- lista ---------- */

async function loadCaps() {
  const { data, error } = await supabase
    .from('caps')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return toast('No se ha podido cargar la lista', true);

  state.caps = data || [];
  renderList();
}

function renderList() {
  const q = state.q.trim().toLowerCase();
  const caps = q
    ? state.caps.filter((cap) => [cap.name, cap.producer, cap.city, cap.style, countryName(cap.country_code)]
        .filter(Boolean).join(' ').toLowerCase().includes(q))
    : state.caps;

  $('#capList').innerHTML = caps.map((cap) => `
    <li>
      <button type="button" class="cap-row" data-id="${cap.id}">
        <span class="cap-thumb">${cap.image
          ? `<img src="${escapeAttr(cap.image)}" alt="" loading="lazy">`
          : `<span class="cap-thumb-ph">${escapeHtml(initials(cap.name))}</span>`}</span>
        <span class="cap-row-text">
          <strong>${escapeHtml(cap.name)}</strong>
          <small>
            <img class="flag" src="${flagUrl(cap.country_code)}" alt="" width="17" height="12">
            ${escapeHtml(countryName(cap.country_code))}
            ${cap.type === 'soda' ? '· Refresco' : '· Cerveza'}
          </small>
        </span>
        <span class="cap-row-go" aria-hidden="true">&#8250;</span>
      </button>
    </li>`).join('');

  $('#panelCount').textContent = `${state.caps.length} chapas · ${new Set(state.caps.map((c) => c.country_code)).size} países`;
  $('#panelEmpty').hidden = state.caps.length > 0;
}

$('#adminSearch').addEventListener('input', (event) => {
  state.q = event.target.value;
  renderList();
});

$('#capList').addEventListener('click', (event) => {
  const row = event.target.closest('.cap-row');
  if (row) openForm(state.caps.find((cap) => cap.id === row.dataset.id));
});

/* ---------- formulario ---------- */

const countrySelect = $('#fCountry');
countrySelect.innerHTML = sortedCountries('es')
  .map(({ code, name }) => `<option value="${code}">${escapeHtml(name)}</option>`).join('');

$('#addBtn').addEventListener('click', () => openForm(null));

function openForm(cap) {
  state.editing = cap || null;
  state.photoBlob = null;
  state.photoRemoved = false;

  $('#formTitle').textContent = cap ? 'Editar chapa' : 'Nueva chapa';
  $('#deleteBtn').hidden = !cap;
  $('#formError').textContent = '';

  $('#fName').value = cap?.name || '';
  $('#fType').value = cap?.type || 'beer';
  $('#fCountry').value = cap?.country_code || 'ES';
  $('#fProducer').value = cap?.producer || '';
  $('#fCity').value = cap?.city || '';
  $('#fStyle').value = cap?.style || '';
  $('#fAbv').value = cap?.abv || '';
  $('#fYear').value = cap?.year || '';
  $('#fNotes').value = cap?.notes || '';

  setPreview(cap?.image || null);
  $('#formDialog').showModal();
}

function setPreview(src) {
  const preview = $('#photoPreview');
  preview.innerHTML = src ? `<img src="${escapeAttr(src)}" alt="">` : '<span>Sin foto</span>';
  $('#photoClear').hidden = !src;
}

for (const id of ['#photoCamera', '#photoFile']) {
  $(id).addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      state.photoBlob = await shrink(file);
      state.photoRemoved = false;
      setPreview(URL.createObjectURL(state.photoBlob));
    } catch {
      $('#formError').textContent = 'No se ha podido procesar esa imagen.';
    }
  });
}

$('#photoClear').addEventListener('click', () => {
  state.photoBlob = null;
  state.photoRemoved = true;
  setPreview(null);
});

document.querySelectorAll('[data-cancel]').forEach((button) => {
  button.addEventListener('click', () => $('#formDialog').close());
});

/* Reduce la foto en el propio móvil: subir 4 MB por chapa no tiene sentido. */
function shrink(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(image.src);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('sin blob'))),
        'image/jpeg',
        JPEG_QUALITY,
      );
    };
    image.onerror = () => reject(new Error('imagen ilegible'));
    image.src = URL.createObjectURL(file);
  });
}

/* ---------- guardar ---------- */

$('#saveBtn').addEventListener('click', async () => {
  const name = $('#fName').value.trim();
  if (!name) {
    $('#formError').textContent = 'Ponle un nombre, al menos.';
    return;
  }

  const button = $('#saveBtn');
  button.disabled = true;
  button.textContent = 'Guardando…';
  $('#formError').textContent = '';

  try {
    let image = state.editing?.image || null;

    if (state.photoBlob) {
      const path = `${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, state.photoBlob, { contentType: 'image/jpeg', upsert: false });
      if (uploadError) throw uploadError;
      image = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    } else if (state.photoRemoved) {
      image = null;
    }

    const row = {
      name,
      type: $('#fType').value,
      country_code: $('#fCountry').value,
      producer: value('#fProducer'),
      city: value('#fCity'),
      style: value('#fStyle'),
      abv: value('#fAbv'),
      year: value('#fYear'),
      notes: value('#fNotes'),
      image,
    };

    const { error } = state.editing
      ? await supabase.from('caps').update(row).eq('id', state.editing.id)
      : await supabase.from('caps').insert(row);
    if (error) throw error;

    $('#formDialog').close();
    toast(state.editing ? 'Chapa actualizada' : 'Chapa añadida');
    loadCaps();
  } catch (error) {
    console.error(error);
    $('#formError').textContent = 'No se ha podido guardar. Revisa la conexión e inténtalo otra vez.';
  } finally {
    button.disabled = false;
    button.textContent = 'Guardar';
  }
});

const value = (sel) => $(sel).value.trim() || null;

/* ---------- borrar ---------- */

$('#deleteBtn').addEventListener('click', async () => {
  const cap = state.editing;
  if (!cap) return;
  if (!confirm(`¿Borrar "${cap.name}" de la colección?`)) return;

  const { error } = await supabase.from('caps').delete().eq('id', cap.id);
  if (error) {
    $('#formError').textContent = 'No se ha podido borrar.';
    return;
  }

  // La foto del almacén se va con ella.
  if (cap.image) {
    const path = cap.image.split(`/${BUCKET}/`).pop();
    if (path) await supabase.storage.from(BUCKET).remove([path]);
  }

  $('#formDialog').close();
  toast('Chapa borrada');
  loadCaps();
});

/* ---------- utilidades ---------- */

let toastTimer;
function toast(message, isError = false) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.toggle('is-error', isError);
  element.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { element.hidden = true; }, 2600);
}

function initials(name) {
  return String(name || '?')
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .trim().split(/\s+/).slice(0, 2)
    .map((word) => word[0].toUpperCase()).join('');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}
const escapeAttr = escapeHtml;
