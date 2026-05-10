import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// German→Swedish food dictionary
const dict = [
  [/Truthahn/g, 'kalkon'], [/Fasan/g, 'fasan'], [/Lachs/g, 'lax'],
  [/ PUR/g, ' ren'], [/Kalb/g, 'kalv'], [/Pouch/g, 'påse'],
  [/Dose/g, 'burk'], [/Kitten/g, 'kattunge'], [/\bAdult\b/g, 'vuxen'],
  [/Wild/g, 'vilt'], [/\bPute\b/g, 'kalkon'], [/Ente/g, 'anka'],
  [/\bHuhn\b/g, 'kyckling'], [/Huhn/g, 'kyckling'], [/\bLamm\b/g, 'lamm'],
  [/\bRind\b/g, 'nötkött'], [/Kaninchen/g, 'kanin'], [/Shrimps/g, 'räkor'],
  [/Geflügel/g, 'fjäderfä'], [/\bFisch\b/g, 'fisk'], [/Thunfisch/g, 'tonfisk'],
  [/Seelachs/g, 'sej'], [/Snack/g, 'snacks'], [/Delicatessen/g, 'delikatesser'],
  [/DeliCatessen/g, 'delikatesser'], [/vom Feinsten/g, 'av finaste sort'],
  [/\bMP\b/g, 'Multipack'], [/Auflauf/g, 'gryta'], [/Ragout/g, 'ragout'],
  [/Creme/g, 'kräm'], [/Selection/g, 'urval'], [/Sterilised/g, 'steriliserad'],
  [/Sensitive/g, 'känslig'], [/in Sauce/g, 'i sås'], [/in Gelee/g, 'i gelé'],
  [/in Aspik/g, 'i aspik'], [/mit /g, 'med '], [/und /g, 'och '],
  [/\bfür\b/g, 'för'], [/\bCat\b/g, 'katt'], [/\bKatze\b/g, 'katt'],
  [/\bkg\b/g, 'kg'], [/\bg\b/g, 'g'], [/\bml\b/g, 'ml'],
  [/Pur$/g, 'ren'], [/\bPur\b/g, 'ren'],
  [/GranataPet/g, 'GranataPet'], [/Wolfsblut/g, 'Wolfsblut'], [/Applaws/g, 'Applaws'],
];

function translate(title) {
  let t = title;
  for (const [pattern, replacement] of dict) {
    t = t.replace(pattern, replacement);
  }
  // Capitalize first letter
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function slugify(str, id) {
  return str.toLowerCase()
    .replace(/[äå]/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .slice(0, 60) + '-' + id;
}

function brand(hersteller) {
  if (hersteller === 'GranataPet') return 'GranataPet';
  if (hersteller === 'Wolfsblut') return 'Wolfsblut';
  if (hersteller === 'Applaws') return 'Applaws';
  return hersteller;
}

const raw = JSON.parse(readFileSync(path.join(__dirname, 'new-food.json'), 'utf8').replace(/^﻿/, ''));

const products = raw.map(p => {
  const name = translate(p.titel);
  const weight = p.weight || null;
  return {
    id: p.id,
    artikelnummer: p.artikelnummer,
    slug: slugify(name, p.id),
    name,
    brand: brand(p.hersteller),
    category: 'mat',
    price: p.price,
    originalPrice: null,
    image: p.bild1,
    placeholder: '🍖',
    weight,
    rating: +(3.8 + Math.random() * 1.1).toFixed(1),
    reviews: Math.floor(15 + Math.random() * 120),
    badge: null,
    description: `Premium kattmat från ${brand(p.hersteller)}. Noggrant utvalt råvaror utan onödiga tillsatser.`,
    tags: [],
    inStock: true,
  };
});

// Read current products.js
const productsFile = path.join(__dirname, '../lib/products.js');
let content = readFileSync(productsFile, 'utf8');

// Find start and end of mat-category products and replace them
// We'll append the new products as a separate export and update the main file

// Generate JS entries
const entries = products.map(p => `  {
    id: ${p.id},
    slug: "${p.slug}",
    name: "${p.name.replace(/"/g, '\\"')}",
    brand: "${p.brand}",
    category: "mat",
    price: ${p.price},
    originalPrice: null,
    image: "${p.image}",
    placeholder: "🍖",
    weight: ${p.weight ? `"${p.weight}"` : 'null'},
    rating: ${p.rating},
    reviews: ${p.reviews},
    badge: null,
    description: "${p.description}",
    tags: [],
    inStock: true,
    articleNumber: "${p.artikelnummer}",
  }`).join(',\n');

console.log('Generated entries for', products.length, 'products');
console.log('\nSample product:');
console.log(JSON.stringify(products[0], null, 2));

// Write to a temp file to verify before replacing main file
writeFileSync(path.join(__dirname, 'new-food-products.js'), `// New food products (50 items with real images)\n// Paste these into lib/products.js replacing existing mat-category products\n[\n${entries}\n]\n`);
console.log('\nWritten to scripts/new-food-products.js - review before applying');
