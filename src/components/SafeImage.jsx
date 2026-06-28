"use client";

import React, { useState, useEffect } from 'react';

import { API_BASE_URL } from '../services/api';

export default function SafeImage({ src, alt, className, style, width, height }) {
  // Simple, minimal placeholder: a light grey background with a standard image icon
  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="background-color: %23f3f4f6;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;

  const [imgSrc, setImgSrc] = useState(fallbackSvg);

  useEffect(() => {
    if (!src) {
      setImgSrc(fallbackSvg);
      return;
    }

    let resolved = src;
    if (src.startsWith('/') && !src.startsWith('//')) {
      if (src.startsWith('/uploads/')) {
        const base = API_BASE_URL.replace('/api/v1', '');
        resolved = `${base}${src}`;
      }
    } else if (src.startsWith('uploads/')) {
      const base = API_BASE_URL.replace('/api/v1', '');
      resolved = `${base}/${src}`;
    }

    setImgSrc(resolved);
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt || ''}
      className={className}
      style={style}
      width={width}
      height={height}
      onError={() => {
        if (imgSrc !== fallbackSvg) {
          setImgSrc(fallbackSvg);
        }
      }}
    />
  );
}
