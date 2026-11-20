'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bookmark,
  RotateCcw,
  Printer,
  ChevronRight,
  Check,
  LogIn,
} from 'lucide-react';
import { EvaluationResult, StatusLevel } from '@/lib/types';
import { saveLocalCheckup } from '@/lib/storage/indexedDb';
import { useAuth } from '../auth/AuthContext';
import { saveRemoteCheckup } from '@/lib/supabase/repository';
import { EDUCATION_ARTICLES } from '@/lib/education/content';
import { AuthModal } from '../auth/AuthModal';

interface ResultViewProps {
  result: EvaluationResult;
  onReset: () => void;
  isSavedInitial?: boolean;
}

export function ResultView({ result, onReset, isSavedInitial = false }: ResultViewProps) {
  const { user, isConfigured } = useAuth();
  const [isSaved, setIsSaved] = useState<boolean>(isSavedInitial);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);

    // Fitur riwayat hanya bisa diakses saat sudah login
    if (!user) {
      setAuthModalOpen(true);
      setIsSaving(false);
      return;
    }

    try {
      if (isConfigured) {
        await saveRemoteCheckup(result, user.id);
        await saveLocalCheckup(result);
        setIsSaved(true);
        setSaveSuccessMsg('Hasil berhasil disimpan ke riwayat akun cloud Anda.');
      } else {
        await saveLocalCheckup(result);
        setIsSaved(true);
        setSaveSuccessMsg('Hasil berhasil disimpan ke perangkat ini.');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      if (err.message?.includes('relation') || err.message?.includes('does not exist')) {
        setSaveErrorMsg('Tabel database "checkups" belum dibuat di Supabase. Mohon jalankan skrip supabase/schema.sql di SQL Editor Supabase terlebih dahulu.');
      } else if (err.message?.includes('permission denied')) {
        setSaveErrorMsg('Izin akses tabel di Supabase belum diberikan ke role "authenticated". Buka SQL Editor di Supabase dan jalankan: GRANT ALL ON TABLE public.checkups TO authenticated;');
      } else {
        setSaveErrorMsg(err.message || 'Gagal menyimpan hasil ke akun cloud.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Status visual badge styling helper
  const getStatusBadge = (level: StatusLevel) => {
    switch (level) {
      case 'tinggi':
        return {
          bg: 'bg-pantas-red-bg text-pantas-red border-pantas-red-border',
          icon: AlertCircle,
          label: 'Perlu Evaluasi Tenaga Medis',
        };
      case 'perhatian':
        return {
          bg: 'bg-pantas-amber-bg text-pantas-amber border-pantas-amber-border',
          icon: AlertTriangle,
          label: 'Perlu Perhatian & Pemeriksaan Lanjutan',
        };
      case 'rendah':
        return {
          bg: 'bg-pantas-amber-bg text-pantas-amber border-pantas-amber-border',
          icon: AlertTriangle,
          label: 'Hasil Rendah (Perlu Penanganan)',
        };
      case 'normal':
        return {
          bg: 'bg-pantas-soft text-pantas-primary border-pantas-border',
          icon: CheckCircle2,
          label: 'Dalam Batas Rujukan Awal',
        };
      case 'belum_ada':
      default:
        return {
          bg: 'bg-neutral-100 text-pantas-muted border-neutral-300',
          icon: HelpCircle,
          label: 'Belum Ada Hasil Pengukuran',
        };
    }
  };

  const statusBadge = getStatusBadge(result.measurement.statusLevel);
  const StatusIcon = statusBadge.icon;

  // Filter relevant education articles
  const relevantArticles = EDUCATION_ARTICLES.filter((art) =>
    result.educationIds.includes(art.id)
  );

  return (
    <div className="space-y-6 print-page">
      {/* Printable Official Header with Puskesmas Branding */}
      <div className="hidden print:block border-b-2 border-neutral-800 pb-4 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative w-12 h-12">
            <Image
              src="/images/logo-puskesmas.jpg"
              alt="Logo Puskesmas"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-black uppercase tracking-tight">
              Pemerintah Kabupaten Demak — Dinas Kesehatan
            </h1>
            <h2 className="text-base font-bold text-black">
              PUSKESMAS KARANGAWEN I
            </h2>
            <p className="text-xs text-neutral-600">
              Kec. Karangawen, Kab. Demak | Program PANTAS (Hipertensi & Diabetes)
            </p>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-neutral-300 flex justify-between text-xs text-neutral-700">
          <span>
            Pemeriksaan: <strong>{result.checkupType.toUpperCase()}</strong>
          </span>
          <span>
            Tanggal:{' '}
            {new Date(result.createdAt).toLocaleDateString('id-ID', {
              dateStyle: 'full',
            })}
          </span>
        </div>
      </div>

      {/* Notice Kontrol Puskesmas jika berstatus tinggi atau perhatian */}
      {result.measurement.statusLevel === 'tinggi' && (
        <div className="p-4 bg-pantas-soft border border-pantas-primary rounded-xl text-pantas-dark flex items-start gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-pantas-primary shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold text-pantas-primary">Pemberitahuan Kontrol Puskesmas:</p>
            <p className="text-pantas-muted mt-0.5 leading-relaxed">
              Hasil pengukuran berada di atas batas rujukan awal. Disarankan untuk berkonsultasi dan melakukan pemeriksaan lanjutan ke Puskesmas Karangawen I atau faskes terdekat.
            </p>
          </div>
        </div>
      )}

      {/* 2. ANGKA PEMERIKSAAN & INTERPRETASI SINGKAT */}
      <section className="p-5 sm:p-6 bg-white border border-pantas-border rounded-xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pantas-border pb-4">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-pantas-muted block mb-0.5">
              Hasil Pengukuran Pemeriksaan Awal
            </span>
            <h2 className="text-xl font-bold text-pantas-dark capitalize">
              Pemeriksaan {result.checkupType}
            </h2>
          </div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold self-start sm:self-auto ${statusBadge.bg}`}
          >
            <StatusIcon className="w-4 h-4 shrink-0" />
            <span>{statusBadge.label}</span>
          </div>
        </div>

        {/* Primary Value Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-pantas-bg rounded-lg border border-pantas-border">
            <span className="text-xs font-semibold text-pantas-muted block mb-1">
              {result.checkupType === 'diabetes' ? 'Nilai Glukosa Darah' : 'Tekanan Darah (Sistolik / Diastolik)'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-pantas-dark">
                {result.measurement.primaryValue}
              </span>
              <span className="text-sm font-semibold text-pantas-muted">
                {result.measurement.unit}
              </span>
            </div>
            {result.measurement.clinicalNote && (
              <p className="text-xs text-pantas-muted mt-2 border-t border-pantas-border/60 pt-2 leading-relaxed">
                {result.measurement.clinicalNote}
              </p>
            )}
          </div>

          <div className="p-4 bg-pantas-bg rounded-lg border border-pantas-border">
            <span className="text-xs font-semibold text-pantas-muted block mb-1">
              Indeks Massa Tubuh (IMT) & Profil
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-pantas-dark">
                {result.profile.bmiFormatted}
              </span>
              <span className="text-sm font-semibold text-pantas-muted">kg/m²</span>
            </div>
            <p className="text-xs font-medium text-pantas-dark mt-2 border-t border-pantas-border/60 pt-2">
              Kategori: <span className="font-bold text-pantas-primary">{result.profile.bmiCategoryLabel}</span> (Usia {result.profile.age} th, {result.profile.gender === 'laki-laki' ? 'Laki-laki' : 'Perempuan'})
            </p>
          </div>
        </div>

        {/* 3. INTERPRETASI & ALASAN */}
        <div className="space-y-3 pt-1">
          <div className="p-4 rounded-lg bg-pantas-soft border border-pantas-border text-sm space-y-1.5">
            <p className="font-bold text-pantas-primary flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-pantas-primary" />
              <span>Interpretasi Hasil:</span>
            </p>
            <p className="text-pantas-dark font-medium leading-relaxed text-xs sm:text-sm">
              {result.measurement.interpretation}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-sm space-y-1">
            <p className="font-semibold text-pantas-muted text-xs sm:text-sm">Alasan Mengapa Hasil Ini Ditampilkan:</p>
            <p className="text-neutral-700 leading-relaxed text-xs sm:text-sm">
              {result.measurement.reason}
            </p>
          </div>
        </div>
      </section>

      {/* 4. FAKTOR RISIKO YANG DITEMUKAN */}
      <section className="p-5 sm:p-6 bg-white border border-pantas-border rounded-xl shadow-xs space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-pantas-dark">
            Faktor Risiko yang Ditemukan ({result.riskFactors.length})
          </h3>
          <p className="text-xs text-pantas-muted mt-0.5">
            Faktor kebiasaan, riwayat keluarga, dan kondisi fisik yang perlu Anda perhatikan secara terpisah dari hasil laboratorium.
          </p>
        </div>

        {result.riskFactors.length > 0 ? (
          <div className="divide-y divide-pantas-border/70 border border-pantas-border rounded-lg overflow-hidden">
            {result.riskFactors.map((factor) => (
              <div key={factor.id} className="p-3.5 bg-white hover:bg-neutral-50 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-pantas-amber shrink-0" />
                  <h4 className="font-bold text-pantas-dark text-xs sm:text-sm">{factor.title}</h4>
                </div>
                <p className="text-xs sm:text-sm text-pantas-muted pl-4 leading-relaxed">
                  {factor.explanation}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-pantas-soft border border-pantas-border rounded-lg text-xs sm:text-sm text-pantas-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Tidak ditemukan faktor risiko kebiasaan utama dalam pengisian kali ini. Pertahankan pola hidup sehat Anda.</span>
          </div>
        )}
      </section>

      {/* 5. LANGKAH BERIKUTNYA */}
      <section className="p-5 sm:p-6 bg-white border border-pantas-border rounded-xl shadow-xs space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-pantas-dark">Langkah yang Disarankan</h3>
        <ol className="space-y-2.5 text-sm">
          {result.nextSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-pantas-bg border border-pantas-border/70">
              <span className="w-5 h-5 rounded-full bg-pantas-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="text-pantas-dark leading-relaxed font-medium text-xs sm:text-sm">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* 6. DISKLAIMER MEDIS RESMI */}
      <div className="p-4 rounded-xl bg-pantas-amber-bg/60 border border-pantas-amber-border text-xs text-neutral-800 leading-relaxed">
        <strong className="font-bold text-pantas-amber block mb-0.5">Keterangan Penting:</strong>
        {result.disclaimer}
      </div>

      {/* 7. EDUKASI YANG RELEVAN */}
      {relevantArticles.length > 0 && (
        <section className="space-y-3 no-print">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-pantas-dark">
              Bacaan Edukasi yang Sesuai untuk Anda
            </h3>
            <Link href="/edukasi" className="text-xs font-semibold text-pantas-primary hover:underline">
              Lihat Semua →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relevantArticles.slice(0, 2).map((art) => (
              <Link
                key={art.id}
                href={`/edukasi/${art.id}`}
                className="p-4 bg-white border border-pantas-border rounded-xl hover:border-pantas-primary hover:shadow-xs transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-pantas-primary bg-pantas-soft px-2 py-0.5 rounded">
                    {art.category.toUpperCase()}
                  </span>
                  <h4 className="font-bold text-sm text-pantas-dark mt-2 group-hover:text-pantas-primary transition-colors">
                    {art.title}
                  </h4>
                  <p className="text-xs text-pantas-muted mt-1 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-pantas-border/50 text-xs font-semibold text-pantas-primary flex items-center gap-1">
                  <span>Baca artikel</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 8. ACTION BAR (Mobile Responsive Stack) */}
      <section className="p-5 bg-white border border-pantas-border rounded-xl shadow-xs space-y-4 no-print">
        <h3 className="text-sm font-bold text-pantas-dark">Tindakan Lanjutan</h3>

        {saveSuccessMsg && (
          <div className="p-3 bg-pantas-soft border border-pantas-primary text-pantas-primary text-xs sm:text-sm rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {saveErrorMsg && (
          <div className="p-3 bg-pantas-red-bg border border-pantas-red-border text-pantas-red text-xs sm:text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveErrorMsg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          {user ? (
            <button
              onClick={() => handleSave()}
              disabled={isSaving || isSaved}
              className={`action-btn flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-colors min-h-[44px] ${
                isSaved
                  ? 'bg-pantas-soft text-pantas-primary border border-pantas-primary cursor-default'
                  : 'bg-pantas-primary text-white hover:bg-pantas-primary-hover shadow-xs'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{isSaved ? 'Tersimpan di Riwayat Akun' : 'Simpan Hasil ke Riwayat Akun'}</span>
            </button>
          ) : (
            <button
              onClick={() => handleSave()}
              className="action-btn flex items-center justify-center gap-2 px-4 py-2.5 bg-pantas-primary text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-pantas-primary-hover shadow-xs transition-colors min-h-[44px]"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk untuk Simpan ke Riwayat</span>
            </button>
          )}

          {/* Unduh / Cetak Ringkasan */}
          <button
            onClick={handlePrint}
            className="action-btn flex items-center justify-center gap-2 px-4 py-2.5 border border-pantas-border rounded-lg font-semibold text-xs sm:text-sm text-pantas-dark hover:bg-neutral-50 transition-colors min-h-[44px]"
          >
            <Printer className="w-4 h-4 text-pantas-muted" />
            <span>Cetak / Unduh Ringkasan</span>
          </button>

          {/* Mulai Pemeriksaan Baru */}
          <button
            onClick={onReset}
            className="action-btn flex items-center justify-center gap-2 px-4 py-2.5 border border-pantas-border rounded-lg font-semibold text-xs sm:text-sm text-pantas-muted hover:text-pantas-dark hover:bg-neutral-50 transition-colors sm:ml-auto min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Mulai Pemeriksaan Baru</span>
          </button>
        </div>
      </section>

      {/* Auth Modal if triggered */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => handleSave()}
      />
    </div>
  );
}
