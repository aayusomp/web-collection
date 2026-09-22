/* =========================================================================
   LA COLECCIÓN
   -------------------------------------------------------------------------
   Cada chapa es un objeto. Campos:

     name         nombre que se ve en la ficha            (obligatorio)
     type         "beer" (cerveza) o "soda" (refresco)    (obligatorio)
     countryCode  código ISO del país: ES, DE, MX, JP…    (obligatorio)
     producer     cervecera o fabricante                  (opcional)
     city         ciudad de origen                        (opcional)
     style        estilo de cerveza / sabor del refresco  (opcional)
     abv          graduación, p. ej. "5.5%"               (opcional)
     year         año de la chapa                         (opcional)
     image        ruta de la foto, p. ej. "img/es/mahou.jpg" (opcional:
                  si está vacío se dibuja una chapa de relleno)
     notes        comentario; puede ser texto o { es: "…", en: "…" }
     addedAt      fecha en que la añadiste, "2026-09-22"  (opcional)

   Estas son de ejemplo para ver la web funcionando: bórralas cuando
   empieces a meter las tuyas.
   ========================================================================= */

window.COLLECTION = [
  {
    name: 'Mahou Cinco Estrellas',
    type: 'beer', countryCode: 'ES', producer: 'Mahou San Miguel', city: 'Madrid',
    style: 'Lager', abv: '5.5%', image: '', addedAt: '2026-09-22',
    notes: { es: 'La de toda la vida.', en: 'The classic one.' },
  },
  {
    name: 'Estrella Galicia Especial',
    type: 'beer', countryCode: 'ES', producer: 'Hijos de Rivera', city: 'A Coruña',
    style: 'Lager', abv: '5.5%', image: '', addedAt: '2026-09-22',
  },
  {
    name: 'Alhambra Reserva 1925',
    type: 'beer', countryCode: 'ES', producer: 'Cervezas Alhambra', city: 'Granada',
    style: 'Lager tostada', abv: '6.4%', image: '', addedAt: '2026-09-21',
  },
  {
    name: 'Kas Naranja',
    type: 'soda', countryCode: 'ES', producer: 'PepsiCo', city: 'Vitoria',
    style: 'Naranja', image: '', addedAt: '2026-09-21',
  },
  {
    name: 'Paulaner Hefe-Weissbier',
    type: 'beer', countryCode: 'DE', producer: 'Paulaner Brauerei', city: 'München',
    style: 'Weissbier', abv: '5.5%', image: '', addedAt: '2026-09-20',
  },
  {
    name: 'Augustiner Helles',
    type: 'beer', countryCode: 'DE', producer: 'Augustiner-Bräu', city: 'München',
    style: 'Helles', abv: '5.2%', image: '', addedAt: '2026-09-20',
  },
  {
    name: 'Guinness Draught',
    type: 'beer', countryCode: 'IE', producer: 'St. James’s Gate', city: 'Dublin',
    style: 'Stout', abv: '4.2%', image: '', addedAt: '2026-09-19',
  },
  {
    name: 'Duvel',
    type: 'beer', countryCode: 'BE', producer: 'Duvel Moortgat', city: 'Puurs',
    style: 'Belgian Strong Ale', abv: '8.5%', image: '', addedAt: '2026-09-19',
  },
  {
    name: 'Peroni Nastro Azzurro',
    type: 'beer', countryCode: 'IT', producer: 'Birra Peroni', city: 'Roma',
    style: 'Pale Lager', abv: '5.1%', image: '', addedAt: '2026-09-18',
  },
  {
    name: 'Heineken',
    type: 'beer', countryCode: 'NL', producer: 'Heineken', city: 'Amsterdam',
    style: 'Pale Lager', abv: '5.0%', image: '', addedAt: '2026-09-18',
  },
  {
    name: 'Super Bock',
    type: 'beer', countryCode: 'PT', producer: 'Super Bock Group', city: 'Leça do Balio',
    style: 'Pale Lager', abv: '5.2%', image: '', addedAt: '2026-09-17',
  },
  {
    name: 'Pilsner Urquell',
    type: 'beer', countryCode: 'CZ', producer: 'Plzeňský Prazdroj', city: 'Plzeň',
    style: 'Pilsner', abv: '4.4%', image: '', addedAt: '2026-09-17',
  },
  {
    name: 'Corona Extra',
    type: 'beer', countryCode: 'MX', producer: 'Grupo Modelo', city: 'Ciudad de México',
    style: 'Pale Lager', abv: '4.5%', image: '', addedAt: '2026-09-16',
  },
  {
    name: 'Quilmes Cristal',
    type: 'beer', countryCode: 'AR', producer: 'Cervecería Quilmes', city: 'Quilmes',
    style: 'Pale Lager', abv: '4.9%', image: '', addedAt: '2026-09-16',
  },
  {
    name: 'Inca Kola',
    type: 'soda', countryCode: 'PE', producer: 'Corporación Lindley', city: 'Lima',
    style: 'Hierba luisa', image: '', addedAt: '2026-09-15',
    notes: { es: 'Amarilla y dulcísima.', en: 'Bright yellow and very sweet.' },
  },
  {
    name: 'Asahi Super Dry',
    type: 'beer', countryCode: 'JP', producer: 'Asahi Breweries', city: 'Tokyo',
    style: 'Rice Lager', abv: '5.0%', image: '', addedAt: '2026-09-15',
  },
  {
    name: 'Tsingtao',
    type: 'beer', countryCode: 'CN', producer: 'Tsingtao Brewery', city: 'Qingdao',
    style: 'Pale Lager', abv: '4.7%', image: '', addedAt: '2026-09-14',
  },
  {
    name: 'Singha',
    type: 'beer', countryCode: 'TH', producer: 'Boon Rawd Brewery', city: 'Bangkok',
    style: 'Pale Lager', abv: '5.0%', image: '', addedAt: '2026-09-14',
  },
  {
    name: 'Castle Lager',
    type: 'beer', countryCode: 'ZA', producer: 'South African Breweries', city: 'Johannesburg',
    style: 'Pale Lager', abv: '5.0%', image: '', addedAt: '2026-09-13',
  },
  {
    name: 'Casablanca',
    type: 'beer', countryCode: 'MA', producer: 'Société des Brasseries du Maroc', city: 'Casablanca',
    style: 'Pale Lager', abv: '5.0%', image: '', addedAt: '2026-09-13',
  },
  {
    name: 'Victoria Bitter',
    type: 'beer', countryCode: 'AU', producer: 'Carlton & United', city: 'Melbourne',
    style: 'Lager', abv: '4.9%', image: '', addedAt: '2026-09-12',
  },
  {
    name: 'Coca-Cola',
    type: 'soda', countryCode: 'US', producer: 'The Coca-Cola Company', city: 'Atlanta',
    style: 'Cola', image: '', addedAt: '2026-09-12',
  },
];
