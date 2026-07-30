import * as XLSX from 'xlsx';
import { CATEGORIES_BY_TYPE } from '../constants/docTypes';

const SHEET_NAMES = {
  libro: 'Libros',
  revista: 'Revistas',
  tesis: 'Tesis',
  articuloRevista: 'ArticulosRevista',
  articulosLibro: 'ArticulosLibro',
};

// `columnPunctuation`: { [fieldKey]: symbol } — puntuación ISBD elegida
// manualmente por el usuario por columna en el paso 03 (ver
// project_ebo_cliente_ui_decisions.md). Ya no se calcula automáticamente.
export function exportBooksToExcel(books, docType = 'libro', lang = 'es', columnPunctuation = {}) {
  const cats = CATEGORIES_BY_TYPE[docType] || CATEGORIES_BY_TYPE.libro;
  const headers = cats.map((c) => {
    const label = c.colLabel[lang] || c.colLabel.es;
    return c.marcTag ? `${label} (${c.marcTag})` : label;
  });

  const rows = books.map((book) =>
    cats.map((c) => {
      const val = book[c.key] || '';
      if (!val) return '';
      const suffix = columnPunctuation[c.key] || '';
      return val + suffix;
    }),
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  worksheet['!cols'] = headers.map(() => ({ wch: 24 }));

  const workbook = XLSX.utils.book_new();
  const sheetName = SHEET_NAMES[docType] || 'Registros';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, `EBO-${sheetName.toLowerCase()}.xlsx`);
}
