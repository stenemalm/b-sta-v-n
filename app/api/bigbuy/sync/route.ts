import { NextResponse } from 'next/server';
import { getPetProducts, getPetProductInfo, getPetProductImages, getPetStock } from '@/lib/bigbuy';
import fs from 'fs/promises';
import path from 'path';

// Anropa: POST /api/bigbuy/sync  (kör manuellt eller via cron)
// Synkar produkter, priser, bilder och lagerstatus från BigBuy till katalogen
export async function POST() {
  try {
    const [products, info, images, stock] = await Promise.all([
      getPetProducts(),
      getPetProductInfo(),
      getPetProductImages(),
      getPetStock(),
    ]);

    // Bygg lookup-tabeller för snabb matchning
    const infoMap: Record<string, any>  = {};
    const imgMap: Record<string, any[]> = {};
    const stockMap: Record<string, number> = {};

    for (const p of info?.productInformation ?? []) {
      infoMap[p.id] = p;
    }
    for (const p of images?.productImages ?? []) {
      imgMap[p.id] = p.images ?? [];
    }
    for (const p of stock?.productStocks ?? []) {
      stockMap[p.sku] = p.quantity ?? 0;
    }

    // Bygg katalog — en post per produkt
    const MARGIN = 1.40;  // 40% pålägg på BigBuy:s pris
    const SEK_RATE = 11.5; // EUR → SEK (uppdatera vid behov)

    const catalog = (products?.products ?? []).map((p: any) => {
      const inf   = infoMap[p.id] ?? {};
      const imgs  = imgMap[p.id] ?? [];
      const qty   = stockMap[p.sku] ?? 0;
      const priceEur = parseFloat(p.retailPrice ?? p.price ?? '0');
      const priceSek = Math.ceil(priceEur * SEK_RATE * MARGIN / 5) * 5; // rundat till närmaste 5 kr

      return {
        bigbuyId:    p.id,
        bigbuyRef:   p.sku,          // <-- detta är referensen som används vid orderläggning
        name:        inf.name ?? p.description ?? p.sku,
        description: inf.description ?? '',
        brand:       p.manufacturer ?? '',
        price:       priceSek,
        priceEur:    priceEur,
        image:       imgs[0]?.url ?? null,
        images:      imgs.map((i: any) => i.url),
        inStock:     qty > 0,
        stock:       qty,
        weight:      p.weight ? `${p.weight} kg` : null,
      };
    });

    // Spara till fil som sidan kan läsa
    const outPath = path.join(process.cwd(), 'data', 'bigbuy-catalog.json');
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify({ syncedAt: new Date().toISOString(), products: catalog }, null, 2));

    return NextResponse.json({ success: true, count: catalog.length, syncedAt: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// GET /api/bigbuy/sync — visa senaste sync-status
export async function GET() {
  try {
    const outPath = path.join(process.cwd(), 'data', 'bigbuy-catalog.json');
    const raw = await fs.readFile(outPath, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json({ syncedAt: data.syncedAt, count: data.products.length });
  } catch {
    return NextResponse.json({ syncedAt: null, count: 0, note: 'Kör POST /api/bigbuy/sync för att starta synk' });
  }
}
