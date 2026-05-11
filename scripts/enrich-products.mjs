// Reads current products.js + ZooDrop CSV → adds images[], rawDescription, suchnummer to every product
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const csvPath     = 'C:/Users/Alexander Stenemalm/Desktop/zoodrop_utf8 (1).csv';
const productsPath = path.join(__dirname, '../lib/products.js');

// ─── Load existing products ────────────────────────────────────────────────
const { products } = await import(pathToFileURL(productsPath).href);

// ─── Parse CSV ────────────────────────────────────────────────────────────
function parseCSVLine(line) {
  const fields = []; let inQ = false, cur = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (inQ && line[i+1]==='"'){cur+='"';i++;}else inQ=!inQ; }
    else if (c===';'&&!inQ){ fields.push(cur); cur=''; }
    else cur+=c;
  }
  fields.push(cur); return fields;
}

console.log('Läser CSV...');
const lines  = readFileSync(csvPath, 'utf8').split('\n');
const header = parseCSVLine(lines[0]);
const IDX    = {}; header.forEach((h,i) => IDX[h]=i);

// Build lookup: articleNumber → CSV row
const csvLookup = new Map();
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim(); if (!line) continue;
  const f = parseCSVLine(line);
  const art = f[IDX['ARTIKELNUMMER']];
  if (art) csvLookup.set(art, f);
}
console.log(`CSV rader: ${csvLookup.size}`);

// ─── Enrich each product ──────────────────────────────────────────────────
function esc(s) { return (s||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"'); }

const enriched = products.map(p => {
  const f = p.articleNumber ? csvLookup.get(p.articleNumber) : null;
  if (!f) {
    return { ...p, images: [p.image].filter(Boolean), rawDescription: '', suchnummer: p.suchnummer || null };
  }
  const imgs = ['BILD1','BILD2','BILD3','BILD4','BILD5','BILD6','BILD7','BILD8']
    .map(k => f[IDX[k]]||'').filter(Boolean);
  const rawDesc = (f[IDX['BESCHREIBUNG']]||'').replace(/\r?\n/g,' ');
  const such    = f[IDX['SUCHNUMMER']]||null;
  return { ...p, images: imgs.length ? imgs : [p.image].filter(Boolean), rawDescription: rawDesc, suchnummer: such };
});

// ─── Write back ───────────────────────────────────────────────────────────
const content  = readFileSync(productsPath, 'utf8');
const getFnIdx = content.indexOf('export function getProduct');
const trailing = getFnIdx > -1 ? content.slice(getFnIdx) : '';
const catEnd   = content.indexOf('export const products = [');
const catSection = content.slice(0, catEnd);

function toJs(p) {
  const w    = p.weight        ? `"${esc(p.weight)}"` : 'null';
  const op   = p.originalPrice != null ? p.originalPrice : 'null';
  const bad  = p.badge         ? `"${esc(p.badge)}"` : 'null';
  const an   = p.articleNumber ? `"${esc(p.articleNumber)}"` : 'null';
  const en   = p.ean           ? `"${esc(p.ean)}"` : 'null';
  const such = p.suchnummer    ? `"${esc(p.suchnummer)}"` : 'null';
  const imgs = JSON.stringify(p.images || [p.image].filter(Boolean));
  const rd   = `"${esc(p.rawDescription||'')}"`;
  return `  {
    id: ${p.id},
    slug: "${esc(p.slug)}",
    name: "${esc(p.name)}",
    brand: "${esc(p.brand)}",
    category: "${p.category}",
    price: ${p.price},
    originalPrice: ${op},
    image: "${esc(p.image)}",
    images: ${imgs},
    placeholder: "${p.placeholder}",
    weight: ${w},
    rating: ${p.rating},
    reviews: ${p.reviews},
    badge: ${bad},
    description: "${esc(p.description)}",
    rawDescription: ${rd},
    tags: ${JSON.stringify(p.tags||[])},
    inStock: ${p.inStock},
    articleNumber: ${an},
    suchnummer: ${such},
    ean: ${en},
  }`;
}

const productsJs = enriched.map(toJs).join(',\n');
writeFileSync(productsPath, catSection + 'export const products = [\n' + productsJs + '\n];\n\n' + trailing, 'utf8');

// ─── Stats ────────────────────────────────────────────────────────────────
const withImages = enriched.filter(p => (p.images||[]).length > 1).length;
const withDesc   = enriched.filter(p => p.rawDescription).length;
console.log(`\nKlart! ${enriched.length} produkter uppdaterade`);
console.log(`  Har flera bilder:       ${withImages}`);
console.log(`  Har råbeskrivning:      ${withDesc}`);
console.log(`  Saknar CSV-matchning:   ${enriched.length - withDesc}`);
