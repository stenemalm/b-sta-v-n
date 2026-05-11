import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsPath = path.join(__dirname, '../lib/products.js');

// Load current products via dynamic import
const fileUrl = pathToFileURL(productsPath).href;
const { products } = await import(fileUrl);

// Read the file to extract the getProduct function at the end
const content = readFileSync(productsPath, 'utf8');
const getFnIdx = content.indexOf('export function getProduct');
const trailingFunctions = getFnIdx > -1 ? content.slice(getFnIdx) : '';

// ─── New category structure (matches ZooDrop Katzenwelt) ───────────────────
const newCategories = [
  { slug: 'torrfoder',  name: 'Torrfoder',          icon: '🌾' },
  { slug: 'vatfoder',   name: 'Våtfoder',           icon: '🍖' },
  { slug: 'snacks',        name: 'Kattsnacks',         icon: '🎁' },
  { slug: 'kosttillskott', name: 'Kosttillskott',     icon: '💊' },
  { slug: 'skalar',        name: 'Skålar & Fontäner', icon: '🥣' },
  { slug: 'vard',       name: 'Vård & Hälsa',       icon: '💊' },
  { slug: 'mobler',     name: 'Kattträd & Möbler',  icon: '🌳' },
  { slug: 'leksaker',   name: 'Kattleksaker',       icon: '🐾' },
  { slug: 'baddar',     name: 'Bäddar & Korgar',    icon: '😴' },
  { slug: 'sand',       name: 'Toalett & Sand',     icon: '🪨' },
  { slug: 'transport',  name: 'Transport & Resor',  icon: '🧳' },
  { slug: 'halsband',   name: 'Halsband & Selar',   icon: '🎀' },
  { slug: 'balkong',    name: 'Balkong & Trädgård', icon: '🌿' },
];

// ─── Reclassification logic ────────────────────────────────────────────────
function reclassify(p) {
  const n = ((p.name || '') + ' ' + (p.description || '')).toLowerCase();

  // Food: split mat → torrfoder / vatfoder
  if (p.category === 'mat') {
    return (p.tags || []).includes('torrfoder') ? 'torrfoder' : 'vatfoder';
  }

  // Sand & sand-related: stay
  if (p.category === 'sand') return 'sand';

  // Möbler: stay (scratch posts, cat trees, wall furniture)
  if (p.category === 'mobler') return 'mobler';

  // Reclassify tillbehor ─────────────────────────────────────────────────────
  if (p.category === 'tillbehor') {

    // Wall furniture / cat houses that ended up in tillbehor
    if (n.match(/klättervägg|wandregal|vägghylla|kletterwand|katthus/)) return 'mobler';

    // Beds, mats, cushions, hammocks
    if (n.match(/termomatta|kylmatta|gossäng|hängmatta|kudde|bädd|liggmatta|värmematta/)) return 'baddar';

    // Bowls, fountains, feeders, water dispensers
    if (n.match(/skål|napf|fontän|dricksfontän|fountain|trinkbrunnen|feeder|vattenkanna|foderskopa|matskopa/)) return 'skalar';

    // Health & care
    if (n.match(/spray|apotek|apotheke|pälsvård|ögon|öronvård|tandvård|klovård|parasit|loppor|fästingar/)) return 'vard';

    // Collars & harnesses
    if (n.match(/halsband|koppel|selar|sele|krage/)) return 'halsband';

    // Transport bags / carriers
    if (n.match(/bärväsk|transportbox|transportlåd|resväsk|carrier|träger/)) return 'transport';

    // Balcony & garden
    if (n.match(/skyddsnät|balkong|trädgård|kattlucka|avskräck/)) return 'balkong';

    // Everything else: toys (mice, rods, balls, tunnels, electronic toys…)
    return 'leksaker';
  }

  return p.category;
}

// ─── Apply reclassification ────────────────────────────────────────────────
const stats = {};
const reclassified = products.map(p => {
  const newCat = reclassify(p);
  stats[`${p.category} → ${newCat}`] = (stats[`${p.category} → ${newCat}`] || 0) + 1;
  return { ...p, category: newCat };
});

// ─── Generate new products.js ──────────────────────────────────────────────
const catJs = `export const categories = [\n${newCategories.map(c =>
  `  { slug: "${c.slug}", name: "${c.name}", icon: "${c.icon}" }`
).join(',\n')}\n];`;

function esc(s) { return (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"'); }

const productsJs = reclassified.map(p => {
  const w    = p.weight       ? `"${esc(p.weight)}"` : 'null';
  const op   = p.originalPrice ? p.originalPrice     : 'null';
  const bad  = p.badge        ? `"${esc(p.badge)}"`  : 'null';
  const tags = JSON.stringify(p.tags || []);
  const an   = p.articleNumber ? `"${esc(p.articleNumber)}"` : 'null';
  return `  {
    id: ${p.id},
    slug: "${esc(p.slug)}",
    name: "${esc(p.name)}",
    brand: "${esc(p.brand)}",
    category: "${p.category}",
    price: ${p.price},
    originalPrice: ${op},
    image: "${esc(p.image)}",
    placeholder: "${p.placeholder}",
    weight: ${w},
    rating: ${p.rating},
    reviews: ${p.reviews},
    badge: ${bad},
    description: "${esc(p.description)}",
    tags: ${tags},
    inStock: ${p.inStock},
    articleNumber: ${an},
  }`;
}).join(',\n');

const newContent = `${catJs}\n\nexport const products = [\n${productsJs}\n];\n\n${trailingFunctions}`;
writeFileSync(productsPath, newContent, 'utf8');

// ─── Report ───────────────────────────────────────────────────────────────
console.log('\n=== Omklassificering klar ===');
console.log(`Totalt: ${reclassified.length} produkter\n`);
console.log('Kategorifördelning:');
const catCount = {};
for (const p of reclassified) catCount[p.category] = (catCount[p.category] || 0) + 1;
for (const [k, v] of Object.entries(catCount).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${k.padEnd(14)}: ${v}`);
}
console.log('\nFlytt-log:');
for (const [k, v] of Object.entries(stats).filter(([k]) => !k.includes('→ ' + k.split(' → ')[0]))) {
  console.log(`  ${k}: ${v}`);
}
