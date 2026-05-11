const BASE = 'https://api.bigbuy.eu';
const KEY  = process.env.BIGBUY_API_KEY ?? '';

function headers() {
  return {
    'Authorization': `Bearer ${KEY}`,
    'Content-Type': 'application/json',
  };
}

export async function bbGet(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: headers(), cache: 'no-store' });
  if (!res.ok) throw new Error(`BigBuy ${path} → ${res.status}`);
  return res.json();
}

export async function bbPost(path: string, body: object) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BigBuy POST ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Katalog ────────────────────────────────────────────────────────────────

export async function getTaxonomies() {
  return bbGet('/rest/catalog/taxonomies.json?firstLevel');
}

// Hämta alla produkter under djurkategorin (ID 19666)
export async function getPetProducts() {
  return bbGet('/rest/catalog/products.json?parentTaxonomy=19666');
}

export async function getPetProductInfo() {
  return bbGet('/rest/catalog/productsinformation.json?isoCode=sv&parentTaxonomy=19666');
}

export async function getPetProductImages() {
  return bbGet('/rest/catalog/productsimages.json?parentTaxonomy=19666');
}

export async function getPetStock() {
  return bbGet('/rest/catalog/productsstockbyhandlingdays.json?parentTaxonomy=19666');
}

// ── Frakt ──────────────────────────────────────────────────────────────────

export async function getShippingRates(products: { reference: string; quantity: number }[], postcode: string) {
  return bbPost('/rest/shipping/orders.json', {
    order: {
      shippingAddress: {
        country: 'SE',
        postcode,
      },
      products,
    },
  });
}

// ── Order ──────────────────────────────────────────────────────────────────

export interface BigBuyOrderItem {
  reference: string;   // BigBuy:s interna referenskod (hämtas vid katalog-sync)
  quantity: number;
}

export interface BigBuyAddress {
  firstName: string;
  lastName: string;
  address: string;
  postcode: string;
  town: string;
  country: string;    // "SE" för Sverige
  phone: string;
  email: string;
  province?: string;
  company?: string;
  comment?: string;
}

// Kontrollera om ordern går igenom innan den skapas
export async function checkOrder(ref: string, address: BigBuyAddress, items: BigBuyOrderItem[]) {
  return bbPost('/rest/order/check/multishipping.json', buildOrderBody(ref, address, items));
}

// Skapa ordern hos BigBuy — de packar och skickar till kunden
export async function createOrder(ref: string, address: BigBuyAddress, items: BigBuyOrderItem[]) {
  return bbPost('/rest/order/create/multishipping.json', buildOrderBody(ref, address, items));
}

function buildOrderBody(ref: string, address: BigBuyAddress, items: BigBuyOrderItem[]) {
  return {
    order: {
      internalReference: ref,
      language: 'sv',
      paymentMethod: 'moneybox',          // Dras från ditt BigBuy-saldo
      carriers: [{ code: 'CORREOS_EXPRESS' }],
      shippingAddress: {
        firstName:  address.firstName,
        lastName:   address.lastName,
        company:    address.company ?? '',
        address:    address.address,
        postcode:   address.postcode.replace(/\s/g, ''),
        town:       address.town,
        province:   address.province ?? address.town,
        country:    'SE',
        phone:      address.phone,
        email:      address.email,
        comment:    address.comment ?? '',
      },
      products: items,
    },
  };
}
