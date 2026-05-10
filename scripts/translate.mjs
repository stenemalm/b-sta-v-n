import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(__dirname, 'products-raw.json');
const OUT = path.join(__dirname, '../lib/products.js');

const rawText = fs.readFileSync(RAW, 'utf8').replace(/^﻿/, '');
const products = JSON.parse(rawText);

async function translate(text) {
  if (!text || text.trim() === '') return '';
  const q = text.substring(0, 450);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=sv&dt=t&q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    if (!Array.isArray(data[0])) return text;
    return data[0].map(p => p[0]).join('').trim();
  } catch {
    return text;
  }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function esc(s) { return (s||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\r?\n/g,' '); }

console.log(`Översätter ${products.length} produkter...`);
const done = [];
let i = 0;

for (const p of products) {
  i++;
  process.stdout.write(`\r${i}/${products.length} — ${p.brand.substring(0,18).padEnd(18)}`);
  const [name, desc] = await Promise.all([
    translate(p.name),
    translate(p.desc),
  ]);
  done.push({ ...p, name: name || p.name, desc: desc || p.desc });
  await delay(120);
}

console.log('\nSkriver products.js...');

let out = `export const categories = [
  { slug: "mat",       name: "Mat & Godis",       icon: "🍖" },
  { slug: "sand",      name: "Kattlåda & Sand",   icon: "🪨" },
  { slug: "mobler",    name: "Möbler & Klösträd", icon: "🛋️" },
  { slug: "tillbehor", name: "Tillbehör",         icon: "✨" },
];\n\nexport const products = [\n`;

for (const p of done) {
  const weight  = p.weight  ? `"${esc(p.weight)}"` : 'null';
  const origOut = p.originalPrice != null ? p.originalPrice : 'null';
  out += `  {\n    id: ${p.id},\n    slug: "${p.slug}",\n    name: "${esc(p.name)}",\n    brand: "${esc(p.brand)}",\n    category: "${p.category}",\n    price: ${p.price},\n    originalPrice: ${origOut},\n    image: "${p.image||''}",\n    placeholder: "${p.placeholder}",\n    weight: ${weight},\n    rating: ${p.rating},\n    reviews: ${p.reviews},\n    badge: null,\n    description: "${esc(p.desc)}",\n    tags: [],\n    inStock: true,\n  },\n`;
}

out += `];\n\nexport function getProduct(slug) {\n  return products.find(p => p.slug === slug) ?? null;\n}\n\nexport function getByCategory(cat) {\n  return products.filter(p => p.category === cat);\n}\n`;

fs.writeFileSync(OUT, out, 'utf8');
console.log(`Klar! ${done.length} produkter på svenska.`);
