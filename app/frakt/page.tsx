export const metadata = {
  title: 'Frakt & Retur — Zooplats',
  description: 'Information om frakt, leverans och retur hos Zooplats.',
};

export default function Frakt() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Frakt & Retur</h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '3rem' }}>Vi levererar till hela Sverige</p>

      {/* Frakt */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Frakt & Leverans</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { icon: '📦', title: 'Fraktkostnad', text: '79 kr · Fri frakt över 599 kr' },
            { icon: '🇩🇪', title: 'Skickas från', text: 'Tyskland' },
            { icon: '🚚', title: 'Leveranstid', text: '3–7 arbetsdagar' },
            { icon: '📬', title: 'Spårning', text: 'Spårningsnummer skickas via e-post' },
          ].map(item => (
            <div key={item.title} style={{ background: 'var(--cream)', borderRadius: 8, padding: '1.25rem', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
              <p style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{item.title}</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{item.text}</p>
            </div>
          ))}
        </div>
        <p style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          Produkterna levereras direkt från vår leverantörs lager i Tyskland. Leveranstiden är 3–7 arbetsdagar och räknas från det att betalningen bekräftats. Du får ett orderbekräftelsemail och ett separat mail med spårningsnummer när paketet är på väg.
        </p>
      </div>

      {/* Retur & ångerrätt */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Retur & Ångerrätt</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
          Du har <strong style={{ color: 'var(--text)' }}>14 dagars ångerrätt</strong> från det att du mottagit din beställning, i enlighet med distansavtalslagen.
        </p>
        <div style={{ padding: '1rem 1.25rem', background: 'var(--cream)', borderRadius: 6, marginBottom: '1rem', borderLeft: '3px solid var(--accent)' }}>
          <p style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Så här returnerar du</p>
          <ol style={{ color: 'var(--muted)', paddingLeft: '1.25rem', lineHeight: 1.8, fontSize: '0.9rem' }}>
            <li>Kontakta oss på <a href="mailto:info@zooplats.se" style={{ color: 'var(--accent)' }}>info@zooplats.se</a> med ditt ordernummer</li>
            <li>Vi skickar returadress och instruktioner</li>
            <li>Paketera varan i originalförpackning</li>
            <li>Skicka paketet — returfrakten bekostas av dig</li>
            <li>Återbetalning sker inom 14 dagar efter mottagen retur</li>
          </ol>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.8, padding: '0.75rem 1rem', background: '#fff5f5', borderRadius: 6, border: '1px solid #ffd5d5' }}>
          <strong style={{ color: '#c0392b' }}>Obs:</strong> Ångerrätten gäller inte för livsmedel och djurfoder med bruten förseglad förpackning av hygienskäl.
        </p>
      </div>

      {/* Reklamation */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Reklamation</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          Du har <strong style={{ color: 'var(--text)' }}>3 års reklamationsrätt</strong> enligt konsumentköplagen. Om varan är skadad eller felaktig när du tar emot den — kontakta oss direkt på <a href="mailto:info@zooplats.se" style={{ color: 'var(--accent)' }}>info@zooplats.se</a> med foton och beskrivning. Vi löser det snabbt.
        </p>
      </div>

      {/* Kontakt */}
      <div style={{ padding: '1.5rem', background: 'var(--cream)', borderRadius: 8, border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Frågor om din beställning?</p>
        <a href="mailto:info@zooplats.se" style={{ color: 'var(--accent)', fontWeight: 500 }}>info@zooplats.se</a>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Vi svarar inom 2 arbetsdagar</p>
      </div>
    </div>
  );
}
