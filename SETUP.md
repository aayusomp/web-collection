# Puesta en marcha

Tres cosas, en este orden. Solo hay que hacerlo una vez.

Todo lo que sigue es **gratis**: ni Supabase ni Cloudflare piden tarjeta para
lo que necesitamos aquí.

---

## 1. Supabase — donde viven las chapas y las fotos

1. Entra en **https://supabase.com** y crea una cuenta (vale con la de GitHub).
2. **New project**. Ponle el nombre que quieras, por ejemplo `chapas`.
   - Elige la región **West EU (Ireland)** o **Central EU (Frankfurt)**: es la más cercana.
   - Te pedirá una **contraseña de base de datos**: guárdala en tu gestor de contraseñas.
     No es la del panel, es la de administración de la base de datos.
3. Cuando el proyecto esté listo, ve a **SQL Editor** (menú de la izquierda) →
   **New query**, pega entero el contenido de `supabase/setup.sql` y pulsa **Run**.
   Tiene que decir *Success*.
4. Ve a **Authentication → Users → Add user → Create new user**:
   - Email: `cerveza@chapas.local`
   - Password: la que quieras usar para entrar desde el móvil
   - Marca **Auto Confirm User** (si no, te pedirá confirmar un correo que no existe)
5. Ve a **Authentication → Sign In / Providers → Email** y **desactiva
   "Allow new users to sign up"**. Así nadie puede crearse una cuenta por su cuenta
   y ponerse a editar tu colección.
6. Copia dos valores:
   - **Project Settings → Data API → Project URL**
     → algo como `https://abcdefgh.supabase.co` (**sin** el `/rest/v1/` del final)
   - **Project Settings → API Keys → Publishable key**
     → empieza por `sb_publishable_...`
     (en proyectos creados hace tiempo esto se llamaba *anon public* y empezaba por `eyJ...`;
     funciona igual)

Pégalos en `js/config.js`:

```js
window.SUPABASE_CONFIG = {
  url: 'https://abcdefgh.supabase.co',
  anonKey: 'sb_publishable_...',
  loginDomain: 'chapas.local',
};
```

> La *publishable key* **es pública a propósito**: viaja al navegador de cualquiera
> que abra la web. Lo que protege la colección son las reglas del paso 3, que solo
> dejan escribir con la sesión iniciada.
>
> Las de **Secret keys** (`sb_secret_...`, antes `service_role`) **no se ponen aquí
> nunca**: se saltan todas las reglas.

Guarda, `git commit` y `git push`.

---

## 2. Cloudflare Pages — quien publica la web

Esto permite tener el **repo privado** y la **web pública** sin pagar nada.

1. Entra en **https://dash.cloudflare.com** y crea una cuenta.
2. **Compute (Workers & Pages) → Create → Pages → Connect to Git**.
3. Autoriza a Cloudflare a leer tu GitHub y elige el repositorio `web-collection`.
4. Configuración del despliegue:
   - **Project name**: `collection-cervezas` ← esto decide la URL final
   - **Production branch**: `main`
   - **Framework preset**: *None*
   - **Build command**: déjalo **vacío**
   - **Build output directory**: `/`
5. **Save and Deploy**. En un minuto tendrás
   **https://collection-cervezas.pages.dev**

A partir de ahí, cada `git push` a `main` republica la web sola.

---

## 3. Poner el repo en privado

Solo cuando el paso 2 esté funcionando, porque GitHub Pages deja de servir la web
en cuanto el repo es privado:

```bash
gh repo edit aayusomp/web-collection --visibility private --accept-visibility-change-consequences
```

Cloudflare sigue publicando igual: ya tiene permiso de lectura sobre el repo.

---

## Usar el panel desde el móvil

1. Abre `https://collection-cervezas.pages.dev/admin.html`.
2. Usuario `cerveza` y tu contraseña (el `@chapas.local` lo añade la página sola).
3. **Añadir chapa** → *Hacer foto* usa la cámara directamente.
   La foto se reduce a 900 px antes de subirse, así que gasta poquísimo.
4. En el menú del navegador, **"Añadir a la pantalla de inicio"**: queda como una app.

Para cambiar la contraseña más adelante:
Supabase → **Authentication → Users** → los tres puntos junto al usuario →
**Reset password** o edítalo directamente.

---

## Cuánto ocupa todo esto

| | Plan gratuito | Lo que gasta la colección |
|---|---|---|
| Supabase base de datos | 500 MB | unos 300 bytes por chapa |
| Supabase fotos | 1 GB | ~80 KB por foto → unas 12.000 chapas |
| Cloudflare Pages | ilimitado | — |

El único gasto posible sería un **dominio propio** (`mischapas.com`, unos 10 €/año),
y es completamente opcional: `collection-cervezas.pages.dev` es gratis para siempre.
