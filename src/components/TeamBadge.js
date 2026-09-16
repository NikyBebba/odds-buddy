'use client';

import { useState } from 'react';

export default function TeamBadge({ logo, name, size = 'md' }) {
  const [imgError, setImgError] = useState(false);

  const sizeClass = size === 'lg' ? 'w-16 h-16 text-2xl mb-3' : 'w-12 h-12 text-lg mb-2';

  if (logo && !imgError) {
    return <img src={logo} alt={name} onError={() => setImgError(true)} className={`${sizeClass} object-contain`} />;
  }

  return (
    <div className={`${sizeClass} rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner`}>
      ⚽
    </div>
  );
}