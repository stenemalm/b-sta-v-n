import { getProduct, products } from '@/lib/products';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import Link from 'next/link';
import ProductImage from '@/components/ProductImage';

export function generateStaticParams() {
  return products.map(p => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const stars = Math.round(product.rating);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <Link href="/produkter" style={{ color: 'var(--muted)', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
        ← Tillbaka till produkter
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '4rem', alignItems: 'start' }}>
        {/* Image */}
        <div style={{ background: 'var(--cream)', borderRadius: 12, aspectRatio: '1 / 1', position: 'relative', overflow: 'hidden' }}>
          <ProductImage src={product.image} alt={product.name} placeholder={product.placeholder} sizes="(max-width: 768px) 100vw, 50vw" />
        </div>

        {/* Details */}
        <div>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '0.375rem' }}>{product.brand}</p>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>{product.name}</h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ color: '#D97706', fontSize: '1rem' }}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
            <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{product.rating} · {product.reviews} recensioner</span>
          </div>

          {/* Price */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 600 }}>{product.price} kr</span>
          </div>

          {product.weight && (
            <p style={{ color: 'var(--muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>Vikt / storlek: {product.weight}</p>
          )}

          <p style={{ lineHeight: 1.75, marginBottom: '1.75rem', color: 'var(--text)', fontSize: '0.95rem' }}>{product.description}</p>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {product.tags.map(tag => (
              <span key={tag} style={{ background: 'var(--cream)', border: '1px solid var(--border)', padding: '0.25rem 0.75rem', borderRadius: 99, fontSize: '0.8rem', color: 'var(--muted)' }}>
                {tag}
              </span>
            ))}
          </div>

          <AddToCartButton product={product} large />

          <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--cream)', borderRadius: 6, fontSize: '0.85rem', color: 'var(--muted)' }}>
            <p>📦 Fri frakt vid köp över 599 kr</p>
            <p style={{ marginTop: '0.25rem' }}>🇩🇪 Skickas från Tyskland · 3–7 arbetsdagar</p>
            <p style={{ marginTop: '0.25rem' }}>✅ Nöjd-katt-garanti — pengarna tillbaka</p>
          </div>
        </div>
      </div>
    </div>
  );
}
