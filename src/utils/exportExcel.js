import * as XLSX from 'xlsx';
import { CATEGORIES_BY_TYPE } from '../constants/docTypes';
import { applyPunctuation } from '../config/punctuationPresets';

const SHEET_NAMES = {
  libro: 'Libros',
  revista: 'Revistas',
  tesis: 'Tesis',
  articuloRevista: 'ArticulosRevista',
  articulosLibro: 'ArticulosLibro',
};

// La puntuación sale del preset del tipo de documento
// (config/punctuationPresets.js) más los overrides manuales por columna
// (`overrides`: { [fieldKey]: symbol }). Se usa la MISMA función que la
// vista previa del paso 03, así que ambas siempre coinciden.
// `fileSuffix` (opcional) se agrega al nombre del archivo, p. ej. la fecha
// de un paquete del historial.
export function exportBooksToExcel(books, docType = 'libro', lang = 'es', overrides = {}, fileSuffix = '') {
  const cats = CATEGORIES_BY_TYPE[docType] || CATEGORIES_BY_TYPE.libro;
  const headers = cats.map((c) => {
    const label = c.colLabel[lang] || c.colLabel.es;
    return c.marcTag ? `${label} (${c.marcTag})` : label;
  });

  const rows = books.map((book) => cats.map((c) => applyPunctuation(book, c, docType, overrides)));

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  worksheet['!cols'] = headers.map(() => ({ wch: 24 }));

  const workbook = XLSX.utils.book_new();
  const sheetName = SHEET_NAMES[docType] || 'Registros';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const suffix = fileSuffix ? `-${fileSuffix}` : '';
  XLSX.writeFile(workbook, `EBO-${sheetName.toLowerCase()}${suffix}.xlsx`);
}
