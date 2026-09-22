# Mi colección de chapas

Web estática para enseñar mi colección de chapas de cerveza y refrescos de todo el mundo.

**En vivo:** https://aayusomp.github.io/web-collection/

## Cómo está hecho

Sin dependencias, sin build, sin `npm install`. Se puede abrir `index.html` con doble clic.

```
index.html           la página
css/styles.css       estilos (tema claro y oscuro)
js/app.js            filtros, buscador, galería y ficha de detalle
data/collection.js   LOS DATOS: la lista de chapas
img/                 las fotos
```

- El país se guarda como código ISO (`ES`, `DE`, `MX`…) y de ahí salen solos el nombre
  del país, la bandera y el continente. No hay que escribirlos.
- Si una chapa no tiene foto todavía, se dibuja una chapa de relleno con sus iniciales.
- Los textos están en español e inglés; el selector está arriba a la derecha.

## Añadir una chapa a mano

Abre `data/collection.js` y añade un bloque al final de la lista:

```js
  {
    name: 'Cruzcampo',
    type: 'beer',            // 'beer' cerveza · 'soda' refresco
    countryCode: 'ES',
    producer: 'Heineken España',
    city: 'Sevilla',
    style: 'Lager',
    abv: '4.8%',
    image: 'img/es/cruzcampo.jpg',
    addedAt: '2026-09-22',
  },
```

Guarda, `git commit`, `git push` y en un minuto está publicado.

## Fotos

- Cuadradas y recortadas a la chapa; con 600×600 px sobra.
- Guárdalas en `img/<pais>/` con nombres en minúscula y sin espacios: `img/es/mahou-cinco-estrellas.jpg`.
- `.jpg` para fotos y `.png` si la chapa tiene el fondo recortado.

## Publicación

GitHub Pages sirve la rama `main` directamente. Cada `push` actualiza la web.

## Editar desde el móvil

`admin.html` es el panel: se entra con usuario y contraseña, se hace la foto con la
cámara del móvil y la chapa aparece publicada al instante, sin tocar este repo.

Los datos y las fotos viven en **Supabase**; la web los lee al cargar. Quien puede
escribir lo deciden las reglas de `supabase/setup.sql`, no el código del navegador.
Mientras Supabase no esté configurado en `js/config.js`, la web tira de las chapas
de ejemplo de `data/collection.js`.

**Los pasos de instalación están en [SETUP.md](SETUP.md).**

## Ver la web mientras trabajas

```bash
python3 -m http.server 8000
```

Y abre http://localhost:8000.
