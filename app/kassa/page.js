'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';

const CODES = {
  MAMMAS:  { label: 'Mammarabatt', discountPct: 0.275, freeShipping: true },
  FRI2026: { label: 'Vänrabatt',   discountPct: 0.24,  freeShipping: true },
};

const SHIPPING_NORMAL   = 79;
const FREE_SHIPPING_MIN = 599;

export default function Kassa() {
  const { items, total } = useCart();
  const [codeInput, setCodeInput]   = useState('');
  const [appliedCode, setAppliedCode] = useState(null);
  const [codeError, setCodeError]   = useState('');

  const code = appliedCode ? CODES[appliedCode] : null;

  const discountAmount = code ? Math.round(total * code.discountPct) : 0;
  const discountedSubtotal = total - discountAmount;

  const freeShipping = code?.freeShipping || discountedSubtotal >= FREE_SHIPPING_MIN;
  const shipping = freeShipping ? 0 : SHIPPING_NORMAL;
  const orderTotal = discountedSubtotal + shipping;

  function applyCode() {
    const upper = codeInput.trim().toUpperCase();
    if (CODES[upper]) {
      setAppliedCode(upper);
      setCodeError('');
    } else {
      setCodeError('Ogiltig rabattkod');
    }
  }

  function removeCode() {
    setAppliedCode(null);
    setCodeInput('');
    setCodeError('');
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '6rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</p>
        <h1 style={{ marginBottom: '0.75rem' }}>Varukorgen är tom</h1>
        <Link href="/produkter" style={{ background: 'var(--accent)', color: '#fff', padding: '0.875rem 2rem', borderRadius: 4, textDecoration: 'none', fontWeight: 500 }}>
          Handla nu
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Kassa</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '3rem', alignItems: 'start' }}>

        {/* Left: order summary */}
        <div>
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 8, background: '#fff' }}>
                <div style={{ fontSize: '2rem', width: 48, textAlign: 'center', flexShrink: 0 }}>{item.placeholder}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                  {item.weight && <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{item.weight}</p>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{item.qty} st</p>
                  <p style={{ fontWeight: 600 }}>
                    {code
                      ? <><span style={{ textDecoration: 'line-through', color: 'var(--muted)', fontWeight: 400, marginRight: 6, fontSize: '0.85rem' }}>{item.price * item.qty} kr</span>{Math.round(item.price * item.qty * (1 - code.discountPct))} kr</>
                      : <>{item.price * item.qty} kr</>
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Discount code */}
          <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 8, background: '#fff' }}>
            <p style={{ fontWeight: 500, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Rabattkod</p>
            {appliedCode ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ background: '#dcfce7', color: '#166534', padding: '0.375rem 0.875rem', borderRadius: 99, fontSize: '0.85rem', fontWeight: 500 }}>
                  ✓ {appliedCode} — {code.label} ({Math.round(code.discountPct * 100)}% rabatt + fri frakt)
                </span>
                <button onClick={removeCode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.8rem', textDecoration: 'underline', padding: 0 }}>
                  Ta bort
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  value={codeInput}
                  onChange={e => { setCodeInput(e.target.value); setCodeError(''); }}
                  onKeyDown={e => e.key === 'Enter' && applyCode()}
                  placeholder="Ange kod"
                  style={{ flex: 1, padding: '0.625rem 0.875rem', border: `1px solid ${codeError ? '#dc2626' : 'var(--border)'}`, borderRadius: 4, fontSize: '0.9rem', outline: 'none' }}
                />
                <button onClick={applyCode} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.625rem 1.25rem', borderRadius: 4, cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' }}>
                  Aktivera
                </button>
              </div>
            )}
            {codeError && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.4rem' }}>{codeError}</p>}
          </div>
        </div>

        {/* Right: price breakdown */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '1.5rem', background: 'var(--cream)', position: 'sticky', top: 80 }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '1.25rem' }}>Att betala</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Delsumma</span>
              <span>{total} kr</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534' }}>
                <span>Rabatt ({CODES[appliedCode].label})</span>
                <span>−{discountAmount} kr</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Frakt</span>
              <span style={{ color: freeShipping ? '#166534' : 'inherit' }}>
                {freeShipping ? 'Gratis ✓' : `${SHIPPING_NORMAL} kr`}
              </span>
            </div>

            {!freeShipping && discountedSubtotal < FREE_SHIPPING_MIN && (
              <p style={{ color: 'var(--muted)', fontSize: '0.78rem', background: '#fff', padding: '0.5rem 0.75rem', borderRadius: 4, border: '1px solid var(--border)' }}>
                Lägg till {FREE_SHIPPING_MIN - discountedSubtotal} kr för fri frakt
              </p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            <span>Totalt</span>
            <span>{orderTotal} kr</span>
          </div>

          <button style={{ width: '100%', background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>
            Betala nu →
          </button>

          <p style={{ color: 'var(--muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.75rem' }}>
            🔒 Säker betalning med kort eller Swish
          </p>

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--muted)' }}>
            <p>📦 Leverans 1–3 arbetsdagar</p>
            <p style={{ marginTop: '0.25rem' }}>✅ Nöjd-katt-garanti — pengarna tillbaka</p>
          </div>
        </div>
      </div>
    </div>
  );
}
