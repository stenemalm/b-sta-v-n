export const metadata = {
  title: 'Integritetspolicy — Zooplats',
  description: 'Så hanterar Zooplats dina personuppgifter enligt GDPR.',
};

const section = (title: string, children: React.ReactNode) => (
  <div style={{ marginBottom: '2.5rem' }}>
    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>{title}</h2>
    {children}
  </div>
);

export default function Integritetspolicy() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Integritetspolicy</h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '3rem' }}>Senast uppdaterad: maj 2026</p>

      {section('Personuppgiftsansvarig', (
        <div style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          <p>Zooplats (enskild firma) är personuppgiftsansvarig för de uppgifter som du lämnar i samband med köp och kontakt.</p>
          <p>Kontakt: <a href="mailto:info@zooplats.se" style={{ color: 'var(--accent)' }}>info@zooplats.se</a></p>
        </div>
      ))}

      {section('Vilka uppgifter samlar vi in?', (
        <div style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          <p>Vid beställning samlar vi in:</p>
          <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Namn och e-postadress</li>
            <li>Leveransadress</li>
            <li>Telefonnummer</li>
            <li>Ordernummer och köphistorik</li>
            <li>Betalningsinformation (hanteras av Stripe — vi lagrar inte kortuppgifter)</li>
          </ul>
        </div>
      ))}

      {section('Varför behandlar vi dina uppgifter?', (
        <div style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong style={{ color: 'var(--text)' }}>Fullgörande av avtal:</strong> För att behandla och leverera din beställning.</li>
            <li><strong style={{ color: 'var(--text)' }}>Rättslig förpliktelse:</strong> Bokföringsskyldighet enligt bokföringslagen (7 år).</li>
            <li><strong style={{ color: 'var(--text)' }}>Berättigat intresse:</strong> Kundservice och hantering av reklamationer.</li>
          </ul>
        </div>
      ))}

      {section('Hur länge sparar vi uppgifterna?', (
        <div style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          <p>Orderuppgifter sparas i 7 år enligt bokföringslagen. Kontaktuppgifter utan aktiv kundrelation raderas efter 12 månader.</p>
        </div>
      ))}

      {section('Delas dina uppgifter?', (
        <div style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          <p>Dina uppgifter delas med:</p>
          <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong style={{ color: 'var(--text)' }}>ZooDrop GmbH (Tyskland)</strong> — leverantör, mottar leveransadress för att skicka din order.</li>
            <li><strong style={{ color: 'var(--text)' }}>Stripe Inc.</strong> — betalningslösning, hanterar kortbetalning.</li>
            <li><strong style={{ color: 'var(--text)' }}>Transportörer</strong> — för att genomföra leveransen.</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>Vi säljer aldrig dina uppgifter till tredje part.</p>
        </div>
      ))}

      {section('Dina rättigheter', (
        <div style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          <p>Enligt GDPR har du rätt att:</p>
          <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Begära tillgång till dina uppgifter (registerutdrag)</li>
            <li>Begära rättelse av felaktiga uppgifter</li>
            <li>Begära radering ("rätten att bli glömd")</li>
            <li>Invända mot behandling baserad på berättigat intresse</li>
            <li>Lämna klagomål till <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Integritetsskyddsmyndigheten (IMY)</a></li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>Kontakta oss på <a href="mailto:info@zooplats.se" style={{ color: 'var(--accent)' }}>info@zooplats.se</a> för att utöva dina rättigheter.</p>
        </div>
      ))}

      {section('Cookies', (
        <div style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
          <p>Vi använder tekniska cookies för att hantera varukorg och session. Vi använder inga spårningscookies eller annonskakor. Inga tredjepartscookies för marknadsföring används.</p>
        </div>
      ))}
    </div>
  );
}
