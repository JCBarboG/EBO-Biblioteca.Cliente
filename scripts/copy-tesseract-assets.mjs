// Copia los archivos binarios de Tesseract.js (worker, núcleo WASM y datos de
// idioma) a /public para que se sirvan desde el mismo origen que la app, con
// rutas absolutas predecibles tanto en desarrollo (vite dev) como en
// producción (vite build + cualquier hosting estático). Esto evita el fallo
// típico de Tesseract.js en producción: el worker o el WASM no cargan porque
// las rutas se resolvieron contra un CDN externo o un build path incorrecto.

import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicTesseractDir = path.join(root, 'public', 'tesseract');
const publicTessdataDir = path.join(root, 'public', 'tessdata');

mkdirSync(publicTesseractDir, { recursive: true });
mkdirSync(publicTessdataDir, { recursive: true });

const workerSrc = path.join(root, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js');
const coreDir = path.join(root, 'node_modules', 'tesseract.js-core');

// Variantes del núcleo WASM: con/sin SIMD, solo motor LSTM (el que usa esta
// app para reconocimiento). Se copian ambas para que el worker elija la
// correcta según el soporte de SIMD del navegador del usuario.
//
// También se copian las variantes "combinadas" (Legacy + LSTM, sin sufijo
// "-lstm"). Son necesarias exclusivamente para el worker de detección de
// orientación (OSD): `worker.detect()` requiere el motor Legacy, que el
// núcleo "-lstm" no incluye.
const coreFiles = [
  'tesseract-core-simd-lstm.wasm.js',
  'tesseract-core-simd-lstm.wasm',
  'tesseract-core-lstm.wasm.js',
  'tesseract-core-lstm.wasm',
  'tesseract-core-simd.wasm.js',
  'tesseract-core-simd.wasm',
  'tesseract-core.wasm.js',
  'tesseract-core.wasm',
];

function copyIfExists(src, destDir) {
  if (!existsSync(src)) {
    console.warn(`[copy-tesseract-assets] No se encontró ${src}, se omite.`);
    return false;
  }
  const dest = path.join(destDir, path.basename(src));
  copyFileSync(src, dest);
  console.log(`[copy-tesseract-assets] Copiado ${path.basename(src)}`);
  return true;
}

copyIfExists(workerSrc, publicTesseractDir);
for (const file of coreFiles) {
  copyIfExists(path.join(coreDir, file), publicTesseractDir);
}

// Datos de idioma (español + inglés, modelo LSTM "best"). Se descargan una
// sola vez desde el CDN oficial de tesseract.js-data y quedan en /public para
// que la app no dependa de un CDN externo en producción.
const LANGS = ['spa', 'eng'];

async function downloadLang(lang) {
  const dest = path.join(publicTessdataDir, `${lang}.traineddata.gz`);
  if (existsSync(dest)) {
    console.log(`[copy-tesseract-assets] ${lang}.traineddata.gz ya existe, se omite descarga.`);
    return;
  }
  const url = `https://cdn.jsdelivr.net/npm/@tesseract.js-data/${lang}/4.0.0_best_int/${lang}.traineddata.gz`;
  try {
    console.log(`[copy-tesseract-assets] Descargando ${lang}.traineddata.gz...`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const { writeFileSync } = await import('node:fs');
    writeFileSync(dest, buf);
    console.log(`[copy-tesseract-assets] Listo: ${lang}.traineddata.gz (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
  } catch (err) {
    console.warn(`[copy-tesseract-assets] No se pudo descargar ${lang}.traineddata.gz (${err.message}). La app intentará cargarlo desde el CDN en tiempo de ejecución.`);
  }
}

await Promise.all(LANGS.map(downloadLang));

// Datos de OSD (Orientation and Script Detection). Es un paquete especial,
// independiente del idioma, usado solo para detectar el ángulo del texto
// (rápido, no es el OCR completo) antes de habilitar la extracción.
async function downloadOsd() {
  const dest = path.join(publicTessdataDir, 'osd.traineddata.gz');
  if (existsSync(dest)) {
    console.log('[copy-tesseract-assets] osd.traineddata.gz ya existe, se omite descarga.');
    return;
  }
  const url = 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/osd/4.0.0/osd.traineddata.gz';
  try {
    console.log('[copy-tesseract-assets] Descargando osd.traineddata.gz...');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const { writeFileSync } = await import('node:fs');
    writeFileSync(dest, buf);
    console.log(`[copy-tesseract-assets] Listo: osd.traineddata.gz (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
  } catch (err) {
    console.warn(`[copy-tesseract-assets] No se pudo descargar osd.traineddata.gz (${err.message}). La detección de orientación quedará deshabilitada hasta que se descargue.`);
  }
}

await downloadOsd();
