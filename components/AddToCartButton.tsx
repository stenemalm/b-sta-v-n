'use client';
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
  return (
    <button
      onClick={() => add(product)}
      style={{
        background: 'var(--accent)',
        color: '#fff',
        border: 'none',
        padding: large ? '0.875rem 2rem' : '0.5rem 1rem',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: large ? '1rem' : '0.85rem',
        fontWeight: 500,
        width: large ? '100%' : 'auto',
        transition: 'opacity 0.15s',
      }}
      onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
      onMouseOut={e => (e.currentTarget.style.opacity = '1')}
    >
      Lägg i varukorg
    </button>
  );
}
