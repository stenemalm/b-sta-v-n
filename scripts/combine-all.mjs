import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load mat products from current products.js
const { products: matProducts } = await import('../lib/products.js');

// Load non-mat products from backup
const nonMat = JSON.parse(readFileSync(path.join(__dirname, 'nonmat_products.json'), 'utf8'));

const all = [...matProducts, ...nonMat];

// Serialize
function toJs(p) {
  const w = p.weight ? `"${String(p.weight).replace(/"/g,'\\"')}"` : 'null';
  const badge = p.badge ? `"${String(p.badge).replace(/"/g,'\\"')}"` : 'null';
  const desc = (p.description||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,' ');
  const name = (p.name||'').replace(/"/g,'\\"');
  const img = (p.image||'').replace(/"/g,'\\"');
  const artNr = p.articleNumber ? `\n    articleNumber: "${p.articleNumber}",` : '';
  return `  {
    id: ${p.id},
    slug: "${p.slug}",
    name: "${name}",
    brand: "${p.brand}",
    category: "${p.category}",
    price: ${p.price},
    originalPrice: null,
    image: "${img}",
    placeholder: "${p.placeholder||'✨'}",
    weight: ${w},
    rating: ${p.rating||4.0},
    reviews: ${p.reviews||50},
    badge: ${badge},
    description: "${desc}",
    tags: ${JSON.stringify(p.tags||[])},
    inStock: true,${artNr}
  }`;
}

const productsJs = all.map(toJs).join(',\n');

const output = `export const categories = [
  { slug: "mat",       name: "Mat & Godis",       icon: "🍖" },
  { slug: "sand",      name: "Kattlåda & Sand",   icon: "🪨" },
  { slug: "mobler",    name: "Möbler & Klösträd", icon: "🛋️" },
  { slug: "tillbehor", name: "Tillbehör",         icon: "✨" },
];

export const products = [
${productsJs}
];

export function getProduct(slug) {
  return products.find(p => p.slug === slug) ?? null;
}

export function getByCategory(cat) {
  return products.filter(p => p.category === cat);
}
`;

writeFileSync(path.join(__dirname, '../lib/products.js'), output, 'utf8');

const cats = {};
all.forEach(p => cats[p.category]=(cats[p.category]||0)+1);
console.log('Final catalog:', cats);
console.log('Total:', all.length, 'produkter');
