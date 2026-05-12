'use client';
import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('zooplats_cookies');
    if (!consent) setVisible(true);
  }, []);

  function accept(type: 'all' | 'necessary') {
    localStorage.setItem('zooplats_cookies', type);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: '#fff', borderTop: '1px solid var(--border)',
      padding: '1.5rem', boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <p style={{ fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.95rem' }}>
            Vi vill ge dig den bästa möjliga upplevelsen!
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>
            Vi använder cookies för att webbplatsen ska fungera, analysera trafik och förbättra din upplevelse. Du väljer vilka du accepterar.{' '}
            <a href="/integritetspolicy" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Integritetspolicy</a>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
          <button
            onClick={() => accept('necessary')}
            style={{
              background: 'none', border: '1px solid var(--border)', padding: '0.6rem 1.25rem',
              borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--muted)', whiteSpace: 'nowrap',
            }}
          >
            Endast nödvändiga
          </button>
          <button
            onClick={() => accept('all')}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.6rem 1.5rem',
              borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap',
            }}
          >
            Acceptera alla cookies
          </button>
        </div>
      </div>
    </div>
  );
}
