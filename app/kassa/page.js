'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';

const CODES = {
  MAMMAS:  { label: 'Mammarabatt', discountPct: 0.275, freeShipping: true },
  FRI2026: { label: 'Vanrabatt',   discountPct: 0.24,  freeShipping: true },
};

const SHIPPING_NORMAL   = 79;
const FREE_SHIPPING_MIN = 599;

const inputStyle = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  border: '1px solid var(--border)',
  borderRadius: 4,
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
};

export default function Kassa() {
  const { items, total, clear } = useCart();

  const [codeInput, setCodeInput]     = useState('');
  const [appliedCode, setAppliedCode] = useState(null);
  const [codeError, setCodeError]     = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', postalCode: '', city: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const code = appliedCode ? CODES[appliedCode] : null;
  const discountAmount      = code ? Math.round(total * code.discountPct) : 0;
  const discountedSubtotal  = total - discountAmount;
  const freeShipping        = code?.freeShipping || discountedSubtotal >= FREE_SHIPPING_MIN;
  const shipping            = freeShipping ? 0 : SHIPPING_NORMAL;
  const orderTotal          = discountedSubtotal + shipping;

  function applyCode() {
    const upper = codeInput.trim().toUpperCase();
    if (CODES[upper]) { setAppliedCode(upper); setCodeError(''); }
    else setCodeError('Ogiltig rabattkod');
  }

  function removeCode() {
    setAppliedCode(null); setCodeInput(''); setCodeError('');
  }

  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setFormErrors(e => ({ ...e, [field]: '' }));
  }

  function validate() {
    const errors = {};
    if (!form.name.trim())       errors.name       = 'Obligatoriskt';
    if (!form.email.trim())      errors.email      = 'Obligatoriskt';
    if (!form.phone.trim())      errors.phone      = 'Obligatoriskt';
    if (!form.address.trim())    errors.address    = 'Obligatoriskt';
    if (!form.postalCode.trim()) errors.postalCode = 'Obligatoriskt';
    if (!form.city.trim())       errors.city       = 'Obligatoriskt';
    return errors;
  }

  async function placeOrder() {
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          items,
          subtotal: total,
          discount: discountAmount,
          discountCode: appliedCode,
          shipping,
          total: orderTotal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderNumber(data.orderNumber);
        clear();
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (orderNumber) {
    return (
      <div style={{ maxWidth: 600, margin: '6rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ marginBottom: '0.75rem' }}>Tack for din bestallning!</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>Ordernummer: <strong>{orderNumber}</strong></p>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Vi behandlar din order och skickar en bekraftelse till {form.email}.<br />
          Leveranstid 1-3 arbetsdagar.
        </p>
        <Link href="/produkter" style={{ background: 'var(--accent)', color: '#fff', padding: '0.875rem 2rem', borderRadius: 4, textDecoration: 'none', fontWeight: 500 }}>
          Fortsatt handla
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '6rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</p>
        <h1 style={{ marginBottom: '0.75rem' }}>Varukorgen ar tom</h1>
        <Link href="/produkter" style={{ background: 'var(--accent)', color: '#fff', padding: '0.875rem 2rem', borderRadius: 4, textDecoration: 'none', fontWeight: 500 }}>
          Handla nu
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Kassa</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '3rem', alignItems: 'start' }}>

        <div>
          {/* Customer form */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '1.5rem', background: '#fff', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '1.25rem' }}>Leveransuppgifter</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Namn</label>
                <input style={{ ...inputStyle, borderColor: formErrors.name ? '#dc2626' : 'var(--border)' }}
                  value={form.name} onChange={e => setField('name', e.target.value)} placeholder="For- och efternamn" />
                {formErrors.name && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.name}</p>}
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Telefon</label>
                <input style={{ ...inputStyle, borderColor: formErrors.phone ? '#dc2626' : 'var(--border)' }}
                  value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="070-000 00 00" />
                {formErrors.phone && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.phone}</p>}
              </div>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>E-postadress</label>
              <input style={{ ...inputStyle, borderColor: formErrors.email ? '#dc2626' : 'var(--border)' }}
                value={form.email} onChange={e => setField('email', e.target.value)} placeholder="din@email.se" type="email" />
              {formErrors.email && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.email}</p>}
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Gatuadress</label>
              <input style={{ ...inputStyle, borderColor: formErrors.address ? '#dc2626' : 'var(--border)' }}
                value={form.address} onChange={e => setField('address', e.target.value)} placeholder="Storgatan 1" />
              {formErrors.address && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.address}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Postnummer</label>
                <input style={{ ...inputStyle, borderColor: formErrors.postalCode ? '#dc2626' : 'var(--border)' }}
                  value={form.postalCode} onChange={e => setField('postalCode', e.target.value)} placeholder="123 45" />
                {formErrors.postalCode && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.postalCode}</p>}
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Stad</label>
                <input style={{ ...inputStyle, borderColor: formErrors.city ? '#dc2626' : 'var(--border)' }}
                  value={form.city} onChange={e => setField('city', e.target.value)} placeholder="Stockholm" />
                {formErrors.city && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.city}</p>}
              </div>
            </div>
          </div>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
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
                <span>-{discountAmount} kr</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Frakt</span>
              <span style={{ color: freeShipping ? '#166534' : 'inherit' }}>
                {freeShipping ? 'Gratis' : `${SHIPPING_NORMAL} kr`}
              </span>
            </div>
            {!freeShipping && discountedSubtotal < FREE_SHIPPING_MIN && (
              <p style={{ color: 'var(--muted)', fontSize: '0.78rem', background: '#fff', padding: '0.5rem 0.75rem', borderRadius: 4, border: '1px solid var(--border)' }}>
                Lagg till {FREE_SHIPPING_MIN - discountedSubtotal} kr for fri frakt
              </p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            <span>Totalt</span>
            <span>{orderTotal} kr</span>
          </div>

          <button
            onClick={placeOrder}
            disabled={submitting}
            style={{ width: '100%', background: submitting ? '#aaa' : 'var(--accent)', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: 4, cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '1rem' }}
          >
            {submitting ? 'Skickar...' : 'Lagg bestallning'}
          </button>

          <p style={{ color: 'var(--muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.75rem' }}>
            Betalning via faktura — vi kontaktar dig
          </p>

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--muted)' }}>
            <p>📦 Leverans 1-3 arbetsdagar</p>
            <p style={{ marginTop: '0.25rem' }}>✅ Nojd-katt-garanti — pengarna tillbaka</p>
          </div>
        </div>
      </div>
    </div>
  );
}
