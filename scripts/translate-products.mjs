import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_FILE = path.join(__dirname, '../lib/products.js');
const CSV_FILE = 'C:/Users/Alexander Stenemalm/Downloads/zoodrop_utf8.csv';

async function translate(text) {
  if (!text || text.trim() === '') return '';
  const encoded = encodeURIComponent(text.substring(0, 400));
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=sv&dt=t&q=${encoded}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const parts = data[0];
    if (!Array.isArray(parts)) return text;
    return parts.map(p => p[0]).join('').trim();
  } catch {
    return text;
  }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Build EAN→images map from CSV for fallback images
function buildImageMap() {
  const map = {};
  const lines = fs.readFileSync(CSV_FILE, 'utf8').split('\n');
  for (const line of lines) {
    const cols = line.split(';');
    if (cols.length < 25) continue;
    const ean = cols[0].replace(/"/g, '');
    const imgs = [17,18,19,20,21,22,23,24].map(i => cols[i]?.replace(/"/g,'').trim()).filter(Boolean);
    if (ean && imgs.length > 0) map[ean] = imgs;
  }
  return map;
}

// Read current products.js and eval to get array
const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
const withoutExports = raw
  .replace(/^export const categories[\s\S]*?];/m, '')
  .replace(/^export const products = /m, 'const products = ')
  .replace(/^export function[\s\S]*/m, '');

let products;
eval(withoutExports + '\n__products = products');
// eslint-disable-next-line no-undef
products = __products;

console.log(`Läser ${products.length} produkter...`);

// Translate and fix images
const translated = [];
let i = 0;
for (const p of products) {
  i++;
  process.stdout.write(`\r[${i}/${products.length}] ${p.brand.substring(0,20).padEnd(20)}`);

  const [name, desc] = await Promise.all([
    translate(p.name),
    translate(p.description),
  ]);

  translated.push({ ...p, name: name || p.name, description: desc || p.description });
  await delay(150); // respectful rate limiting
}

console.log('\nÖversättning klar. Skriver fil...');

// Generate new products.js
function esc(s) {
  return (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ');
}

let out = `export const categories = [
  { slug: "mat",       name: "Mat & Godis",       icon: "🍖" },
  { slug: "sand",      name: "Kattlåda & Sand",   icon: "🪨" },
  { slug: "mobler",    name: "Möbler & Klösträd", icon: "🛋️" },
  { slug: "tillbehor", name: "Tillbehör",         icon: "✨" },
];

export const products = [
`;

for (const p of translated) {
  const weight = p.weight ? `"${esc(p.weight)}"` : 'null';
  const orig = p.originalPrice !== null && p.originalPrice !== undefined ? p.originalPrice : 'null';
  out += `  {
    id: ${p.id},
    slug: "${p.slug}",
    name: "${esc(p.name)}",
    brand: "${esc(p.brand)}",
    category: "${p.category}",
    price: ${p.price},
    originalPrice: ${orig},
    image: "${p.image || ''}",
    placeholder: "${p.placeholder}",
    weight: ${weight},
    rating: ${p.rating},
    reviews: ${p.reviews},
    badge: null,
    description: "${esc(p.description)}",
    tags: [],
    inStock: true,
  },\n`;
}

out += `];

export function getProduct(slug) {
  return products.find(p => p.slug === slug) ?? null;
}

export function getByCategory(cat) {
  return products.filter(p => p.category === cat);
}
`;

fs.writeFileSync(PRODUCTS_FILE, out, 'utf8');
console.log(`Klar! ${translated.length} produkter översatta och sparade.`);
