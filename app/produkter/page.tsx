import Link from 'next/link';
import Image from 'next/image';
import { products, categories } from '@/lib/products';
import AddToCartButton from '@/components/AddToCartButton';

export default async function Produkter({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const filtered = kategori ? products.filter(p => p.category === kategori) : products;
  const activeCategory = categories.find(c => c.slug === kategori);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
        {activeCategory ? `${activeCategory.icon} ${activeCategory.name}` : 'Alla produkter'}
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>{filtered.length} produkter</p>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <Link href="/produkter" style={{
          padding: '0.375rem 1rem', borderRadius: 99, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
          background: !kategori ? 'var(--accent)' : 'var(--cream)',
          color: !kategori ? '#fff' : 'var(--muted)',
          border: '1px solid var(--border)',
        }}>
          Alla
        </Link>
        {categories.map(c => (
          <Link key={c.slug} href={`/produkter?kategori=${c.slug}`} style={{
            padding: '0.375rem 1rem', borderRadius: 99, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
            background: kategori === c.slug ? 'var(--accent)' : 'var(--cream)',
            color: kategori === c.slug ? '#fff' : 'var(--muted)',
            border: '1px solid var(--border)',
          }}>
            {c.icon} {c.name}
          </Link>
        ))}
      </div>

      {/* Product grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
        {filtered.map(p => (
          <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
            <Link href={`/produkt/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ height: 200, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                {p.image ? (
                  <Image src={p.image} alt={p.name} fill style={{ objectFit: 'contain', padding: '1rem' }} sizes="300px" />
                ) : (
                  <span style={{ fontSize: '5rem' }}>{p.placeholder}</span>
                )}
              </div>
            </Link>
            <div style={{ padding: '1.25rem' }}>
              {p.badge && (
                <span style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99 }}>
                  {p.badge}
                </span>
              )}
              <Link href={`/produkt/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '1rem', margin: '0.75rem 0 0.25rem' }}>{p.name}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{p.brand}</p>
                <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {p.description.slice(0, 85)}…
                </p>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{p.price} kr</span>
                </div>
                <AddToCartButton product={p} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
