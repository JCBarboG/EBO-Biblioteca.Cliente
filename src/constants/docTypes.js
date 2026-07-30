// Esquema de campos por tipo de documento para EBO-Cliente.
// Cada campo lleva su `marcTag` exacto (campo$subcampo) según el archivo
// "Marc de documentos.xlsx" entregado por el cliente (2026-07-30), pensado
// para que la exportación calce con el perfil CSV de importación de Koha.
// Los subcampos repetibles que el cliente desglosó en columnas separadas
// (041$a en Artículos de libro, 856$u/$y en Tesis) se modelan como campos
// independientes (Idioma 1/2, Enlace 1/2) porque la UI es un campo = una casilla.

function field(key, marcTag, es, en) {
  return {
    key,
    marcTag,
    label: { es, en },
    fieldLabel: { es, en },
    colLabel: { es: es.toUpperCase(), en: en.toUpperCase() },
  };
}

export const LIBRO_CATEGORIES = [
  field('fuenteCatA', '040$a', 'Fuente cat. (agencia)', 'Cataloging source (agency)'),
  field('fuenteCatC', '040$c', 'Fuente cat. (transcripción)', 'Cataloging source (transcribed by)'),
  field('isbn', '020$a', 'ISBN', 'ISBN'),
  field('titulo', '245$a', 'Título', 'Title'),
  field('subtitulo', '245$b', 'Subtítulo', 'Subtitle'),
  field('tituloVariante', '246$a', 'Título variante', 'Varying title'),
  field('autor', '100$a', 'Autor', 'Author'),
  field('autorSecundario', '700$a', 'Autor secundario', 'Secondary author'),
  field('dewey', '082$a', 'Dewey', 'Dewey number'),
  field('sigTopografica', '090$a', 'Sig. topográfica', 'Call number'),
  field('descFisica', '300$a', 'Desc. física', 'Physical description'),
  field('lugar', '260$a', 'Lugar', 'Place'),
  field('editorial', '260$b', 'Editorial', 'Publisher'),
  field('anio', '260$c', 'Año', 'Year'),
  field('ubicacion', '852$b', 'Ubicación', 'Location'),
  field('palabrasClave', '653$a', 'Palabras clave', 'Keywords'),
  field('resumen', '520$a', 'Resumen', 'Summary'),
  field('idioma', '041$a', 'Idioma', 'Language'),
  field('materia', '650$a', 'Materia', 'Subject'),
  field('edicion', '250$a', 'Edición', 'Edition'),
  field('serie', '490$a', 'Serie', 'Series'),
  field('adquisicion', '541$c', 'Adquisición', 'Acquisition method'),
  field('kohaCampoA', '942$a', 'Koha (campo a)', 'Koha (field a)'),
  field('kohaTipoItem', '942$c', 'Tipo de ítem (Koha)', 'Item type (Koha)'),
  field('kohaSuprimirOpac', '942$n', 'Suprimir OPAC (Koha)', 'Suppress in OPAC (Koha)'),
  field('enlaceUrl', '856$u', 'URL', 'URL'),
  field('enlaceTexto', '856$y', 'Texto enlace', 'Link text'),
  field('enlaceFormato', '856$m', 'Formato', 'Format'),
  field('enlaceAcceso', '856$7', 'Acceso', 'Access status'),
];

export const REVISTA_CATEGORIES = [
  field('fuenteCatA', '040$a', 'Fuente cat. (agencia)', 'Cataloging source (agency)'),
  field('fuenteCatC', '040$c', 'Fuente cat. (transcripción)', 'Cataloging source (transcribed by)'),
  field('issn', '022$a', 'ISSN', 'ISSN'),
  field('sigTopografica', '090$a', 'Sig. topográfica', 'Call number'),
  field('entidadResponsable', '110$a', 'Entidad responsable', 'Corporate body'),
  field('tituloRevista', '245$a', 'Título', 'Title'),
  field('subtitulo', '245$b', 'Subtítulo', 'Subtitle'),
  field('lugar', '260$a', 'Lugar', 'Place'),
  field('editorial', '260$b', 'Editorial', 'Publisher'),
  field('anio', '260$c', 'Año', 'Year'),
  field('descFisica', '300$a', 'Desc. física', 'Physical description'),
  field('autorSecundario', '700$a', 'Autor secundario', 'Secondary author'),
  field('frecuencia', '310$a', 'Frecuencia', 'Frequency'),
  field('fuenteAdquisicion', '541$a', 'Fuente adquisición', 'Source of acquisition'),
  field('idioma', '041$a', 'Idioma', 'Language'),
  field('tituloVariante', '246$a', 'Título variante', 'Varying title'),
  field('resumen', '520$a', 'Resumen', 'Summary'),
  field('materia', '650$a', 'Materia', 'Subject'),
  field('palabrasClave', '653$a', 'Palabras clave', 'Keywords'),
  field('kohaTipoItem', '942$c', 'Tipo de ítem (Koha)', 'Item type (Koha)'),
  field('kohaFuenteClasif', '942$2', 'Fuente clasif. (Koha)', 'Classification source (Koha)'),
  field('enlaceUrl', '856$u', 'URL', 'URL'),
  field('enlaceFormato', '856$m', 'Formato', 'Format'),
  field('enlaceTexto', '856$y', 'Texto enlace', 'Link text'),
  field('enlaceAcceso', '856$7', 'Acceso', 'Access status'),
];

export const TESIS_CATEGORIES = [
  field('isbn', '020$a', 'ISBN', 'ISBN'),
  field('fuenteCatA', '040$a', 'Fuente cat. (agencia)', 'Cataloging source (agency)'),
  field('fuenteCatC', '040$c', 'Fuente cat. (transcripción)', 'Cataloging source (transcribed by)'),
  field('idioma', '041$a', 'Idioma', 'Language'),
  field('deweyA', '082$a', 'Dewey (a)', 'Dewey number (a)'),
  field('deweyB', '082$b', 'Dewey (item)', 'Dewey number (item)'),
  field('sigTopografica', '090$a', 'Sig. topográfica', 'Call number'),
  field('autor', '100$a', 'Autor', 'Author'),
  field('titulo', '245$a', 'Título', 'Title'),
  field('subtitulo', '245$b', 'Subtítulo', 'Subtitle'),
  field('lugar', '260$a', 'Lugar', 'Place'),
  field('institucion', '260$b', 'Institución', 'Institution'),
  field('anio', '260$c', 'Año', 'Year'),
  field('descFisica', '300$a', 'Desc. física', 'Physical description'),
  field('materialAcompanante', '300$e', 'Material acompañante', 'Accompanying material'),
  field('serie', '490$a', 'Serie', 'Series'),
  field('serieVol', '490$v', 'Serie (vol.)', 'Series (vol.)'),
  field('notaTesis', '502$a', 'Nota de tesis', 'Dissertation note'),
  field('resumen', '520$a', 'Resumen', 'Summary'),
  field('materia', '650$a', 'Materia', 'Subject'),
  field('palabrasClave', '653$a', 'Palabras clave', 'Keywords'),
  field('director', '700$a', 'Director de tesis', 'Thesis advisor'),
  field('kohaTipoItem', '942$c', 'Tipo de ítem (Koha)', 'Item type (Koha)'),
  field('enlace1Url', '856$u', 'Enlace 1 — URL', 'Link 1 — URL'),
  field('enlace1Texto', '856$y', 'Enlace 1 — texto', 'Link 1 — text'),
  field('enlace1Acceso', '856$7', 'Enlace 1 — acceso', 'Link 1 — access'),
  field('enlace1Formato', '856$m', 'Enlace 1 — formato', 'Link 1 — format'),
  field('enlace2Url', '856$u', 'Enlace 2 — URL', 'Link 2 — URL'),
  field('enlace2Texto', '856$y', 'Enlace 2 — texto', 'Link 2 — text'),
];

export const ARTICULO_REVISTA_CATEGORIES = [
  field('kohaTipoItem', '942$c', 'Tipo de ítem (Koha)', 'Item type (Koha)'),
  field('kohaCampoA', '942$a', 'Koha (campo a)', 'Koha (field a)'),
  field('fuenteCatA', '040$a', 'Fuente cat. (agencia)', 'Cataloging source (agency)'),
  field('fuenteCatC', '040$c', 'Fuente cat. (transcripción)', 'Cataloging source (transcribed by)'),
  field('sigTopografica', '090$a', 'Sig. topográfica', 'Call number'),
  field('autor', '100$a', 'Autor', 'Author'),
  field('titulo', '245$a', 'Título', 'Title'),
  field('subtitulo', '245$b', 'Subtítulo', 'Subtitle'),
  field('lugar', '260$a', 'Lugar', 'Place'),
  field('editorial', '260$b', 'Editorial', 'Publisher'),
  field('anio', '260$c', 'Año', 'Year'),
  field('descFisica', '300$a', 'Desc. física', 'Physical description'),
  field('autorSecundario', '700$a', 'Autor secundario', 'Secondary author'),
  field('tituloAnfitrion', '773$a', 'Título revista anfitriona', 'Host journal title'),
  field('volPagAnfitrion', '773$g', 'Vol./núm./páginas', 'Vol./issue/pages'),
  field('idioma', '041$a', 'Idioma', 'Language'),
  field('ubicacion', '852$b', 'Ubicación', 'Location'),
  field('resumen', '520$a', 'Resumen', 'Summary'),
  field('palabrasClave', '653$a', 'Palabras clave', 'Keywords'),
  field('materia', '650$a', 'Materia', 'Subject'),
  field('enlaceUrl', '856$u', 'URL', 'URL'),
  field('enlaceTexto', '856$y', 'Texto enlace', 'Link text'),
  field('enlaceFormato', '856$m', 'Formato', 'Format'),
  field('enlaceAcceso', '856$7', 'Acceso', 'Access status'),
];

export const ARTICULOS_LIBRO_CATEGORIES = [
  field('fuenteCatA', '040$a', 'Fuente cat. (agencia)', 'Cataloging source (agency)'),
  field('fuenteCatC', '040$c', 'Fuente cat. (transcripción)', 'Cataloging source (transcribed by)'),
  field('deweyA', '082$a', 'Dewey (a)', 'Dewey number (a)'),
  field('deweyB', '082$b', 'Dewey (item)', 'Dewey number (item)'),
  field('sigTopografica', '090$a', 'Sig. topográfica', 'Call number'),
  field('autor', '100$a', 'Autor', 'Author'),
  field('titulo', '245$a', 'Título', 'Title'),
  field('subtitulo', '245$b', 'Subtítulo', 'Subtitle'),
  field('edicion', '250$a', 'Edición', 'Edition'),
  field('lugar', '260$a', 'Lugar', 'Place'),
  field('editorial', '260$b', 'Editorial', 'Publisher'),
  field('anio', '260$c', 'Año', 'Year'),
  field('descFisica', '300$a', 'Desc. física', 'Physical description'),
  field('serie', '490$a', 'Serie', 'Series'),
  field('serieVol', '490$v', 'Serie (vol.)', 'Series (vol.)'),
  field('autorSecundario', '700$a', 'Autor secundario', 'Secondary author'),
  field('tituloAnfitrion', '773$a', 'Título libro anfitrión', 'Host book title'),
  field('volPagAnfitrion', '773$g', 'Vol./núm./páginas', 'Vol./issue/pages'),
  field('idioma1', '041$a', 'Idioma 1', 'Language 1'),
  field('idioma2', '041$a', 'Idioma 2', 'Language 2'),
  field('tituloVariante', '246$a', 'Título variante', 'Varying title'),
  field('palabrasClave', '653$a', 'Palabras clave', 'Keywords'),
  field('materiaTitulo', '630$a', 'Materia (título uniforme)', 'Subject (uniform title)'),
  field('ubicacion', '852$b', 'Ubicación', 'Location'),
  field('resumen', '520$a', 'Resumen', 'Summary'),
  field('materia', '650$a', 'Materia', 'Subject'),
  field('kohaFuenteClasif', '942$2', 'Fuente clasif. (Koha)', 'Classification source (Koha)'),
  field('kohaTipoItem', '942$c', 'Tipo de ítem (Koha)', 'Item type (Koha)'),
  field('kohaSuprimirOpac', '942$n', 'Suprimir OPAC (Koha)', 'Suppress in OPAC (Koha)'),
  field('enlaceAcceso', '856$7', 'Acceso', 'Access status'),
  field('enlaceFormato', '856$m', 'Formato', 'Format'),
  field('enlaceTexto', '856$y', 'Texto enlace', 'Link text'),
  field('enlaceUrl', '856$u', 'URL', 'URL'),
  field('adquisicion', '541$c', 'Adquisición', 'Acquisition method'),
];

export const CATEGORIES_BY_TYPE = {
  libro: LIBRO_CATEGORIES,
  revista: REVISTA_CATEGORIES,
  tesis: TESIS_CATEGORIES,
  articuloRevista: ARTICULO_REVISTA_CATEGORIES,
  articulosLibro: ARTICULOS_LIBRO_CATEGORIES,
};

export function emptyFieldsForType(type) {
  const cats = CATEGORIES_BY_TYPE[type] || LIBRO_CATEGORIES;
  return cats.reduce((acc, { key }) => { acc[key] = ''; return acc; }, {});
}

// Legacy export so existing imports of CATEGORIES / EMPTY_FIELDS still work
export const CATEGORIES = LIBRO_CATEGORIES;
export const EMPTY_FIELDS = emptyFieldsForType('libro');
