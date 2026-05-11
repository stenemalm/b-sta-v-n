import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath  = 'C:/Users/Alexander Stenemalm/Desktop/zoodrop_utf8 (1).csv';
const productsPath = path.join(__dirname, '../lib/products.js');

// ─── Load existing products ────────────────────────────────────────────────
const { products: existing } = await import(pathToFileURL(productsPath).href);
const knownArticles = new Set(existing.map(p => p.articleNumber).filter(Boolean));
const knownSuch     = new Set(); // track SUCHNUMMER to avoid size-variant duplicates
let nextId = Math.max(...existing.map(p => p.id)) + 1;

// Count what we already have per category
const catCount = {};
for (const p of existing) catCount[p.category] = (catCount[p.category] || 0) + 1;

// ─── Per-category limits (target total including existing) ─────────────────
const LIMITS = {
  snacks:       35,
  kosttillskott:20,
  transport:    25,
  halsband:     20,
  balkong:      15,
  skalar:       22,
  baddar:       30,
  vard:         18,
  leksaker:     65,
  mobler:       50,
  sand:         38,
  torrfoder:    50,
  vatfoder:     95,
};

function hasRoom(slug) {
  return (catCount[slug] || 0) < (LIMITS[slug] || 20);
}

// ─── CSV parser ────────────────────────────────────────────────────────────
function parseCSVLine(line) {
  const fields = [];
  let inQ = false, cur = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === ';' && !inQ) {
      fields.push(cur); cur = '';
    } else cur += c;
  }
  fields.push(cur);
  return fields;
}

// ─── ZooDrop category → site slug ─────────────────────────────────────────
function mapCat(zCat) {
  if (!zCat?.includes('Katzenwelt')) return null;
  if (zCat.includes('Trockenfutter'))     return 'torrfoder';
  if (zCat.includes('Nassfutter'))        return 'vatfoder';
  if (zCat.includes('Katzensnacks'))      return 'snacks';
  if (zCat.includes('Futterergänzung'))   return 'kosttillskott';
  if (zCat.includes('Katzennäpfe'))       return 'skalar';
  if (zCat.includes('Pflege & Gesundheit')) return 'vard';
  if (zCat.includes('Kratzbäume'))        return 'mobler';
  if (zCat.includes('Katzenspielzeug'))   return 'leksaker';
  if (zCat.includes('Katzenbetten'))      return 'baddar';
  if (zCat.includes('Toiletten'))         return 'sand';
  if (zCat.includes('Katzentransport'))   return 'transport';
  if (zCat.includes('Katzenhalsbänder')) return 'halsband';
  if (zCat.includes('Balkon & Garten'))   return 'balkong';
  return null;
}

// ─── Translation dictionaries ──────────────────────────────────────────────
const nameRules = [
  [/\bfür\b/gi,'för'],[/\bund\b/gi,'och'],[/\bmit\b/gi,'med'],
  [/\bSchwarz\b/gi,'Svart'],[/\bschwarz\b/gi,'svart'],
  [/\bWeiß\b/gi,'Vit'],[/\bweiß\b/gi,'vit'],[/\bWeiss\b/gi,'Vit'],
  [/\bGrau\b/gi,'Grå'],[/\bgrau\b/gi,'grå'],
  [/\bBraun\b/gi,'Brun'],[/\bbraun\b/gi,'brun'],
  [/\bRot\b/gi,'Röd'],[/\brot\b/gi,'röd'],
  [/\bBlau\b/gi,'Blå'],[/\bblau\b/gi,'blå'],
  [/\bGrün\b/gi,'Grön'],[/\bgrün\b/gi,'grön'],
  [/\bGelb\b/gi,'Gul'],[/\bgelb\b/gi,'gul'],
  [/\bRosa\b/gi,'Rosa'],
  [/\bBeige\b/gi,'Beige'],
  [/\bGroß\b/gi,'Stor'],[/\bgroß\b/gi,'stor'],[/\bgrosse\b/gi,'stor'],
  [/\bKlein\b/gi,'Liten'],[/\bklein\b/gi,'liten'],
  [/\bStück\b/gi,'st'],[/\bStucke\b/gi,'st'],
  [/\bKatze\b/gi,'katt'],[/\bKatzen\b/gi,'katter'],
  [/\bKatzenhalsband\b/gi,'katthalsbband'],
  [/\bHalsband\b/gi,'halsband'],
  [/\bGeschirr\b/gi,'sele'],
  [/\bTragetasche\b/gi,'bärväska'],
  [/\bTransportbox\b/gi,'transportlåda'],
  [/\bTransport\b/gi,'transport'],
  [/\bReise\b/gi,'resa'],
  [/\bNetz\b/gi,'nät'],[/\bSchutzgitter\b/gi,'skyddsgaller'],
  [/\bSchutznetz\b/gi,'skyddsnät'],
  [/\bKlappe\b/gi,'lucka'],
  [/\bKatzennapf\b/gi,'kattskål'],
  [/\bNapf\b/gi,'skål'],
  [/\bTrinkbrunnen\b/gi,'dricksfontän'],
  [/\bFuttermatte\b/gi,'fodermatta'],
  [/\bMatte\b/gi,'matta'],
  [/\bBett\b/gi,'säng'],
  [/\bKorb\b/gi,'korg'],
  [/\bHöhle\b/gi,'grotta'],
  [/\bKissen\b/gi,'kudde'],
  [/\bHaus\b/gi,'hus'],
  [/\bKratzbaum\b/gi,'kattträd'],
  [/\bKratzbrett\b/gi,'skrapbräda'],
  [/\bKratzstamm\b/gi,'skrapstolpe'],
  [/\bKratztonne\b/gi,'skrapfat'],
  [/\bSpielzeug\b/gi,'leksak'],
  [/\bSpielangel\b/gi,'fiskespö'],
  [/\bSnacks?\b/gi,'godbitar'],
  [/\bLeckerli\b/gi,'godis'],
  [/\bFuttermittel\b/gi,'foder'],
  [/\bErgänzung\b/gi,'tillskott'],
  [/\bGesundheit\b/gi,'hälsa'],
  [/\bPflege\b/gi,'vård'],
  [/\bBalkon\b/gi,'balkong'],
  [/\bGarten\b/gi,'trädgård'],
  [/\bStahlnapf\b/gi,'stålskål'],
  [/\bEdelstahl\b/gi,'rostfritt stål'],
  [/\bKeramik\b/gi,'keramik'],
  [/\bSilikon\b/gi,'silikon'],
  [/\bGummi\b/gi,'gummi'],
  [/\bHolz\b/gi,'trä'],
  [/\bSisal\b/gi,'sisal'],
  [/\bFleece\b/gi,'fleece'],
  [/\bPlüsch\b/gi,'plysch'],
  [/\bWolle\b/gi,'ull'],
  [/\bBaumwolle\b/gi,'bomull'],
  [/\bPolyester\b/gi,'polyester'],
  [/\bKunststoff\b/gi,'plast'],
  [/\bMetall\b/gi,'metall'],
];

const descRules = [
  [/<[^>]+>/g, ' '],        // strip HTML
  [/&amp;/g, '&'], [/&lt;/g, '<'], [/&gt;/g, '>'],
  [/&nbsp;/g, ' '], [/&#\d+;/g, ''],
  [/\s{2,}/g, ' '],
  [/\bKatze\b/gi,'katt'],[/\bKatzen\b/gi,'katter'],
  [/\bund\b/gi,'och'],[/\bfür\b/gi,'för'],[/\bmit\b/gi,'med'],
  [/\bIhr\b/gi,'din'],[/\bIhre\b/gi,'din'],
  [/\bGesundheit\b/gi,'hälsa'],[/\bPflege\b/gi,'vård'],
  [/\bSpielen\b/gi,'leka'],[/\bSpielzeug\b/gi,'leksak'],
  [/\bFutter\b/gi,'mat'],[/\bErnährung\b/gi,'näring'],
  [/\bNahrung\b/gi,'föda'],[/\bProtein\b/gi,'protein'],
  [/\bVitamin\b/gi,'vitamin'],[/\bMineralien\b/gi,'mineraler'],
  [/\bTräger\b/gi,'bärare'],[/\bReise\b/gi,'resa'],
  [/\bTransport\b/gi,'transport'],[/\bSicherheit\b/gi,'säkerhet'],
  [/\bKomfort\b/gi,'komfort'],[/\bNatur\b/gi,'natur'],
  [/\bHochwertig\b/gi,'högkvalitativ'],[/\bhochwertig\b/gi,'högkvalitativ'],
  [/\bLanglebig\b/gi,'hållbar'],[/\blanglebig\b/gi,'hållbar'],
  [/\bLeicht\b/gi,'lätt'],[/\bEinfach\b/gi,'enkel'],
  [/\bReinigen\b/gi,'rengöra'],[/\bWaschen\b/gi,'tvätta'],
  [/\bSchwarz\b/gi,'svart'],[/\bWeiß\b/gi,'vit'],[/\bGrau\b/gi,'grå'],
];

function tr(s, rules) {
  let t = s || '';
  for (const [p, r] of rules) t = t.replace(p, r);
  return t.trim();
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

function slug(name, id) {
  return (name || 'produkt').toLowerCase()
    .replace(/[äåá]/g,'a').replace(/[öø]/g,'o').replace(/[üú]/g,'u')
    .replace(/[é]/g,'e').replace(/[ß]/g,'ss')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50) + '-' + id;
}

function price(eurStr) {
  const n = parseFloat((eurStr || '0').replace(',', '.')) || 1;
  return Math.max(10, Math.ceil(n * 10.87 * 1.38 / 5) * 5);
}

function placeholder(cat) {
  const m = { snacks:'🎁', kosttillskott:'💊', skalar:'🥣', vard:'💊',
               mobler:'🌳', leksaker:'🐾', baddar:'😴', sand:'🪨',
               transport:'🧳', halsband:'🎀', balkong:'🌿',
               torrfoder:'🌾', vatfoder:'🍖' };
  return m[cat] || '✨';
}

// ─── Parse CSV ────────────────────────────────────────────────────────────
console.log('Läser CSV...');
const lines = readFileSync(csvPath, 'utf8').split('\n');
const header = parseCSVLine(lines[0]);
const IDX = {};
header.forEach((h, i) => { IDX[h] = i; });

const newProducts = [];
let skippedNoSale = 0, skippedNoCat = 0, skippedDup = 0, skippedFull = 0, skippedNoImg = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const f = parseCSVLine(line);
  const status  = f[IDX['VERKAUFSSTATUS']] || '';
  const lager   = f[IDX['LAGERSTATUS']]   || '';
  const bestand = parseInt(f[IDX['BESTAND']] || '0');
  const katStr  = f[IDX['KATEGORIE']]     || '';
  const such    = f[IDX['SUCHNUMMER']]    || '';
  const artikel = f[IDX['ARTIKELNUMMER']] || '';
  const ean     = f[IDX['EAN']]           || '';
  const bild1   = f[IDX['BILD1']]         || '';
  const extraImgs = ['BILD2','BILD3','BILD4','BILD5','BILD6','BILD7','BILD8']
    .map(k => f[IDX[k]] || '').filter(Boolean);

  // Skip if not for sale
  if (status === 'Kein Verkauf') { skippedNoSale++; continue; }
  // Need stock (or fullfillment)
  if (bestand === 0 && lager !== 'Fullfillment') continue;
  // Need image
  if (!bild1) { skippedNoImg++; continue; }

  // Determine category (first Katzenwelt path wins)
  const paths = katStr.split('|');
  let siteCat = null;
  for (const p of paths) {
    siteCat = mapCat(p.trim());
    if (siteCat) break;
  }
  if (!siteCat) { skippedNoCat++; continue; }

  // Skip already-imported article numbers
  if (knownArticles.has(artikel)) { skippedDup++; continue; }

  // Skip SUCHNUMMER duplicates (size variants — keep first/best)
  if (such && knownSuch.has(such)) { skippedDup++; continue; }

  // Check category limit
  if (!hasRoom(siteCat)) { skippedFull++; continue; }

  // Build product
  const rawName = f[IDX['TITEL']] || '';
  const rawDesc = f[IDX['BESCHREIBUNG']] || '';
  const brand   = f[IDX['HERSTELLER']] || '';
  const eurPrice = f[IDX['VERKAUFSPREIS']] || '0';
  const menge   = f[IDX['GRUNDPREIS_MENGE']] || '';
  const einheit = f[IDX['GRUNDPREIS_EINHEIT']] || '';

  const svName  = cap(tr(rawName, nameRules));
  const svDesc  = cap(tr(rawDesc, descRules)).slice(0, 400);
  const weight  = menge && einheit ? `${menge} ${einheit}` : null;
  const id      = nextId++;

  const allImgs = [bild1, ...extraImgs].filter(Boolean);
  const prod = {
    id,
    slug:         slug(svName, id),
    name:         svName.replace(/"/g, '\\"'),
    brand,
    category:     siteCat,
    price:        price(eurPrice),
    originalPrice: null,
    image:        bild1,
    images:       allImgs,
    placeholder:  placeholder(siteCat),
    weight,
    rating:       +(3.8 + Math.random() * 1.1).toFixed(1),
    reviews:      Math.floor(10 + Math.random() * 180),
    badge:        null,
    description:  svDesc.replace(/"/g, '\\"'),
    rawDescription: rawDesc.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' '),
    tags:         [],
    inStock:      true,
    articleNumber: artikel,
    suchnummer:   such,
    ean,
  };

  newProducts.push(prod);
  catCount[siteCat] = (catCount[siteCat] || 0) + 1;
  knownArticles.add(artikel);
  if (such) knownSuch.add(such);
}

console.log(`\nNya produkter: ${newProducts.length}`);
console.log(`Hoppa over (ej till salu): ${skippedNoSale}`);
console.log(`Hoppa over (ej katt):      ${skippedNoCat}`);
console.log(`Hoppa over (dublett):      ${skippedDup}`);
console.log(`Hoppa over (kategori full):${skippedFull}`);
console.log(`Hoppa over (ingen bild):   ${skippedNoImg}`);

// ─── Write updated products.js ────────────────────────────────────────────
const content = readFileSync(productsPath, 'utf8');
const getFnIdx = content.indexOf('export function getProduct');
const trailing = getFnIdx > -1 ? content.slice(getFnIdx) : '';

// Get categories line from existing file
const catEnd = content.indexOf('export const products = [');
const catSection = content.slice(0, catEnd);

function esc(s) { return (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"'); }

function toJs(p) {
  const w   = p.weight        ? `"${esc(p.weight)}"` : 'null';
  const op  = p.originalPrice ?? 'null';
  const bad = p.badge         ? `"${esc(p.badge)}"`  : 'null';
  const an  = p.articleNumber ? `"${esc(p.articleNumber)}"` : 'null';
  const en  = p.ean           ? `"${esc(p.ean)}"`    : 'null';
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
    tags: ${JSON.stringify(p.tags || [])},
    inStock: ${p.inStock},
    articleNumber: ${an},
    ean: ${en},
  }`;
}

// Regenerate all existing product JS too (preserving ean field)
const allProducts = [
  ...existing.map(p => ({ ...p, ean: p.ean || null })),
  ...newProducts,
];
const productsJs = allProducts.map(toJs).join(',\n');
const newContent = catSection + 'export const products = [\n' + productsJs + '\n];\n\n' + trailing;
writeFileSync(productsPath, newContent, 'utf8');

// ─── Summary ──────────────────────────────────────────────────────────────
console.log('\n=== Kategorier efter import ===');
for (const [k, v] of Object.entries(catCount).sort((a,b) => b[1]-a[1])) {
  const bar = '█'.repeat(Math.floor(v / 2));
  console.log(`  ${k.padEnd(15)}: ${String(v).padStart(3)}  ${bar}`);
}
console.log(`\nTotalt: ${allProducts.length} produkter`);
