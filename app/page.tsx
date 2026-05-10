import Link from 'next/link';
import { products, categories } from '@/lib/products';
import AddToCartButton from '@/components/AddToCartButton';

export default function Home() {
  const featured = products.filter(p => p.badge).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--cream)', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--accent)', fontWeight: 500, fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Rekommenderat av svenska uppfödare
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', maxWidth: 680, margin: '0 auto 1.25rem' }}>
          Det bästa för din katt, utan kompromisser
        </h1>
        <p style={{ color: 'var(--muted)', maxWidth: 500, margin: '0 auto 2.5rem', lineHeight: 1.7, fontSize: '1rem' }}>
          Handplockat premium — kattmat, kattlåda och tillbehör. Fri frakt över 599 kr.
        </p>
        <Link href="/produkter" style={{ background: 'var(--accent)', color: '#fff', padding: '0.875rem 2.25rem', borderRadius: 4, textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>
          Utforska sortimentet
        </Link>
      </section>

      {/* Categories */}
      <section style={{ maxWidth: 1200, margin: '4rem auto', padding: '0 1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.75rem', textAlign: 'center' }}>Vad letar du efter?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {categories.map(c => (
            <Link key={c.slug} href={`/produkter?kategori=${c.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'var(--cream)', borderRadius: 8, padding: '1.75rem 1rem', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.625rem' }}>{c.icon}</div>
                <p style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text)' }}>{c.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section style={{ maxWidth: 1200, margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.75rem' }}>Bästsäljare & Favoriter</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {featured.map(p => (
            <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
              <Link href={`/produkt/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ height: 200, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>
                  {p.placeholder}
                </div>
              </Link>
              <div style={{ padding: '1.25rem' }}>
                {p.badge && (
                  <span style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99, letterSpacing: '0.04em' }}>
                    {p.badge}
                  </span>
                )}
                <Link href={`/produkt/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '1rem', margin: '0.75rem 0 0.25rem' }}>{p.name}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>{p.weight ?? p.brand}</p>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{p.price} kr</span>
                    {p.originalPrice && (
                      <span style={{ color: 'var(--muted)', fontSize: '0.85rem', textDecoration: 'line-through', marginLeft: '0.5rem' }}>{p.originalPrice} kr</span>
                    )}
                  </div>
                  <AddToCartButton product={p} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/produkter" style={{ border: '1px solid var(--accent)', color: 'var(--accent)', padding: '0.75rem 1.75rem', borderRadius: 4, textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
            Se alla produkter →
          </Link>
        </div>
      </section>

      {/* Trust strip */}
      <section style={{ background: 'var(--cream)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          {[
            { icon: '📦', title: 'Fri frakt', text: 'Över 599 kr' },
            { icon: '🐱', title: 'Uppfödarpriser', text: 'Specialpack för uppfödare' },
            { icon: '✅', title: 'Nöjd-katt-garanti', text: 'Pengarna tillbaka' },
            { icon: '🇩🇪', title: 'Skickas från Tyskland', text: '3–7 arbetsdagar' },
          ].map(item => (
            <div key={item.title}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{item.icon}</div>
              <p style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{item.title}</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
