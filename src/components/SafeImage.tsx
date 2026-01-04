'use client';

import { useState } from 'react';

interface SafeImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
}

export default function SafeImage({ src, alt, className }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
