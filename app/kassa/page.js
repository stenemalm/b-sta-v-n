'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

const CODES = {
  MAMMAS:  { label: 'Mammarabatt', discountPct: 0.275, freeShipping: true },
  FRI2026: { label: 'Vänrabatt',   discountPct: 0.24,  freeShipping: true },
};

const SHIPPING_NORMAL   = 79;
const FREE_SHIPPING_MIN = 599;

const inputStyle = {
  width: '100%', padding: '0.625rem 0.875rem',
  border: '1px solid var(--border)', borderRadius: 4,
  fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
};

// ── Stripe betalningsformulär ──────────────────────────────────────────────
function PaymentForm({ orderNumber, onSuccess }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error,  setError]  = useState('');

  async function handlePay(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setError('');

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/tack?order=${orderNumber}`,
      },
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Betalningen misslyckades. Försök igen.');
      setPaying(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handlePay}>
      <PaymentElement options={{ layout: 'accordion' }} />
      {error && (
        <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#fef2f2', borderRadius: 4 }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || paying}
        style={{
          marginTop: '1.25rem', width: '100%',
          background: paying ? '#aaa' : 'var(--accent)',
          color: '#fff', border: 'none', padding: '0.9rem',
          borderRadius: 4, cursor: paying ? 'not-allowed' : 'pointer',
          fontWeight: 600, fontSize: '1rem',
        }}
      >
        {paying ? 'Behandlar...' : 'Betala nu'}
      </button>
    </form>
  );
}

// ── Huvudkassa ─────────────────────────────────────────────────────────────
export default function Kassa() {
  const { items, total, clear } = useCart();

  const [step, setStep]           = useState('form');   // 'form' | 'payment' | 'done'
  const [clientSecret, setClientSecret] = useState('');
  const [orderNumber, setOrderNumber]   = useState('');
  const [loading, setLoading]           = useState(false);
  const [payError, setPayError]         = useState('');

  const [codeInput, setCodeInput]     = useState('');
  const [appliedCode, setAppliedCode] = useState(null);
  const [codeError, setCodeError]     = useState('');

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', postalCode: '', city: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const code           = appliedCode ? CODES[appliedCode] : null;
  const discountAmount = code ? Math.round(total * code.discountPct) : 0;
  const discountedSub  = total - discountAmount;
  const freeShipping   = code?.freeShipping || discountedSub >= FREE_SHIPPING_MIN;
  const shipping       = freeShipping ? 0 : SHIPPING_NORMAL;
  const orderTotal     = discountedSub + shipping;

  function applyCode() {
    const upper = codeInput.trim().toUpperCase();
    if (CODES[upper]) { setAppliedCode(upper); setCodeError(''); }
    else setCodeError('Ogiltig rabattkod');
  }

  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setFormErrors(e => ({ ...e, [field]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim())       e.name       = 'Obligatoriskt';
    if (!form.email.trim())      e.email      = 'Obligatoriskt';
    if (!form.phone.trim())      e.phone      = 'Obligatoriskt';
    if (!form.address.trim())    e.address    = 'Obligatoriskt';
    if (!form.postalCode.trim()) e.postalCode = 'Obligatoriskt';
    if (!form.city.trim())       e.city       = 'Obligatoriskt';
    return e;
  }

  async function goToPayment() {
    const errors = validate();
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    setLoading(true);
    setPayError('');

    try {
      const date    = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const rand    = Math.random().toString(36).substr(2, 4).toUpperCase();
      const ref     = `BV-${dateStr}-${rand}`;
      setOrderNumber(ref);

      const res  = await fetch('/api/stripe/create-intent', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ items, shipping, discount: discountAmount, customer: form }),
      });
      const data = await res.json();

      if (!data.clientSecret) throw new Error(data.error ?? 'Kunde inte starta betalning');

      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch (err) {
      setPayError(err.message ?? 'Något gick fel. Försök igen.');
    } finally {
      setLoading(false);
    }
  }

  // ── Tom varukorg ──────────────────────────────────────────────────────
  if (items.length === 0 && step !== 'done') {
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

  useEffect(() => {
    if (step === 'done') clear();
  }, [step]);

  // ── Tack-sida ─────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div style={{ maxWidth: 600, margin: '6rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ marginBottom: '0.75rem' }}>Tack för din beställning!</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>Ordernummer: <strong>{orderNumber}</strong></p>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Betalningen bekräftad. Vi behandlar ordern och skickar en bekräftelse till {form.email}.<br />
          Leveranstid 3–7 arbetsdagar från Europa.
        </p>
        <Link href="/produkter" style={{ background: 'var(--accent)', color: '#fff', padding: '0.875rem 2rem', borderRadius: 4, textDecoration: 'none', fontWeight: 500 }}>
          Fortsätt handla
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Kassa</h1>

      {/* Steg-indikator */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', fontSize: '0.85rem' }}>
        <span style={{ color: step === 'form' ? 'var(--accent)' : 'var(--muted)', fontWeight: step === 'form' ? 600 : 400 }}>1. Dina uppgifter</span>
        <span style={{ color: 'var(--muted)' }}>→</span>
        <span style={{ color: step === 'payment' ? 'var(--accent)' : 'var(--muted)', fontWeight: step === 'payment' ? 600 : 400 }}>2. Betalning</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>

        {/* Vänster: formulär eller betalning */}
        <div>
          {step === 'form' && (
            <>
              {/* Leveransuppgifter */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '1.5rem', background: '#fff', marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '1.25rem' }}>Leveransuppgifter</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Namn</label>
                    <input style={{ ...inputStyle, borderColor: formErrors.name ? '#dc2626' : 'var(--border)' }}
                      value={form.name} onChange={e => setField('name', e.target.value)} placeholder="För- och efternamn" />
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

              {/* Rabattkod */}
              <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 8, background: '#fff', marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 500, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Rabattkod</p>
                {appliedCode ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '0.375rem 0.875rem', borderRadius: 99, fontSize: '0.85rem', fontWeight: 500 }}>
                      ✓ {appliedCode} — {code.label} ({Math.round(code.discountPct * 100)}% + fri frakt)
                    </span>
                    <button onClick={() => { setAppliedCode(null); setCodeInput(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.8rem', textDecoration: 'underline', padding: 0 }}>
                      Ta bort
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input value={codeInput} onChange={e => { setCodeInput(e.target.value); setCodeError(''); }}
                      onKeyDown={e => e.key === 'Enter' && applyCode()}
                      placeholder="Ange kod"
                      style={{ flex: 1, padding: '0.625rem 0.875rem', border: `1px solid ${codeError ? '#dc2626' : 'var(--border)'}`, borderRadius: 4, fontSize: '0.9rem', outline: 'none' }} />
                    <button onClick={applyCode} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.625rem 1.25rem', borderRadius: 4, cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' }}>
                      Aktivera
                    </button>
                  </div>
                )}
                {codeError && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.4rem' }}>{codeError}</p>}
              </div>

              {payError && (
                <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: '#fef2f2', borderRadius: 4, border: '1px solid #fca5a5' }}>
                  ⚠️ {payError}
                </p>
              )}
              <button onClick={goToPayment} disabled={loading}
                style={{ width: '100%', background: loading ? '#aaa' : 'var(--accent)', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '1rem' }}>
                {loading ? 'Förbereder betalning...' : 'Fortsätt till betalning →'}
              </button>
            </>
          )}

          {step === 'payment' && clientSecret && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '1.5rem', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 600, fontSize: '1rem' }}>Välj betalmetod</p>
                <button onClick={() => setStep('form')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.85rem', textDecoration: 'underline', padding: 0 }}>
                  ← Ändra uppgifter
                </button>
              </div>

              {/* Betalmetod-badges */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Klarna', color: '#ffb3c7', text: '#1a1a1a' },
                  { label: 'Kort', color: '#e8f0fe', text: '#1a1a1a' },
                  { label: 'Delbetalning', color: '#fff3cd', text: '#1a1a1a' },
                ].map(b => (
                  <span key={b.label} style={{ background: b.color, color: b.text, padding: '0.3rem 0.75rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 500 }}>
                    {b.label}
                  </span>
                ))}
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret, locale: 'sv', appearance: { theme: 'stripe', variables: { colorPrimary: '#8B5E3C', borderRadius: '4px' } } }}>
                <PaymentForm orderNumber={orderNumber} onSuccess={() => setStep('done')} />
              </Elements>

              <p style={{ color: 'var(--muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem' }}>
                🔒 Betalningen hanteras säkert av Stripe · PCI DSS-certifierat
              </p>
            </div>
          )}
        </div>

        {/* Höger: ordersammanfattning */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '1.5rem', background: 'var(--cream)', position: 'sticky', top: 80 }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '1.25rem' }}>Att betala</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--muted)' }}>{item.name.slice(0, 28)}{item.name.length > 28 ? '…' : ''} ×{item.qty}</span>
                <span>{item.price * item.qty} kr</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Delsumma</span>
              <span>{total} kr</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534' }}>
                <span>Rabatt</span>
                <span>-{discountAmount} kr</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Frakt</span>
              <span style={{ color: freeShipping ? '#166534' : 'inherit' }}>{freeShipping ? 'Gratis' : `${SHIPPING_NORMAL} kr`}</span>
            </div>
            {!freeShipping && discountedSub < FREE_SHIPPING_MIN && (
              <p style={{ color: 'var(--muted)', fontSize: '0.78rem', background: '#fff', padding: '0.4rem 0.6rem', borderRadius: 4, border: '1px solid var(--border)' }}>
                Lägg till {FREE_SHIPPING_MIN - discountedSub} kr för fri frakt
              </p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>
            <span>Totalt</span>
            <span>{orderTotal} kr</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <p>📦 Leverans 3–7 arbetsdagar</p>
            <p>🇩🇪 Skickas från Europa</p>
            <p>✅ Nöjd-katt-garanti</p>
          </div>
        </div>
      </div>
    </div>
  );
}
