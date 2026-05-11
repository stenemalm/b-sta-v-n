// Replaces ZooDrop image URLs in products.js with local /images/products/ paths
// Only for images that actually exist in public/images/products/
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsPath = path.join(__dirname, '../lib/products.js');
const localDir = path.join(__dirname, '../public/images/products');

let content = readFileSync(productsPath, 'utf8');

const urlRegex = /https:\/\/[^\s"]+\.(?:jpg|png|webp|jpeg)/g;
let replaced = 0;
let skipped = 0;

content = content.replace(urlRegex, (url) => {
  const filename = path.basename(url.split('?')[0]);
  const localPath = path.join(localDir, filename);
  if (existsSync(localPath)) {
    replaced++;
    return `/images/products/${filename}`;
  }
  skipped++;
  return url;
});

writeFileSync(productsPath, content, 'utf8');
console.log(`Klart! ${replaced} URL:er ersatta med lokala sökvägar, ${skipped} behöll ZooDrop-URL`);
