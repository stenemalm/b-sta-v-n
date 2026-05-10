'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { categories } from '@/lib/products';

export default function Nav() {
  const { count } = useCart();
  return (
    <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', height: 64 }}>
        <Link href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: 'var(--accent)', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Bästa Vän
        </Link>
        <nav style={{ display: 'flex', gap: '1.25rem', flex: 1, overflowX: 'auto' }}>
          {categories.map(c => (
            <Link key={c.slug} href={`/produkter?kategori=${c.slug}`} style={{ color: 'var(--muted)', fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {c.name}
            </Link>
          ))}
        </nav>
        <Link href="/varukorg" style={{ position: 'relative', color: 'var(--text)', textDecoration: 'none', fontSize: '0.875rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          Varukorg
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
