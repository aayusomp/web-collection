/* Países: de qué continente es cada código ISO, y cómo mostrarlo.
   Lo usan tanto la web pública como el panel de administración.
   Va dentro de una función para no ensuciar el ámbito global:
   lo único que sale fuera es window.Countries. */

(function () {
  const CONTINENT_CODES = {
    europe: 'AD AL AT BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GI GR HR HU IE IS IT LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SK SM TR UA VA XK',
    america: 'AG AR AW BB BM BO BR BS BZ CA CL CO CR CU CW DM DO EC GD GT GY HN HT JM KN KY LC MX NI PA PE PR PY SR SV TT US UY VC VE',
    asia: 'AE AF AM AZ BD BH BN BT CN GE HK ID IL IN IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MO MV MY NP OM PH PK PS QA SA SG SY TH TJ TL TM TW UZ VN YE',
    africa: 'AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RW SC SD SL SN SO SS ST SZ TD TG TN TZ UG ZA ZM ZW',
    oceania: 'AS AU CK FJ FM GU KI MH NC NR NU NZ PF PG PW SB TO TV VU WS',
  };

  const CONTINENT_OF = {};
  const ALL_CODES = [];
  for (const [continent, codes] of Object.entries(CONTINENT_CODES)) {
    for (const code of codes.split(' ')) {
      CONTINENT_OF[code] = continent;
      ALL_CODES.push(code);
    }
  }

  function countryName(code, lang = 'es') {
    if (!code) return '';
    try {
      return new Intl.DisplayNames([lang], { type: 'region' }).of(code.toUpperCase()) || code;
    } catch {
      return code;
    }
  }

  const flagUrl = (code) => `https://flagcdn.com/w40/${String(code || '').toLowerCase()}.png`;
  const continentOfCode = (code) => CONTINENT_OF[String(code || '').toUpperCase()] || 'other';

  /** Todos los países ordenados alfabéticamente en el idioma que se pida. */
  function sortedCountries(lang = 'es') {
    const collator = new Intl.Collator(lang);
    return ALL_CODES
      .map((code) => ({ code, name: countryName(code, lang) }))
      .sort((a, b) => collator.compare(a.name, b.name));
  }

  window.Countries = { CONTINENT_OF, ALL_CODES, countryName, flagUrl, continentOfCode, sortedCountries };
}());
