import Link from 'next/link';
import Image from 'next/image';
import { products } from '@/lib/products';
import FeaturedProducts from '@/components/FeaturedProducts';

const TRUST = [
  { icon: '📦', title: 'Fri frakt', text: 'Över 599 kr' },
  { icon: '🏠', title: 'Hemleverans', text: '3–7 arbetsdagar' },
  { icon: '🇪🇺', title: 'EU-kvalitet', text: 'Certifierade märken' },
  { icon: '✅', title: 'Nöjd-garanti', text: 'Pengarna tillbaka' },
];

export default function Home() {
  const featured = products.filter(p => p.badge).slice(0, 4);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 'clamp(420px, 55vw, 640px)', overflow: 'hidden' }}>
        <Image
          src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1600&q=80"
          alt="Katt och hund"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 60%' }}
          priority
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(20,15,10,0.72) 0%, rgba(20,15,10,0.3) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 clamp(1.5rem, 5vw, 5rem)' }}>
          <div style={{ maxWidth: 560 }}>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500, fontSize: '0.8rem', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Importerat direkt från Europa
            </p>
            <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', marginBottom: '1.25rem', lineHeight: 1.15 }}>
              Det bästa för din<br />katt & hund
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 420 }}>
              Premium europeiska märken — Carnilove, Acana, Trixie och mer. Hemleverans direkt till din dörr.
            </p>
            <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
              <Link href="/produkter?djur=katt"
                style={{ background: 'var(--accent)', color: '#fff', padding: '0.875rem 1.75rem', borderRadius: 4, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                För katten
              </Link>
              <Link href="/produkter?djur=hund"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', color: '#fff', padding: '0.875rem 1.75rem', borderRadius: 4, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.35)' }}>
                För hunden
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────────── */}
      <section style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border)', padding: '1.25rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 4vw, 4rem)', flexWrap: 'wrap' }}>
          {TRUST.map(t => (
            <div key={t.title} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{t.icon}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.8rem' }}>{t.title}</p>
                <p style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Katt & Hund banners ───────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '3.5rem auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Katt-banner */}
        <Link href="/produkter?djur=katt" style={{ textDecoration: 'none', position: 'relative', borderRadius: 12, overflow: 'hidden', display: 'block', height: 320 }}>
          <Image
            src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80"
            alt="Katt"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,15,10,0.75) 0%, transparent 55%)' }} />
          <div style={{ position: 'absolute', bottom: '1.75rem', left: '1.75rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Sortiment</p>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '0.875rem' }}>För katten</h2>
            <span style={{ background: '#fff', color: 'var(--text)', padding: '0.5rem 1.25rem', borderRadius: 4, fontSize: '0.85rem', fontWeight: 600 }}>
              Handla nu →
            </span>
          </div>
        </Link>

        {/* Hund-banner */}
        <Link href="/produkter?djur=hund" style={{ textDecoration: 'none', position: 'relative', borderRadius: 12, overflow: 'hidden', display: 'block', height: 320 }}>
          <Image
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80"
            alt="Hund"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,15,10,0.75) 0%, transparent 55%)' }} />
          <div style={{ position: 'absolute', bottom: '1.75rem', left: '1.75rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Sortiment</p>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '0.875rem' }}>För hunden</h2>
            <span style={{ background: '#fff', color: 'var(--text)', padding: '0.5rem 1.25rem', borderRadius: 4, fontSize: '0.85rem', fontWeight: 600 }}>
              Handla nu →
            </span>
          </div>
        </Link>
      </section>

      {/* ── Bästsäljare ──────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.625rem' }}>Bästsäljare & Favoriter</h2>
          <Link href="/produkter" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
            Se alla →
          </Link>
        </div>
        <FeaturedProducts products={featured} />
      </section>

      {/* ── Varumärken strip ──────────────────────────────────────────── */}
      <section style={{ background: 'var(--cream)', borderTop: '1px solid var(--border)', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Våra märken</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 4vw, 4rem)', flexWrap: 'wrap', alignItems: 'center' }}>
            {['Carnilove', 'Acana', 'Calibra', 'Trixie', "Cat's Best"].map(brand => (
              <span key={brand} style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', color: 'var(--text)', opacity: 0.7, fontWeight: 500 }}>
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
