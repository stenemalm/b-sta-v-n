'use client';
import { useState } from 'react';
import Image from 'next/image';

interface Props {
  src: string;
  alt: string;
  placeholder: string;
  sizes?: string;
  style?: React.CSSProperties;
}

export default function ProductImage({ src, alt, placeholder, sizes = '300px', style }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
        {placeholder}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      style={{ objectFit: 'contain', padding: '1rem', ...style }}
      onError={() => setFailed(true)}
    />
  );
}
