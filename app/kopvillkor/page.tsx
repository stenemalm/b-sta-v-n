export const metadata = {
  title: 'Köpvillkor — Zooplats',
  description: 'Köpvillkor, ångerrätt och reklamation för Zooplats.',
};

const section = (title: string, children: React.ReactNode) => (
  <div style={{ marginBottom: '2.5rem' }}>
    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>{title}</h2>
    {children}
  </div>
);

export default function Kopvillkor() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Köpvillkor</h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '3rem' }}>Senast uppdaterad: maj 2026</p>

      {section('1. Företagsinformation', (
        <div style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          <p><strong style={{ color: 'var(--text)' }}>Zooplats</strong></p>
          <p>Enskild firma</p>
          <p>E-post: <a href="mailto:info@zooplats.se" style={{ color: 'var(--accent)' }}>info@zooplats.se</a></p>
          <p>Org.nr registreras hos Skatteverket — anges på faktura</p>
        </div>
      ))}

      {section('2. Priser och betalning', (
        <div style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          <p>Alla priser anges i svenska kronor (SEK) inklusive moms (25 %). Priser kan ändras utan förvarning, men priset vid beställningstillfället gäller alltid.</p>
          <p style={{ marginTop: '0.75rem' }}>Betalning sker vid kassa. Vi accepterar kort via Stripe. Betalningen debiteras när beställningen bekräftas.</p>
        </div>
      ))}

      {section('3. Frakt och leverans', (
        <div style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          <p>Vi levererar till Sverige. Produkterna skickas från vårt lager i Tyskland med leveranstid <strong style={{ color: 'var(--text)' }}>3–7 arbetsdagar</strong> efter bekräftad betalning.</p>
          <p style={{ marginTop: '0.75rem' }}>Fraktkostnad: <strong style={{ color: 'var(--text)' }}>79 kr</strong>. Fri frakt vid köp över <strong style={{ color: 'var(--text)' }}>599 kr</strong>.</p>
          <p style={{ marginTop: '0.75rem' }}>Leveranstider är estimat och kan variera beroende på transportör och omständigheter utanför vår kontroll.</p>
        </div>
      ))}

      {section('4. Ångerrätt', (
        <div style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          <p>Som konsument har du rätt att ångra ditt köp inom <strong style={{ color: 'var(--text)' }}>14 kalenderdagar</strong> från det att du mottagit varan, i enlighet med lagen om distansavtal (2005:59).</p>
          <p style={{ marginTop: '0.75rem' }}>För att utöva ångerrätten kontaktar du oss på <a href="mailto:info@zooplats.se" style={{ color: 'var(--accent)' }}>info@zooplats.se</a> med ditt ordernummer. Returfrakten bekostas av dig som kund.</p>
          <p style={{ marginTop: '0.75rem' }}>Varan ska returneras i ursprungligt skick och förpackning. Återbetalning sker inom 14 dagar från det att vi mottagit returen, via samma betalmetod som användes vid köpet.</p>
          <p style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'var(--cream)', borderRadius: 6, fontSize: '0.875rem' }}>
            <strong style={{ color: 'var(--text)' }}>Undantag:</strong> Ångerrätten gäller inte för livsmedel och djurfoder som är bruten förseglad förpackning av hygienskäl.
          </p>
        </div>
      ))}

      {section('5. Reklamation', (
        <div style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          <p>Du har <strong style={{ color: 'var(--text)' }}>3 års reklamationsrätt</strong> enligt konsumentköplagen. Om en vara är felaktig eller skadad vid leveransen har du rätt till reparation, omleverans eller återbetalning.</p>
          <p style={{ marginTop: '0.75rem' }}>Kontakta oss på <a href="mailto:info@zooplats.se" style={{ color: 'var(--accent)' }}>info@zooplats.se</a> med foton och beskrivning av felet. Vi svarar inom 2 arbetsdagar.</p>
        </div>
      ))}

      {section('6. Ansvarsbegränsning', (
        <div style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          <p>Zooplats ansvarar inte för skador orsakade av felaktig användning av produkter. Produktinformation, ingredienser och analysvärden tillhandahålls av tillverkarna och kan uppdateras utan förvarning — kontrollera alltid produktförpackningens märkning.</p>
          <p style={{ marginTop: '0.75rem' }}>Vi förbehåller oss rätten att avboka beställningar vid lagerslut, tekniska fel eller uppenbart felaktiga priser.</p>
        </div>
      ))}

      {section('7. Tvistlösning', (
        <div style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          <p>Vid tvist vänder du dig i första hand till oss. Om vi inte kan lösa tvisten kan du vända dig till <a href="https://www.arn.se" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Allmänna reklamationsnämnden (ARN)</a>.</p>
          <p style={{ marginTop: '0.75rem' }}>EU:s plattform för onlinetvistlösning: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>ec.europa.eu/consumers/odr</a></p>
        </div>
      ))}
    </div>
  );
}
