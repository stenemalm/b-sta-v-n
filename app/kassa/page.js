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

const PAYMENT_METHODS = [
  { label: 'Klarna',      bg: '#FFB3C7', color: '#111' },
  { label: 'Visa',        bg: '#1A1F71', color: '#fff' },
  { label: 'Mastercard',  bg: '#EB001B', color: '#fff' },
  { label: 'Apple Pay',   bg: '#000',    color: '#fff' },
  { label: 'Google Pay',  bg: '#fff',    color: '#111', border: '1px solid #ddd' },
];

const inputStyle = {
  width: '100%', padding: '0.625rem 0.875rem',
  border: '1px solid var(--border)', borderRadius: 6,
  fontSize: '0.9rem', outline: 'none', background: '#fff',
};

function PaymentForm({ orderNumber, onSuccess }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error,  setError]  = useState('');

  async function handlePay(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true); setError('');
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/tack?order=${orderNumber}` },
      redirect: 'if_required',
    });
    if (stripeError) { setError(stripeError.message ?? 'Betalningen misslyckades.'); setPaying(false); }
    else onSuccess();
  }

  return (
    <form onSubmit={handlePay}>
      <PaymentElement options={{ layout: 'accordion' }} />
      {error && (
        <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#fef2f2', borderRadius: 6 }}>
          {error}
        </p>
      )}
      <button type="submit" disabled={!stripe || paying}
        style={{ marginTop: '1.25rem', width: '100%', background: paying ? '#aaa' : 'var(--accent)', color: '#fff', border: 'none', padding: '0.95rem', borderRadius: 6, cursor: paying ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.02em' }}>
        {paying ? 'Behandlar...' : 'Betala nu'}
      </button>
      <p style={{ color: 'var(--muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.75rem' }}>
        🔒 Säker betalning via Stripe · PCI DSS-certifierat
      </p>
    </form>
  );
}

export default function Kassa() {
  const { items, total, clear } = useCart();

  const [step, setStep]               = useState('form');
  const [clientSecret, setClientSecret] = useState('');
  const [orderNumber, setOrderNumber]   = useState('');
  const [loading, setLoading]           = useState(false);
  const [payError, setPayError]         = useState('');

  const [codeInput, setCodeInput]     = useState('');
  const [appliedCode, setAppliedCode] = useState(null);
  const [codeError, setCodeError]     = useState('');
  const [codeOpen, setCodeOpen]       = useState(false);

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', postalCode: '', city: '' });
  const [formErrors, setFormErrors] = useState({});

  const code           = appliedCode ? CODES[appliedCode] : null;
  const discountAmount = code ? Math.round(total * code.discountPct) : 0;
  const discountedSub  = total - discountAmount;
  const freeShipping   = code?.freeShipping || discountedSub >= FREE_SHIPPING_MIN;
  const shipping       = freeShipping ? 0 : SHIPPING_NORMAL;
  const orderTotal     = discountedSub + shipping;
  const toFreeShipping = Math.max(0, FREE_SHIPPING_MIN - discountedSub);

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
    setLoading(true); setPayError('');
    try {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const rand    = Math.random().toString(36).substr(2, 4).toUpperCase();
      const ref     = `ZP-${dateStr}-${rand}`;
      setOrderNumber(ref);

      const res  = await fetch('/api/stripe/create-intent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shipping, discount: discountAmount, customer: form }),
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

  useEffect(() => { if (step === 'done') clear(); }, [step]);

  if (items.length === 0 && step !== 'done') {
    return (
      <div style={{ maxWidth: 600, margin: '6rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</p>
        <h1 style={{ marginBottom: '0.75rem' }}>Varukorgen är tom</h1>
        <Link href="/produkter" style={{ background: 'var(--accent)', color: '#fff', padding: '0.875rem 2rem', borderRadius: 6, textDecoration: 'none', fontWeight: 600 }}>
          Handla nu
        </Link>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div style={{ maxWidth: 600, margin: '6rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ marginBottom: '0.75rem' }}>Tack för din beställning!</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>Ordernummer: <strong>{orderNumber}</strong></p>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
          Betalningen bekräftad. Orderbekräftelse skickas till {form.email}.<br />
          Hemleverans 3–7 arbetsdagar från Europa.
        </p>
        <Link href="/produkter" style={{ background: 'var(--accent)', color: '#fff', padding: '0.875rem 2rem', borderRadius: 6, textDecoration: 'none', fontWeight: 600 }}>
          Fortsätt handla
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Kassa</h1>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: step === 'form' ? 'var(--accent)' : 'var(--muted)', fontWeight: step === 'form' ? 600 : 400 }}>1. Dina uppgifter</span>
          <span style={{ color: 'var(--muted)' }}>→</span>
          <span style={{ color: step === 'payment' ? 'var(--accent)' : 'var(--muted)', fontWeight: step === 'payment' ? 600 : 400 }}>2. Betalning</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>

          {/* ── Vänster ── */}
          <div>
            {step === 'form' && (
              <>
                {/* Leveransuppgifter */}
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '1.75rem', marginBottom: '1.25rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '1.25rem' }}>Leveransuppgifter</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Namn *</label>
                      <input style={{ ...inputStyle, borderColor: formErrors.name ? '#dc2626' : 'var(--border)' }}
                        value={form.name} onChange={e => setField('name', e.target.value)} placeholder="För- och efternamn" />
                      {formErrors.name && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.name}</p>}
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Telefon *</label>
                      <input style={{ ...inputStyle, borderColor: formErrors.phone ? '#dc2626' : 'var(--border)' }}
                        value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="070-000 00 00" />
                      {formErrors.phone && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.phone}</p>}
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>E-postadress *</label>
                    <input style={{ ...inputStyle, borderColor: formErrors.email ? '#dc2626' : 'var(--border)' }}
                      value={form.email} onChange={e => setField('email', e.target.value)} placeholder="din@email.se" type="email" />
                    {formErrors.email && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.email}</p>}
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Gatuadress *</label>
                    <input style={{ ...inputStyle, borderColor: formErrors.address ? '#dc2626' : 'var(--border)' }}
                      value={form.address} onChange={e => setField('address', e.target.value)} placeholder="Storgatan 1" />
                    {formErrors.address && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.address}</p>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Postnummer *</label>
                      <input style={{ ...inputStyle, borderColor: formErrors.postalCode ? '#dc2626' : 'var(--border)' }}
                        value={form.postalCode} onChange={e => setField('postalCode', e.target.value)} placeholder="123 45" />
                      {formErrors.postalCode && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.postalCode}</p>}
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Stad *</label>
                      <input style={{ ...inputStyle, borderColor: formErrors.city ? '#dc2626' : 'var(--border)' }}
                        value={form.city} onChange={e => setField('city', e.target.value)} placeholder="Stockholm" />
                      {formErrors.city && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.city}</p>}
                    </div>
                  </div>
                </div>

                {/* Rabattkod */}
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: '1.25rem' }}>
                  <button onClick={() => setCodeOpen(o => !o)}
                    style={{ width: '100%', background: 'none', border: 'none', padding: '1rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', fontWeight: 500 }}>
                    Har du en rabattkod?
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{codeOpen ? '▲' : '▼'}</span>
                  </button>
                  {codeOpen && (
                    <div style={{ padding: '0 1.5rem 1.25rem' }}>
                      {appliedCode ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ background: '#dcfce7', color: '#166534', padding: '0.375rem 0.875rem', borderRadius: 99, fontSize: '0.85rem', fontWeight: 500 }}>
                            ✓ {appliedCode} — {code.label}
                          </span>
                          <button onClick={() => { setAppliedCode(null); setCodeInput(''); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.8rem', textDecoration: 'underline', padding: 0 }}>
                            Ta bort
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input value={codeInput} onChange={e => { setCodeInput(e.target.value); setCodeError(''); }}
                            onKeyDown={e => e.key === 'Enter' && applyCode()}
                            placeholder="Ange kod"
                            style={{ flex: 1, padding: '0.625rem 0.875rem', border: `1px solid ${codeError ? '#dc2626' : 'var(--border)'}`, borderRadius: 6, fontSize: '0.9rem', outline: 'none' }} />
                          <button onClick={applyCode}
                            style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.625rem 1.25rem', borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' }}>
                            Aktivera
                          </button>
                        </div>
                      )}
                      {codeError && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.4rem' }}>{codeError}</p>}
                    </div>
                  )}
                </div>

                {payError && (
                  <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.75rem', padding: '0.75rem', background: '#fef2f2', borderRadius: 6, border: '1px solid #fca5a5' }}>
                    ⚠️ {payError}
                  </p>
                )}
                <button onClick={goToPayment} disabled={loading}
                  style={{ width: '100%', background: loading ? '#aaa' : 'var(--accent)', color: '#fff', border: 'none', padding: '1rem', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.02em' }}>
                  {loading ? 'Förbereder betalning...' : 'Fortsätt till betalning →'}
                </button>

                {/* Betalmetod-ikoner under knappen */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {PAYMENT_METHODS.map(m => (
                    <span key={m.label} style={{
                      background: m.bg, color: m.color, border: m.border ?? 'none',
                      padding: '0.25rem 0.625rem', borderRadius: 5, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.02em',
                    }}>
                      {m.label}
                    </span>
                  ))}
                </div>
              </>
            )}

            {step === 'payment' && clientSecret && (
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '1rem' }}>Välj betalmetod</p>
                  <button onClick={() => setStep('form')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.85rem', textDecoration: 'underline' }}>
                    ← Ändra uppgifter
                  </button>
                </div>
                <Elements stripe={stripePromise} options={{ clientSecret, locale: 'sv', appearance: { theme: 'stripe', variables: { colorPrimary: '#7C5C2E', borderRadius: '6px' } } }}>
                  <PaymentForm orderNumber={orderNumber} onSuccess={() => setStep('done')} />
                </Elements>
              </div>
            )}
          </div>

          {/* ── Höger: ordersammanfattning ── */}
          <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', position: 'sticky', top: 80 }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Varukorg</h2>
            </div>

            <div style={{ padding: '1.25rem 1.5rem' }}>
              {/* Produkter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--muted)', flex: 1 }}>{item.name.slice(0, 26)}{item.name.length > 26 ? '…' : ''} ×{item.qty}</span>
                    <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{item.price * item.qty} kr</span>
                  </div>
                ))}
              </div>

              {/* Fri frakt-progress */}
              {toFreeShipping > 0 && (
                <div style={{ background: '#fff', borderRadius: 6, padding: '0.75rem', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>
                    <strong style={{ color: 'var(--text)' }}>{toFreeShipping} kr</strong> kvar till gratis frakt!
                  </p>
                  <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (discountedSub / FREE_SHIPPING_MIN) * 100)}%`, background: 'var(--accent)', borderRadius: 99 }} />
                  </div>
                </div>
              )}

              {/* Summering */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Delsumma</span>
                  <span>{total} kr</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534' }}>
                    <span>Rabatt</span><span>−{discountAmount} kr</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Frakt</span>
                  <span style={{ color: freeShipping ? '#166534' : 'inherit', fontWeight: freeShipping ? 500 : 400 }}>
                    {freeShipping ? 'Gratis' : `${SHIPPING_NORMAL} kr`}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.15rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', marginBottom: '1.25rem' }}>
                <span>Totalt</span>
                <span>{orderTotal} kr</span>
              </div>

              {/* Leverans-info tydlig */}
              <div style={{ background: '#fff', borderRadius: 6, padding: '0.875rem', border: '1px solid var(--border)', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.2rem', fontSize: '0.85rem' }}>Leverans</p>
                <p>🏠 <strong>Hemleverans</strong> — direkt till din dörr</p>
                <p>📦 3–7 arbetsdagar från Europa</p>
                <p>🇪🇺 Skickas från EU-lager</p>
              </div>

              {/* Betalmetoder */}
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Vi accepterar</p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {PAYMENT_METHODS.map(m => (
                    <span key={m.label} style={{
                      background: m.bg, color: m.color, border: m.border ?? 'none',
                      padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700,
                    }}>
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
