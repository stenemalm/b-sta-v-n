import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Translation dictionary for names
const nameDict = [
  [/\bTrockenfutter\b/gi,'Torrfoder'],[/\bNassfutter\b/gi,'Våtmat'],
  [/\bTruthahn\b/gi,'kalkon'],[/\bFasan\b/gi,'fasan'],[/\bLachs\b/gi,'lax'],
  [/\bPUR\b/g,'ren'],[/\bPur\b/g,'ren'],[/\bKalb\b/gi,'kalv'],
  [/\bPouch\b/gi,'påse'],[/\bDose\b/gi,'burk'],[/\bKitten\b/gi,'kattunge'],
  [/\bAdult\b/gi,'vuxen'],[/\bWild\b/gi,'vilt'],[/\bPute\b/gi,'kalkon'],
  [/\bEnte\b/gi,'anka'],[/\bHuhn\b/gi,'kyckling'],[/\bLamm\b/gi,'lamm'],
  [/\bRind\b/gi,'nötkött'],[/\bKaninchen\b/gi,'kanin'],[/\bShrimps\b/gi,'räkor'],
  [/\bGeflügel\b/gi,'fjäderfä'],[/\bFisch\b/gi,'fisk'],[/\bThunfisch\b/gi,'tonfisk'],
  [/\bSeelachs\b/gi,'sej'],[/\bDelicatessen\b/gi,'delikatesser'],
  [/\bDeliCatessen\b/gi,'delikatesser'],[/vom Feinsten/gi,'av finaste sort'],
  [/\bSelection\b/gi,'urval'],[/in Gelee/gi,'i gelé'],[/in Sauce/gi,'i sås'],
  [/in Aspik/gi,'i aspik'],[/\bmit\b/gi,'med'],[/\bund\b/gi,'och'],
  [/\bfür\b/gi,'för'],[/\bKatze\b/gi,'katt'],[/\bKatzen\b/gi,'katter'],
  [/\bSenior\b/gi,'senior'],[/\bSterilised\b/gi,'steriliserad'],
  [/\bSensitive\b/gi,'känslig'],[/\bMulitpack\b/gi,'Multipack'],
  [/\bAuflauf\b/gi,'gryta'],[/\bRagout\b/gi,'ragout'],
  [/\bHuhn & Lachs\b/gi,'kyckling & lax'],[/\bKräuter\b/gi,'örter'],
  [/\bSupreme\b/gi,'premium'],[/\bNature\b/gi,'natur'],
  [/\bChunky\b/gi,'bitar'],[/\bFilets\b/gi,'filéer'],[/\bFilet\b/gi,'filé'],
  [/Milkies/gi,'Milkies'],[/Knusperkissen/gi,'knapriga kuddar'],
  [/\bWellness\b/gi,'välmående'],[/\bBalance\b/gi,'balans'],
  [/\bFeine\b/gi,'fina'],[/\bNaturelle\b/gi,'naturell'],[/\bNatur\b/gi,'natur'],
  [/\bDuck\b/gi,'anka'],[/\bTurkey\b/gi,'kalkon'],[/\bPuppy\b/gi,'valp'],
  [/\bJunior\b/gi,'junior'],[/\bLight\b/gi,'light'],[/\bMini\b/gi,'mini'],
  [/\bMaxi\b/gi,'maxi'],[/\bGelée\b/gi,'gelé'],[/\bGele\b/gi,'gelé'],
  [/\bPaté\b/gi,'paté'],[/\bPastete\b/gi,'paté'],[/\bBrühe\b/gi,'buljong'],
  [/\bHäppchen\b/gi,'bitar'],[/\bStücke\b/gi,'bitar'],[/\bFlocken\b/gi,'flingor'],
  [/\bGarnelen\b/gi,'räkor'],[/\bSchrimps\b/gi,'räkor'],[/\bKrebse\b/gi,'kräftor'],[/\bThon\b/gi,'tonfisk'],
  [/\bRehfleisch\b/gi,'rådjurskött'],[/\bHirsch\b/gi,'hjort'],[/\bElch\b/gi,'älg'],
  [/\bBüffel\b/gi,'buffel'],[/\bStrauß\b/gi,'struts'],[/\bKänguru\b/gi,'känguru'],
  [/\bPferd\b/gi,'häst'],[/\bForelle\b/gi,'forell'],[/\bSardinelle\b/gi,'sardin'],
];

// Translation dictionary for descriptions
const descDict = [
  [/Katze/g,'katt'],[/Katzen/g,'katter'],[/Futter/g,'mat'],
  [/Fleisch/g,'kött'],[/Huhn/g,'kyckling'],[/Lachs/g,'lax'],
  [/\bund\b/g,'och'],[/\bfür\b/g,'för'],[/\bdie\b/g,''],
  [/\bder\b/g,''],  [/\bdes\b/g,''],  [/\bdas\b/g,''],
  [/\beine\b/gi,'en'],[/\bein\b/gi,'en'],[/natürlich/gi,'naturlig'],
  [/\bhochwert/gi,'högkvalitativ'],[/Protein/gi,'protein'],
  [/\bGeschmack\b/gi,'smak'],[/\bGesundheit\b/gi,'hälsa'],
  [/\bVerdauung\b/gi,'matsmältning'],[/\bFell\b/gi,'päls'],
  [/\bImmun/gi,'immun'],[/\bEnergie\b/gi,'energi'],
  [/\bNährstoff/gi,'näringsstoff'],[/\bVitamin/gi,'vitamin'],
  [/\btäglich\b/gi,'dagligen'],[/\bnatürliche\b/gi,'naturliga'],
];

function tr(s, dict) {
  let t = s || '';
  for (const [p, r] of dict) t = t.replace(p, r);
  return t.trim();
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

function slug(s, id) {
  return (s||'produkt').toLowerCase()
    .replace(/[äå]/g,'a').replace(/ö/g,'o').replace(/ü/g,'u').replace(/é/g,'e')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55) + '-' + id;
}

function price(eur) {
  const n = parseFloat((eur||'0').replace(',','.')) || 1;
  return Math.max(10, Math.ceil(n * 10.87 * 1.38 / 5) * 5);
}

function placeholder(typ) {
  return typ === 'dry' ? '🌾' : '🍖';
}

// Read TSV
const tsv = readFileSync(path.join(__dirname,'full-food-raw.tsv'),'utf8');
const lines = tsv.split('\n').slice(1).filter(l => l.trim()); // skip header

let id = 300;
const newProducts = lines.map(line => {
  const sepIdx = line.indexOf('|||');
  const main = line.substring(0, sepIdx).split('|');
  const desc = line.substring(sepIdx + 3).trim();

  const [artikelnummer, ean, hersteller, titel, verkaufspreis, bild1, menge, einheit, typ] = main;

  const name = cap(tr(titel, nameDict));
  const descSv = desc ? cap(tr(desc, descDict)).slice(0, 400) : `Premium kattmat från ${hersteller}. Noggrant utvalt för din katts hälsa och välmående.`;
  const weight = menge && einheit ? `${menge} ${einheit}` : null;

  return {
    id: id++,
    slug: slug(name, id-1),
    name: name.replace(/"/g,'\\"'),
    brand: hersteller,
    category: 'mat',
    price: price(verkaufspreis),
    originalPrice: null,
    image: bild1 || '',
    placeholder: placeholder(typ),
    weight: weight,
    rating: +(3.8 + Math.random()*1.1).toFixed(1),
    reviews: Math.floor(10 + Math.random()*180),
    badge: null,
    description: descSv.replace(/"/g,'\\"'),
    tags: [typ === 'dry' ? 'torrfoder' : 'vatfoder'],
    inStock: true,
    articleNumber: artikelnummer,
  };
});

// Add badges to first of each brand
const seen = new Set();
for (const p of newProducts) {
  if (!seen.has(p.brand)) { p.badge = 'Populär'; seen.add(p.brand); }
}

// Read current products.js - keep sand + mobler + tillbehor
const productsPath = path.join(__dirname,'../lib/products.js');
const content = readFileSync(productsPath,'utf8');
const lines2 = content.split('\n');

// Find categories section end
const catEnd = content.indexOf('export const products = [');
const categoriesSection = content.slice(0, catEnd + 'export const products = ['.length);

// Keep non-mat products from current file
const blockRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)?\s*inStock:\s*(true|false),?\s*\}/g;
const allBlocks = [...content.matchAll(blockRegex)].map(m => m[0]);
const keepBlocks = allBlocks.filter(b => b.includes('"sand"') || b.includes('"mobler"') || b.includes('"tillbehor"'));

// Generate JS for new food products
const foodJs = newProducts.map(p => {
  const w = p.weight ? `"${p.weight}"` : 'null';
  const badge = p.badge ? `"${p.badge}"` : 'null';
  const tags = JSON.stringify(p.tags);
  return `  {
    id: ${p.id},
    slug: "${p.slug}",
    name: "${p.name}",
    brand: "${p.brand}",
    category: "mat",
    price: ${p.price},
    originalPrice: null,
    image: "${p.image}",
    placeholder: "${p.placeholder}",
    weight: ${w},
    rating: ${p.rating},
    reviews: ${p.reviews},
    badge: ${badge},
    description: "${p.description}",
    tags: ${tags},
    inStock: true,
    articleNumber: "${p.articleNumber}",
  }`;
});

// Find getProduct function
const getProductIdx = content.indexOf('export function getProduct');
const trailingFunctions = content.slice(getProductIdx);

const newContent = categoriesSection + '\n' +
  [...foodJs, ...keepBlocks].join(',\n') +
  '\n];\n\n' + trailingFunctions;

writeFileSync(productsPath, newContent, 'utf8');

console.log(`Done!`);
console.log(`  Mat (torrfoder+våtfoder): ${newProducts.length}`);
console.log(`  Sand/möbler/tillbehör: ${keepBlocks.length}`);
console.log(`  Total: ${newProducts.length + keepBlocks.length}`);

// Show brand summary
const brands = {};
for (const p of newProducts) brands[p.brand] = (brands[p.brand]||0)+1;
console.log('\nMärken:');
for (const [b,c] of Object.entries(brands)) console.log(`  ${b}: ${c}`);
