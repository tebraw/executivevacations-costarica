import puppeteer from 'puppeteer-core';
import { PDFDocument } from 'pdf-lib';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const chromeCandidates = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
].filter(Boolean);

const executablePath = chromeCandidates.find((path) => existsSync(path));

if (!executablePath) {
  throw new Error('No Chrome executable found. Set PUPPETEER_EXECUTABLE_PATH.');
}

const jobs = [
  {
    url: 'http://localhost:5173/pricing-guide-palacio-tropical.html',
    output: 'public/pdfs/Palacio Tropical — Pricing Guide _ Executive Vacations.pdf',
  },
  {
    url: 'http://localhost:5173/pricing-guide-palacio-musical.html',
    output: 'public/pdfs/Palacio Musical — Pricing Guide _ Executive Vacations.pdf',
  },
  {
    url: 'http://localhost:5173/pricing-guide-view-house.html',
    output: 'public/pdfs/The View House — Pricing Guide _ Executive Vacations.pdf',
  },
  {
    url: 'http://localhost:5173/pricing-guide-palms-villa-estate.html',
    output: 'public/pdfs/The Palms Villa Estate — Pricing Guide _ Executive Vacations.pdf',
  },
];

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  const page = await browser.newPage();

  for (const job of jobs) {
    await page.goto(job.url, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');
    await page.addStyleTag({
      content: `
        @page { size: A4 !important; margin: 12mm !important; }
        * { box-sizing: border-box !important; }
        html, body, .page {
          width: auto !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }
        .cover, .section, .gold-bar, .cover-image-bar, .info-grid, .activities-list {
          max-width: 100% !important;
        }
        .highlight-card,
        .amenity-item,
        .info-row,
        .activity-tag {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
      `,
    });
    await page.pdf({
      path: job.output,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
      scale: 0.94,
      preferCSSPageSize: true,
    });
    console.log(`Generated: ${job.output}`);
  }
} finally {
  await browser.close();
}

const allVillasFiles = [
  'public/pdfs/Palacio Tropical — Pricing Guide _ Executive Vacations.pdf',
  'public/pdfs/Palacio Musical — Pricing Guide _ Executive Vacations.pdf',
  'public/pdfs/The View House — Pricing Guide _ Executive Vacations.pdf',
  'public/pdfs/The Palms Villa Estate — Pricing Guide _ Executive Vacations.pdf',
];

const merged = await PDFDocument.create();
for (const file of allVillasFiles) {
  const bytes = readFileSync(file);
  const pdf = await PDFDocument.load(bytes);
  const pages = await merged.copyPages(pdf, pdf.getPageIndices());
  pages.forEach((pdfPage) => merged.addPage(pdfPage));
}

const allVillasOutput = join('public', 'pdfs', 'All Villas - Pricing Guide _ Executive Vacations.pdf');
writeFileSync(allVillasOutput, await merged.save());
console.log(`Generated: ${allVillasOutput}`);

const allVillasNoCacheOutput = join(
  'public',
  'pdfs',
  'All Villas - Pricing Guide _ Executive Vacations FIXED.pdf'
);
writeFileSync(allVillasNoCacheOutput, await merged.save());
console.log(`Generated: ${allVillasNoCacheOutput}`);

const allVillasRefinedOutput = join(
  'public',
  'pdfs',
  'All Villas - Pricing Guide _ Executive Vacations REFINED.pdf'
);
writeFileSync(allVillasRefinedOutput, await merged.save());
console.log(`Generated: ${allVillasRefinedOutput}`);
