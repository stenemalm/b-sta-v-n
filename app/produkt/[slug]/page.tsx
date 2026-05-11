import { getProduct, products } from '@/lib/products';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import Link from 'next/link';
import ImageGallery from '@/components/ImageGallery';
import ProductTabs from '@/components/ProductTabs';

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
  const images: string[] = (product as any).images?.length
    ? (product as any).images
    : [product.image].filter(Boolean);

  // Find size variants (same suchnummer, different product)
  const suchnummer = (product as any).suchnummer;
  const variants = suchnummer
    ? products.filter(p => (p as any).suchnummer === suchnummer && p.id !== product.id)
    : [];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <Link href="/produkter" style={{ color: 'var(--muted)', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
        ← Tillbaka till produkter
      </Link>

      {/* Main grid: image left, details right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '4rem', alignItems: 'start' }}>

        {/* Left: image gallery */}
        <ImageGallery images={images} name={product.name} placeholder={product.placeholder} />

        {/* Right: product details */}
        <div>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {product.brand}
          </p>
          <h1 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 2rem)', marginBottom: '0.75rem', lineHeight: 1.25 }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ color: '#D97706' }}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
            <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{product.rating} · {product.reviews} recensioner</span>
          </div>

          {/* Price */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700 }}>{product.price} kr</span>
            {product.originalPrice && (
              <span style={{ color: 'var(--muted)', fontSize: '1rem', textDecoration: 'line-through', marginLeft: '0.75rem' }}>
                {product.originalPrice} kr
              </span>
            )}
          </div>

          {/* Size selector: current product + variants */}
          {(product.weight || variants.length > 0) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Storlek / vikt
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {/* Current product */}
                <div style={{
                  padding: '0.625rem 1rem', borderRadius: 6, fontSize: '0.9rem',
                  border: '2px solid var(--accent)', background: '#fdf8f2',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontWeight: 500 }}>{product.weight || 'Standard'}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{product.price} kr</span>
                </div>
                {/* Variants */}
                {variants.map(v => (
                  <Link key={v.id} href={`/produkt/${v.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '0.625rem 1rem', borderRadius: 6, fontSize: '0.9rem',
                      border: '1px solid var(--border)', background: '#fff',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer',
                    }}>
                      <span style={{ color: 'var(--text)' }}>{v.weight || v.name}</span>
                      <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{v.price} kr</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Short description */}
          <p style={{ lineHeight: 1.75, marginBottom: '1.75rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
            {product.description.slice(0, 200)}{product.description.length > 200 ? '…' : ''}
          </p>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {product.tags.map((tag: string) => (
                <span key={tag} style={{ background: 'var(--cream)', border: '1px solid var(--border)', padding: '0.2rem 0.7rem', borderRadius: 99, fontSize: '0.8rem', color: 'var(--muted)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Add to cart */}
          <AddToCartButton product={product} large />

          {/* Trust info */}
          <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: 'var(--cream)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem', border: '1px solid var(--border)' }}>
            <p>📦 Fri frakt vid köp över 599 kr</p>
            <p>🇩🇪 Skickas från Tyskland · 3–7 arbetsdagar</p>
            <p>↩️ 14 dagars ångerrätt · 3 års reklamationsrätt</p>
          </div>

          {/* Article number */}
          {(product as any).articleNumber && (
            <p style={{ marginTop: '1rem', color: 'var(--muted)', fontSize: '0.78rem' }}>
              Artikelnummer: {(product as any).articleNumber}
            </p>
          )}
        </div>
      </div>

      {/* Tabs: Beskrivning + Ingredienser */}
      <ProductTabs
        description={product.description}
        rawDescription={(product as any).rawDescription}
      />
    </div>
  );
}
