'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckupWizard } from '@/components/checkup/CheckupWizard';
import { CheckupType } from '@/lib/types';

function CheckupContent() {
  const searchParams = useSearchParams();
  const rawType = searchParams.get('tipe');
  const initialType: CheckupType = rawType === 'hipertensi' ? 'hipertensi' : 'diabetes';

  return <CheckupWizard initialType={initialType} />;
}

export default function PemeriksaanPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-pantas-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-pantas-primary tracking-tight">
          Pemeriksaan Mandiri PANTAS
        </h1>
        <p className="text-sm text-pantas-muted mt-1 leading-relaxed">
          Ikuti tahapan pengisian di bawah untuk menilai faktor risiko tubuh dan mencatat hasil pemeriksaan awal Anda.
        </p>
      </div>

      <Suspense fallback={<div className="p-6 text-sm text-pantas-muted">Memuat formulir pemeriksaan...</div>}>
        <CheckupContent />
      </Suspense>
    </div>
  );
}

