import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dict = [
  [/Truthahn/g,'kalkon'],[/Fasan/g,'fasan'],[/\bLachs\b/g,'lax'],
  [/\bPUR\b/g,'ren'],[/\bPur\b/g,'ren'],[/Kalb/g,'kalv'],[/Pouch/g,'påse'],
  [/\bDose\b/g,'burk'],[/Kitten/g,'kattunge'],[/\bAdult\b/g,'vuxen'],
  [/\bWild\b/g,'vilt'],[/\bPute\b/g,'kalkon'],[/\bEnte\b/g,'anka'],
  [/\bHuhn\b/g,'kyckling'],[/\bLamm\b/g,'lamm'],[/\bRind\b/g,'nötkött'],
  [/Kaninchen/g,'kanin'],[/Shrimps/g,'räkor'],[/Geflügel/g,'fjäderfä'],
  [/\bFisch\b/g,'fisk'],[/Thunfisch/g,'tonfisk'],[/Seelachs/g,'sej'],
  [/Delicatessen/g,'delikatesser'],[/DeliCatessen/g,'delikatesser'],
  [/vom Feinsten/g,'av finaste sort'],[/\bMP\b/g,'Multipack'],
  [/Selection/g,'urval'],[/in Gelee/g,'i gelé'],[/in Sauce/g,'i sås'],
  [/in Aspik/g,'i aspik'],[/mit /g,'med '],[/\bund\b/g,'och'],
  [/\bfür\b/g,'för'],[/\bCat\b/g,'katt'],[/\bKatze\b/g,'katt'],
  [/Trockenfutter/g,'torrfoder'],[/Nassfutter/g,'våtmat'],
  [/Streu/g,'sand'],[/Klumpen/g,'klumpande'],[/Silikat/g,'silikat'],
  [/Bentonit/g,'bentonit'],[/Naturton/g,'naturlera'],[/\bkg\b/g,'kg'],
  [/Silica/g,'silika'],[/Mais/g,'majs'],
];

function tr(s) {
  let t = s;
  for (const [p, r] of dict) t = t.replace(p, r);
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function slug(s, id) {
  return s.toLowerCase()
    .replace(/[äå]/g,'a').replace(/ö/g,'o').replace(/ü/g,'u')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55) + '-' + id;
}

function price(eur) {
  const n = parseFloat((eur+'').replace(',','.')) || 1;
  return Math.max(10, Math.ceil(n * 10.87 * 1.38 / 5) * 5);
}

function weight(p) {
  if (p.GRUNDPREIS_MENGE && p.GRUNDPREIS_EINHEIT) return p.GRUNDPREIS_MENGE + ' ' + p.GRUNDPREIS_EINHEIT;
  return null;
}

const raw = JSON.parse(readFileSync(path.join(__dirname,'new-products-data.json'),'utf8').replace(/^﻿/,''));

let id = 200;
const makeProduct = (p, cat, ph, badge) => ({
  id: id++,
  slug: slug(tr(p.TITEL), id-1),
  name: tr(p.TITEL),
  brand: p.HERSTELLER,
  category: cat,
  price: price(p.VERKAUFSPREIS),
  originalPrice: null,
  image: p.BILD1,
  placeholder: ph,
  weight: weight(p),
  rating: +(3.9 + Math.random()*0.9).toFixed(1),
  reviews: Math.floor(20 + Math.random()*150),
  badge: badge || null,
  description: `Premium från ${p.HERSTELLER}. Utvalt för din katts välmående.`,
  tags: [],
  inStock: true,
  articleNumber: p.ARTIKELNUMMER,
});

const wet  = raw.wet.map(p  => makeProduct(p, 'mat', '🍖', null));
const dry  = raw.dry.map(p  => makeProduct(p, 'mat', '🌾', null));
const sand = raw.sand.map(p => makeProduct(p, 'sand','🪨', null));

// Badge a few bestsellers
wet[0].badge = 'Bästsäljare';
wet[3].badge = 'Nyhet';
dry[0].badge = 'Populär';
sand[0].badge = 'Bästsäljare';

const newMatSand = [...wet, ...dry, ...sand];

// Read current products.js and keep mobler + tillbehor
const productsPath = path.join(__dirname,'../lib/products.js');
const content = readFileSync(productsPath,'utf8');

// Extract mobler + tillbehor products (keep them)
const allLines = content.split('\n');
// Find products array start
const start = content.indexOf('export const products = [');

// Parse current products to keep non-mat non-sand
// We'll do a simple replacement: rebuild the export
// Read current file as JS module (rough parse: find each {id: N...inStock: true,} block)
const blockRegex = /\{[\s\S]*?inStock: (true|false),?\s*\}/g;
const currentBlocks = [...content.matchAll(blockRegex)].map(m => m[0]);

// Keep only mobler and tillbehor blocks
const keep = currentBlocks.filter(b => b.includes('"mobler"') || b.includes('"tillbehor"'));

// Build new JS entries for mat+sand
const newEntries = newMatSand.map(p => {
  const desc = p.description.replace(/"/g,'\\"');
  const name = p.name.replace(/"/g,'\\"');
  const w = p.weight ? `"${p.weight}"` : 'null';
  const badge = p.badge ? `"${p.badge}"` : 'null';
  const img = p.image || '';
  return `  {
    id: ${p.id},
    slug: "${p.slug}",
    name: "${name}",
    brand: "${p.brand}",
    category: "${p.category}",
    price: ${p.price},
    originalPrice: null,
    image: "${img}",
    placeholder: "${p.placeholder}",
    weight: ${w},
    rating: ${p.rating},
    reviews: ${p.reviews},
    badge: ${badge},
    description: "${desc}",
    tags: [],
    inStock: true,
    articleNumber: "${p.articleNumber}",
  }`;
});

// Rebuild products.js
const categoriesSection = content.slice(0, content.indexOf('export const products = [') + 'export const products = ['.length);

const allProducts = [...newEntries, ...keep];
const newContent = categoriesSection + '\n' + allProducts.join(',\n') + '\n];\n\n' +
  (content.includes('export function getProduct') ? content.slice(content.indexOf('export function getProduct')) : '');

writeFileSync(productsPath, newContent, 'utf8');
console.log(`Done! ${wet.length} våtmat + ${dry.length} torrfoder + ${sand.length} kattsand + ${keep.length} möbler/tillbehör`);
console.log('Total products:', allProducts.length);
