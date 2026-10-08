import { PDFDocument } from 'pdf-lib';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const pdfDir = './public/pdfs';
const files = [
  'Palacio Musical — Pricing Guide _ Executive Vacations.pdf',
  'Palacio Tropical — Pricing Guide _ Executive Vacations.pdf',
  'The Palms Villa Estate — Pricing Guide _ Executive Vacations.pdf',
  'The View House — Pricing Guide _ Executive Vacations.pdf',
];

const merged = await PDFDocument.create();

for (const file of files) {
  const bytes = readFileSync(join(pdfDir, file));
  const doc = await PDFDocument.load(bytes);
  const pages = await merged.copyPages(doc, doc.getPageIndices());
  pages.forEach(p => merged.addPage(p));
  console.log(`✅ Added: ${file} (${doc.getPageCount()} pages)`);
}

const output = join(pdfDir, 'All Villas — Pricing Guide _ Executive Vacations.pdf');
writeFileSync(output, await merged.save());
console.log(`\n✅ Merged PDF saved: ${output}`);
console.log(`   Total pages: ${merged.getPageCount()}`);
