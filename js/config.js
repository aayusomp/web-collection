/* =========================================================================
   Conexión con Supabase (donde viven las chapas y las fotos).

   Rellena estos dos valores con los de tu proyecto:
   Supabase → Project Settings → API

     url      "Project URL",  algo como https://abcdefgh.supabase.co
     anonKey  la clave "anon public" (la larga que empieza por eyJ...)

   Estas dos claves ESTÁN PENSADAS PARA SER PÚBLICAS: van en el navegador
   de cualquiera que visite la web. Quien manda de verdad son las reglas
   de seguridad de la base de datos (ver supabase/setup.sql), que solo
   dejan escribir a un usuario con sesión iniciada.

   NUNCA pegues aquí la clave "service_role": esa sí es secreta.

   Mientras estén vacías, la web usa las chapas de ejemplo de
   data/collection.js y el panel avisa de que falta configurarlo.
   ========================================================================= */

window.SUPABASE_CONFIG = {
  url: '',
  anonKey: '',

  // Usuario corto para entrar desde el móvil: si escribes "cerveza",
  // por dentro se usa "cerveza@chapas.local".
  loginDomain: 'chapas.local',
};
