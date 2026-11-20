import React from 'react';
import Image from 'next/image';

export default function RootLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 space-y-4 animate-in fade-in duration-300">
      <div className="relative w-12 h-14 animate-pulse">
        <Image
          src="/images/logo-puskesmas.jpg"
          alt="Puskesmas Karangawen I"
          fill
          sizes="48px"
          className="object-contain"
          priority
        />
      </div>
      <div className="flex items-center gap-2.5 text-pantas-primary font-semibold text-sm">
        <div className="w-5 h-5 border-2 border-pantas-primary border-t-transparent rounded-full animate-spin" />
        <span>Memuat halaman...</span>
      </div>
      <p className="text-xs text-pantas-muted">Puskesmas Karangawen I</p>
    </div>
  );
}
