'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cart';

export default function Varukorg() {
  const { items, remove, update, total } = useCart();

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '6rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
        <h1 style={{ marginBottom: '0.75rem' }}>Varukorgen är tom</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Lägg till produkter för att fortsätta.</p>
        <Link href="/produkter" style={{ background: 'var(--accent)', color: '#fff', padding: '0.875rem 2rem', borderRadius: 4, textDecoration: 'none', fontWeight: 500 }}>
          Handla nu
        </Link>
      </div>
    );
  }

  const shipping = total >= 599 ? 0 : 79;
  const orderTotal = total + shipping;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Varukorg</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>
        {/* Line items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 8, background: '#fff', alignItems: 'center' }}>
              <div style={{ width: 72, height: 72, background: 'var(--cream)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', flexShrink: 0 }}>
                {item.placeholder}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 500, marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                {item.weight && <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '0.625rem' }}>{item.weight}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                    <button onClick={() => update(item.id, item.qty - 1)} style={{ background: 'none', border: 'none', padding: '0.25rem 0.625rem', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>−</button>
                    <span style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', minWidth: 32, textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => update(item.id, item.qty + 1)} style={{ background: 'none', border: 'none', padding: '0.25rem 0.625rem', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>+</button>
                  </div>
                  <button onClick={() => remove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.8rem', textDecoration: 'underline', padding: 0 }}>
                    Ta bort
                  </button>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: '1rem', flexShrink: 0 }}>{item.price * item.qty} kr</div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '1.5rem', background: 'var(--cream)', position: 'sticky', top: '80px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Ordersammanfattning</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Delsumma</span>
              <span>{total} kr</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Frakt</span>
              <span style={{ color: shipping === 0 ? '#166534' : 'inherit' }}>{shipping === 0 ? 'Gratis ✓' : `${shipping} kr`}</span>

            </div>
            {shipping > 0 && (
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', background: '#fff', padding: '0.5rem 0.75rem', borderRadius: 4, border: '1px solid var(--border)' }}>
                Lägg till {599 - total} kr för fri frakt
              </p>
            )}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '1.25rem', fontSize: '1rem' }}>
            <span>Totalt</span>
            <span>{orderTotal} kr</span>
          </div>
          <Link href="/kassa" style={{ display: 'block', background: 'var(--accent)', color: '#fff', padding: '0.875rem', borderRadius: 4, textDecoration: 'none', textAlign: 'center', fontWeight: 500, fontSize: '0.95rem' }}>
            Till kassan →
          </Link>
          <p style={{ color: 'var(--muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.75rem' }}>
            🔒 Säker betalning med kort eller Swish
          </p>
        </div>
      </div>
    </div>
  );
}
