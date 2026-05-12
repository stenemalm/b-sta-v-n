'use client';
import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/AddToCartButton';

type Product = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  image?: string | null;
  placeholder: string;
  weight?: string | null;
  badge?: string | null;
};

export default function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
      {products.map(p => (
        <div key={p.id}
          style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: '#fff', transition: 'box-shadow 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.09)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
          <Link href={`/produkt/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{ height: 210, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {p.image ? (
                <Image src={p.image} alt={p.name} fill style={{ objectFit: 'contain', padding: '1.5rem' }} />
              ) : (
                <span style={{ fontSize: '5rem' }}>{p.placeholder}</span>
              )}
            </div>
          </Link>
          <div style={{ padding: '1.125rem' }}>
            {p.badge && (
              <span style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99, letterSpacing: '0.04em' }}>
                {p.badge}
              </span>
            )}
            <Link href={`/produkt/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '0.95rem', margin: '0.6rem 0 0.2rem', lineHeight: 1.35 }}>{p.name}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginBottom: '0.875rem' }}>{p.weight ?? p.brand}</p>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{p.price} kr</span>
              <AddToCartButton product={p as any} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
