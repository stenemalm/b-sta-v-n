'use client';
import { useState } from 'react';
import ProductImage from './ProductImage';

export default function ImageGallery({ images, name, placeholder }: {
  images: string[];
  name: string;
  placeholder: string;
}) {
  const [selected, setSelected] = useState(0);
  const all = images.length ? images : [];

  return (
    <div>
      {/* Main image */}
      <div style={{
        background: 'var(--cream)', borderRadius: 12,
        aspectRatio: '1 / 1', position: 'relative', overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        <ProductImage
          src={all[selected] || ''}
          alt={name}
          placeholder={placeholder}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {all.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {all.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              style={{
                width: 64, height: 64, padding: 0, border: 'none', cursor: 'pointer',
                borderRadius: 6, overflow: 'hidden', position: 'relative',
                outline: i === selected ? '2px solid var(--accent)' : '1px solid var(--border)',
                background: 'var(--cream)', flexShrink: 0,
              }}
              aria-label={`Bild ${i + 1}`}
            >
              <ProductImage src={src} alt={`${name} bild ${i + 1}`} placeholder={placeholder} sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
