import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '3rem 1.5rem 2rem', background: 'var(--cream)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '0.75rem' }}>Bästa Vän</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Premium för din katt. Handplockat och rekommenderat av svenska uppfödare.
          </p>
        </div>
        <div>
          <p style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Kategorier</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { href: '/produkter?kategori=mat', label: 'Mat & Godis' },
              { href: '/produkter?kategori=sand', label: 'Kattlåda & Sand' },
              { href: '/produkter?kategori=mobler', label: 'Möbler & Klösträd' },
              { href: '/produkter?kategori=tillbehor', label: 'Tillbehör' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ color: 'var(--muted)', fontSize: '0.875rem', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Kundservice</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a href="mailto:hej@bastavan.eu" style={{ color: 'var(--muted)', fontSize: '0.875rem', textDecoration: 'none' }}>hej@bastavan.eu</a>
            <Link href="/frakt" style={{ color: 'var(--muted)', fontSize: '0.875rem', textDecoration: 'none' }}>Frakt & Retur</Link>
            <Link href="/om-oss" style={{ color: 'var(--muted)', fontSize: '0.875rem', textDecoration: 'none' }}>Om oss</Link>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>© 2025 Bästa Vän. Enskild firma.</p>
        <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>🇸🇪 Fri frakt över 599 kr · 1–3 dagars leverans</p>
      </div>
    </footer>
  );
}
