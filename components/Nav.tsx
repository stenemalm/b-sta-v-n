'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';

const KATT_MENU = [
  { slug: 'torrfoder',  name: 'Torrfoder' },
  { slug: 'vatfoder',   name: 'Våtfoder' },
  { slug: 'snacks',     name: 'Snacks' },
  { slug: 'leksaker',   name: 'Leksaker' },
  { slug: 'mobler',     name: 'Kattträd & Möbler' },
  { slug: 'baddar',     name: 'Bäddar & Korgar' },
  { slug: 'skalar',     name: 'Skålar & Fontäner' },
  { slug: 'sand',       name: 'Toalett & Sand' },
];

const HUND_MENU = [
  { slug: 'hund-torrfoder', name: 'Torrfoder' },
  { slug: 'hund-vatfoder',  name: 'Våtfoder' },
  { slug: 'hund-snacks',    name: 'Snacks' },
  { slug: 'hund-leksaker',  name: 'Leksaker' },
  { slug: 'hund-baddar',    name: 'Bäddar & Korgar' },
  { slug: 'hund-skalar',    name: 'Skålar & Vattentråg' },
];

export default function Nav() {
  const { count } = useCart();
  const [open, setOpen] = useState<'katt' | 'hund' | null>(null);

  return (
    <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 200 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', height: 64 }}>
        {/* Logo */}
        <Link href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', color: 'var(--accent)', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>
          Zooplats
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: '0.25rem', flex: 1, alignItems: 'center' }}>
          {/* Katt */}
          <div style={{ position: 'relative' }}
            onMouseEnter={() => setOpen('katt')}
            onMouseLeave={() => setOpen(null)}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0.875rem', fontSize: '0.875rem', fontWeight: 500, color: open === 'katt' ? 'var(--accent)' : 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.3rem', borderRadius: 4 }}>
              Katt <span style={{ fontSize: '0.65rem' }}>▾</span>
            </button>
            {open === 'katt' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', minWidth: 220, zIndex: 300 }}>
                {KATT_MENU.map(c => (
                  <Link key={c.slug} href={`/produkter?kategori=${c.slug}`}
                    style={{ display: 'block', padding: '0.5rem 0.75rem', color: 'var(--text)', textDecoration: 'none', fontSize: '0.875rem', borderRadius: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    onClick={() => setOpen(null)}>
                    {c.name}
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                  <Link href="/produkter?djur=katt" style={{ display: 'block', padding: '0.5rem 0.75rem', color: 'var(--accent)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, borderRadius: 4 }}
                    onClick={() => setOpen(null)}>
                    Se allt för katt →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Hund */}
          <div style={{ position: 'relative' }}
            onMouseEnter={() => setOpen('hund')}
            onMouseLeave={() => setOpen(null)}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0.875rem', fontSize: '0.875rem', fontWeight: 500, color: open === 'hund' ? 'var(--accent)' : 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.3rem', borderRadius: 4 }}>
              Hund <span style={{ fontSize: '0.65rem' }}>▾</span>
            </button>
            {open === 'hund' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', minWidth: 220, zIndex: 300 }}>
                {HUND_MENU.map(c => (
                  <Link key={c.slug} href={`/produkter?kategori=${c.slug}`}
                    style={{ display: 'block', padding: '0.5rem 0.75rem', color: 'var(--text)', textDecoration: 'none', fontSize: '0.875rem', borderRadius: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    onClick={() => setOpen(null)}>
                    {c.name}
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                  <Link href="/produkter?djur=hund" style={{ display: 'block', padding: '0.5rem 0.75rem', color: 'var(--accent)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, borderRadius: 4 }}
                    onClick={() => setOpen(null)}>
                    Se allt för hund →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/produkter" style={{ padding: '0.5rem 0.875rem', color: 'var(--muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
            Alla produkter
          </Link>
        </nav>

        {/* Varukorg */}
        <Link href="/varukorg" style={{ position: 'relative', color: 'var(--text)', textDecoration: 'none', fontSize: '0.875rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {count > 0 && (
            <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 999, padding: '1px 7px', fontSize: '0.75rem', fontWeight: 600 }}>
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
