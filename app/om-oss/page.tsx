export const metadata = {
  title: 'Om oss — Zooplats',
  description: 'Zooplats importerar europeisk premiumprodukter för katt direkt från Tyskland.',
};

export default function OmOss() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Om Zooplats</h1>

      <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem', color: 'var(--muted)' }}>
        Zooplats är en svensk importör av europeiska kattmärken — med fokus på kvalitet, ärlighet och rimliga priser.
      </p>

      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Hur vi jobbar</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
          Vi samarbetar med <strong style={{ color: 'var(--text)' }}>ZooDrop</strong>, en etablerad tysk grossist, för att kunna erbjuda ett brett sortiment av välkända europeiska märken. Produkterna skickas direkt från lagret i Tyskland till din dörr — det håller priserna nere och logistiken enkel.
        </p>
        <p style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          Vi har noggrant valt ut märken som vi själva litar på — Animonda, Bozita, GranataPet, Landfleisch, Royal Canin med flera. Alla produkter uppfyller EU:s krav på djurfoder och märkning.
        </p>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Varför vi</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '🇩🇪', title: 'Direkt från Europa', text: 'Europeiska märken med hög kvalitetsstandard, levererade direkt från Tyskland.' },
            { icon: '💰', title: 'Konkurrenskraftiga priser', text: 'Ingen mellanhånd — vi köper direkt från grossist och för besparingen vidare.' },
            { icon: '✅', title: 'EU-certifierade produkter', text: 'Allt djurfoder vi säljer uppfyller EU-reglering för sammansättning och märkning.' },
            { icon: '📦', title: 'Fri frakt över 599 kr', text: 'Snabb leverans med spårning, direkt till din dörr.' },
          ].map(item => (
            <div key={item.title} style={{ background: 'var(--cream)', borderRadius: 8, padding: '1.25rem', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
              <p style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.4rem' }}>{item.title}</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '1.5rem', background: 'var(--cream)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Kontakta oss</p>
        <a href="mailto:info@zooplats.se" style={{ color: 'var(--accent)', fontWeight: 500 }}>info@zooplats.se</a>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Vi svarar inom 2 arbetsdagar</p>
      </div>
    </div>
  );
}
