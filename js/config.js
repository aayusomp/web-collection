/* =========================================================================
   Conexión con Supabase (donde viven las chapas y las fotos).

   Rellena estos dos valores con los de tu proyecto:

     url      Supabase → Project Settings → Data API → "Project URL"
              Algo como https://abcdefgh.supabase.co (sin /rest/v1 al final)

     anonKey  Supabase → Project Settings → API Keys → "Publishable key"
              Empieza por sb_publishable_...
              (en proyectos antiguos se llamaba "anon public" y empezaba por eyJ...)

   Estas dos claves ESTÁN PENSADAS PARA SER PÚBLICAS: van en el navegador
   de cualquiera que visite la web. Quien manda de verdad son las reglas
   de seguridad de la base de datos (ver supabase/setup.sql), que solo
   dejan escribir a un usuario con sesión iniciada.

   NUNCA pegues aquí una clave de "Secret keys" (sb_secret_... o la antigua
   service_role): esa se salta todas las reglas.

   Mientras estén vacías, la web usa las chapas de ejemplo de
   data/collection.js y el panel avisa de que falta configurarlo.
   ========================================================================= */

window.SUPABASE_CONFIG = {
  url: 'https://bowwfykuqnemrlldfqts.supabase.co',
  anonKey: 'sb_publishable_qeLs9fTIbUgbfmrUXX_EvQ_mSZ1-SZt',

  // Usuario corto para entrar desde el móvil: si escribes "cerveza",
  // por dentro se usa "cerveza@chapas.local".
  loginDomain: 'chapas.local',
};
