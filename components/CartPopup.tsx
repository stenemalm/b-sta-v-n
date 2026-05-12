'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart';
import { products } from '@/lib/products';

export default function CartPopup() {
  const { lastAdded, clearLastAdded, count, total } = useCart();

  useEffect(() => {
    if (!lastAdded) return;
    const t = setTimeout(() => clearLastAdded(), 6000);
    return () => clearTimeout(t);
  }, [lastAdded]);

  if (!lastAdded) return null;

  const FREE_SHIPPING_MIN = 599;
  const toFreeShipping = Math.max(0, FREE_SHIPPING_MIN - total);
  const recommended = products.filter(p => p.id !== lastAdded.id && p.category === lastAdded.category).slice(0, 3);

  return (
    <>
      <div
        onClick={clearLastAdded}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 900 }}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: '#fff', borderRadius: 12, width: '90%', maxWidth: 520,
        zIndex: 901, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ background: 'var(--cream)', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>✓ Tillagd i varukorgen</p>
          <button onClick={clearLastAdded} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--muted)', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '1.25rem' }}>
          {/* Produkt */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ width: 72, height: 72, background: 'var(--cream)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
              {lastAdded.image ? (
                <Image src={lastAdded.image} alt={lastAdded.name} fill style={{ objectFit: 'contain', padding: 4 }} unoptimized />
              ) : (
                <span style={{ fontSize: '2rem' }}>{lastAdded.placeholder}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{lastAdded.name}</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{lastAdded.weight ?? lastAdded.brand}</p>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent)' }}>{lastAdded.price} kr</p>
            </div>
          </div>

          {/* Fri frakt-bar */}
          {toFreeShipping > 0 && (
            <div style={{ background: 'var(--cream)', borderRadius: 6, padding: '0.6rem 0.875rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
              Lägg till <strong style={{ color: 'var(--text)' }}>{toFreeShipping} kr</strong> till för <strong style={{ color: 'var(--text)' }}>fri frakt</strong>
              <div style={{ marginTop: '0.4rem', height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (total / FREE_SHIPPING_MIN) * 100)}%`, background: 'var(--accent)', borderRadius: 99, transition: 'width 0.3s' }} />
              </div>
            </div>
          )}
          {toFreeShipping === 0 && (
            <div style={{ background: '#dcfce7', color: '#166534', borderRadius: 6, padding: '0.6rem 0.875rem', marginBottom: '1rem', fontSize: '0.82rem', fontWeight: 500 }}>
              ✓ Du har fri frakt!
            </div>
          )}

          {/* Knappar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: recommended.length ? '1.25rem' : 0 }}>
            <button onClick={clearLastAdded}
              style={{ flex: 1, border: '1px solid var(--border)', background: 'none', padding: '0.75rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>
              Fortsätt handla
            </button>
            <Link href="/kassa" onClick={clearLastAdded}
              style={{ flex: 1, background: 'var(--accent)', color: '#fff', padding: '0.75rem', borderRadius: 6, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', display: 'block' }}>
              Till kassan ({count} st)
            </Link>
          </div>

          {/* Rekommenderade */}
          {recommended.length > 0 && (
            <>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.75rem', fontWeight: 500 }}>Andra köper också:</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {recommended.map(p => (
                  <Link key={p.id} href={`/produkt/${p.slug}`} onClick={clearLastAdded}
                    style={{ flex: 1, textDecoration: 'none', color: 'inherit', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                    <div style={{ height: 70, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                      {p.placeholder}
                    </div>
                    <div style={{ padding: '0.5rem 0.625rem' }}>
                      <p style={{ fontSize: '0.72rem', fontWeight: 500, marginBottom: '0.15rem', lineHeight: 1.3 }}>{p.name.slice(0, 30)}</p>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>{p.price} kr</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
