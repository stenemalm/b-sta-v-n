'use client';
import { useState } from 'react';

type Tab = 'beskrivning' | 'ingredienser';

// Extract a labeled section from ZooDrop's German HTML description
function extractSection(html: string, patterns: string[]): string {
  let stripped = html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim();
  for (const pat of patterns) {
    const idx = stripped.search(new RegExp(pat, 'i'));
    if (idx === -1) continue;
    const start = stripped.indexOf(':', idx) + 1;
    // Find next section
    const nextSection = stripped.search(
      new RegExp('(Analytische Bestandteile|Zusammensetzung|Zutaten|Zusatzstoffe|Fütterungsempfehlung|Inhaltsstoffe)', 'i')
    );
    const nextOther = stripped.search(new RegExp(pat.replace(/\|.*$/, '') + '.{0,5}:', 'gi'));
    // Find end: either next German section header or end of string
    const possibleEnds = [
      stripped.indexOf('Analytische Bestandteile', start),
      stripped.indexOf('Zusammensetzung:', start),
      stripped.indexOf('Zusatzstoffe:', start),
      stripped.indexOf('Fütterungsempfehlung:', start),
    ].filter(x => x > start);
    const end = possibleEnds.length ? Math.min(...possibleEnds) : stripped.length;
    return stripped.slice(start, end).trim();
  }
  return '';
}

function parseSections(rawHtml: string) {
  if (!rawHtml) return null;

  const ingredienser = extractSection(rawHtml, ['Zusammensetzung', 'Zutaten', 'Inhaltsstoffe']);
  const analys       = extractSection(rawHtml, ['Analytische Bestandteile']);
  const tillsatser   = extractSection(rawHtml, ['Zusatzstoffe']);
  const fodring      = extractSection(rawHtml, ['Fütterungsempfehlung', 'Dosierung']);

  if (!ingredienser && !analys) return null;
  return { ingredienser, analys, tillsatser, fodring };
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '0.625rem 1.25rem',
  border: 'none', borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
  background: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: active ? 600 : 400,
  color: active ? 'var(--accent)' : 'var(--muted)', transition: 'all 0.15s',
});

export default function ProductTabs({ description, rawDescription }: {
  description: string;
  rawDescription?: string;
}) {
  const [active, setActive] = useState<Tab>('beskrivning');
  const sections = parseSections(rawDescription || '');
  const hasIngredients = !!sections;

  return (
    <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)' }}>
        <button style={tabStyle(active === 'beskrivning')} onClick={() => setActive('beskrivning')}>
          Beskrivning
        </button>
        <button
          style={tabStyle(active === 'ingredienser')}
          onClick={() => setActive('ingredienser')}
          disabled={!hasIngredients}
        >
          Ingredienser & Analys
        </button>
      </div>

      {/* Tab content */}
      <div style={{ padding: '2rem 0', maxWidth: 760 }}>
        {active === 'beskrivning' && (
          <p style={{ lineHeight: 1.85, color: 'var(--text)', fontSize: '0.95rem' }}>
            {description}
          </p>
        )}

        {active === 'ingredienser' && sections && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.9rem', lineHeight: 1.8 }}>
            {sections.ingredienser && (
              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>Ingredienser</p>
                <p style={{ color: 'var(--muted)' }}>{sections.ingredienser}</p>
              </div>
            )}
            {sections.analys && (
              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>Näringsvärden (analys)</p>
                <p style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: '0.85rem' }}>{sections.analys}</p>
              </div>
            )}
            {sections.tillsatser && (
              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>Tillsatser</p>
                <p style={{ color: 'var(--muted)' }}>{sections.tillsatser}</p>
              </div>
            )}
            {sections.fodring && (
              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>Foderrekommendation</p>
                <p style={{ color: 'var(--muted)' }}>{sections.fodring}</p>
              </div>
            )}
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'italic', marginTop: '0.5rem' }}>
              Kontrollera alltid produktförpackningens märkning för aktuell information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
