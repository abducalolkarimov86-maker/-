import { useState } from 'react';
import { Coins } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackLabel = 'PUBG UC',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#1B1F2A] via-[#12151C] to-[#0C0E12] text-[#D4A12A] p-6 ${className}`}
      >
        <Coins className="w-10 h-10 mb-2 opacity-90" strokeWidth={1.5} />
        <span className="font-display text-lg font-semibold tracking-wide text-[#F4F4F5]">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
