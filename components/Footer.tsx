import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '3rem 1.5rem 2rem', background: 'var(--cream)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>

        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '0.75rem' }}>Zooplats</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Svensk importör av europeiska kattmärken. Vi hämtar det bästa direkt från Europa — till dig och din katt.
          </p>
        </div>

        <div>
          <p style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Kategorier</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { href: '/produkter?kategori=torrfoder', label: 'Torrfoder' },
              { href: '/produkter?kategori=vatfoder', label: 'Våtfoder' },
              { href: '/produkter?kategori=snacks', label: 'Kattsnacks' },
              { href: '/produkter?kategori=leksaker', label: 'Kattleksaker' },
              { href: '/produkter?kategori=mobler', label: 'Kattträd & Möbler' },
              { href: '/produkter?kategori=baddar', label: 'Bäddar & Korgar' },
              { href: '/produkter?kategori=sand', label: 'Toalett & Sand' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ color: 'var(--muted)', fontSize: '0.875rem', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Kundservice</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a href="mailto:info@zooplats.se" style={{ color: 'var(--muted)', fontSize: '0.875rem', textDecoration: 'none' }}>info@zooplats.se</a>
            <Link href="/frakt" style={{ color: 'var(--muted)', fontSize: '0.875rem', textDecoration: 'none' }}>Frakt & Retur</Link>
            <Link href="/om-oss" style={{ color: 'var(--muted)', fontSize: '0.875rem', textDecoration: 'none' }}>Om oss</Link>
          </div>
        </div>

        <div>
          <p style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Juridiskt</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/kopvillkor" style={{ color: 'var(--muted)', fontSize: '0.875rem', textDecoration: 'none' }}>Köpvillkor & Ångerrätt</Link>
            <Link href="/integritetspolicy" style={{ color: 'var(--muted)', fontSize: '0.875rem', textDecoration: 'none' }}>Integritetspolicy</Link>
            <Link href="/frakt" style={{ color: 'var(--muted)', fontSize: '0.875rem', textDecoration: 'none' }}>Reklamation</Link>
          </div>
        </div>

      </div>

      <div style={{ maxWidth: 1200, margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>© 2026 Zooplats · Enskild firma · <a href="mailto:info@zooplats.se" style={{ color: 'var(--muted)', textDecoration: 'none' }}>info@zooplats.se</a></p>
        <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>🇩🇪 Skickas från Tyskland · Fri frakt över 599 kr · 3–7 dagars leverans</p>
      </div>
    </footer>
  );
}
