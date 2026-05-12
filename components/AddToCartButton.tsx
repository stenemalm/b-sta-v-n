'use client';
import { useState } from 'react';
import { useCart } from '@/lib/cart';

type Product = {
  id: number;
  name: string;
  price: number;
  placeholder: string;
  weight?: string | null;
  [key: string]: unknown;
};

export default function AddToCartButton({ product, large }: { product: Product; large?: boolean }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleAdd}
      style={{
        background: added ? '#4a7c4e' : 'var(--accent)',
        color: '#fff',
        border: 'none',
        padding: large ? '0.875rem 2rem' : '0.5rem 1rem',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: large ? '1rem' : '0.85rem',
        fontWeight: 500,
        width: large ? '100%' : 'auto',
        transition: 'background 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {added ? '✓ Tillagd!' : 'Lägg i varukorg'}
    </button>
  );
}
