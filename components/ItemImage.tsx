"use client";

import { useState } from "react";

export default function ItemImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (errored || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-stone-200 text-stone-400 text-2xl font-semibold ${className ?? ""}`}
        aria-hidden
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setErrored(true)} />;
}
