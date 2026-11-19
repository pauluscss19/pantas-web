'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bookmark,
  RotateCcw,
  Printer,
  ChevronRight,
  Cloud,
  Check,
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

  const handleSave = async (forceCloud = false) => {
    setIsSaving(true);
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);

    try {
      if (user && isConfigured) {
        // Save to Supabase Cloud
        await saveRemoteCheckup(result, user.id);
        // Also keep a copy locally for offline access
        await saveLocalCheckup(result);
        setIsSaved(true);
        setSaveSuccessMsg('Hasil berhasil disimpan ke akun cloud dan perangkat ini.');
      } else if (forceCloud && isConfigured && !user) {
        // Open auth modal so user can login and save to cloud
        setAuthModalOpen(true);
        setIsSaving(false);
        return;
      } else {
        // Save locally to IndexedDB
        await saveLocalCheckup(result);
        setIsSaved(true);
        setSaveSuccessMsg('Hasil berhasil disimpan di perangkat ini (penyimpanan lokal browser).');
      }
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Gagal menyimpan hasil.');
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
      {/* Printable Header */}
      <div className="hidden print:block border-b border-neutral-400 pb-3 mb-4">
        <h1 className="text-xl font-bold">PANTAS — Ringkasan Hasil Pemeriksaan Awal</h1>
        <p className="text-xs text-neutral-600">
          Tanggal: {new Date(result.createdAt).toLocaleDateString('id-ID', { dateStyle: 'full' })} | Jenis:{' '}
          {result.checkupType.toUpperCase()}
        </p>
      </div>

      {/* 1. KONDISI TINDAKAN SEGERA / TANDA BAHAYA (RED FLAGS) */}
      {result.redFlags.isTriggered && (
        <section
          aria-label="Peringatan Tanda Bahaya Medis"
          className="p-5 bg-pantas-red-bg border-2 border-pantas-red rounded-lg text-pantas-dark space-y-3"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded bg-pantas-red text-white shrink-0 mt-0.5">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-2 py-0.5 bg-pantas-red text-white text-xs font-bold rounded uppercase">
                Tindakan Medis Segera
              </span>
              <h2 className="text-lg font-bold text-pantas-red">
                {result.redFlags.title}
              </h2>
              <p className="text-sm font-medium text-pantas-dark leading-relaxed">
                {result.redFlags.message}
              </p>
            </div>
          </div>

          <div className="bg-white/80 p-3.5 rounded border border-pantas-red-border text-sm space-y-2">
            <p className="font-semibold text-pantas-red">Gejala/Kondisi yang Terdeteksi:</p>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-neutral-800">
              {result.redFlags.symptoms.map((sym, idx) => (
                <li key={idx}>{sym}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-pantas-red text-white rounded font-medium text-sm flex items-center gap-2">
            <span className="font-bold underline">Instruksi:</span>
            <span>{result.redFlags.action}</span>
          </div>
        </section>
      )}

      {/* 2. ANGKA PEMERIKSAAN & INTERPRETASI SINGKAT */}
      <section className="p-6 bg-white border border-pantas-border rounded-lg shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pantas-border pb-4">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-pantas-muted block mb-1">
              Hasil Pengukuran Pemeriksaan Awal
            </span>
            <h2 className="text-xl font-bold text-pantas-dark capitalize">
              Pemeriksaan {result.checkupType}
            </h2>
          </div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${statusBadge.bg}`}
          >
            <StatusIcon className="w-4 h-4 shrink-0" />
            <span>{statusBadge.label}</span>
          </div>
        </div>

        {/* Primary Value Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-pantas-bg rounded border border-pantas-border">
            <span className="text-xs font-medium text-pantas-muted block mb-1">
              {result.checkupType === 'diabetes' ? 'Nilai Glukosa Darah' : 'Tekanan Darah (Sistolik / Diastolik)'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-pantas-dark">
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

          <div className="p-4 bg-pantas-bg rounded border border-pantas-border">
            <span className="text-xs font-medium text-pantas-muted block mb-1">
              Indeks Massa Tubuh (IMT) & Profil
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-pantas-dark">
                {result.profile.bmiFormatted}
              </span>
              <span className="text-sm font-semibold text-pantas-muted">kg/m²</span>
            </div>
            <p className="text-xs font-medium text-pantas-dark mt-2 border-t border-pantas-border/60 pt-2">
              Kategori: <span className="font-semibold">{result.profile.bmiCategoryLabel}</span> (Usia {result.profile.age} th, {result.profile.gender === 'laki-laki' ? 'Laki-laki' : 'Perempuan'})
            </p>
          </div>
        </div>

        {/* 3. INTERPRETASI & ALASAN */}
        <div className="space-y-3 pt-1">
          <div className="p-4 rounded bg-pantas-soft/70 border border-pantas-border text-sm space-y-1.5">
            <p className="font-bold text-pantas-primary flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-pantas-primary" />
              <span>Interpretasi Hasil:</span>
            </p>
            <p className="text-pantas-dark font-medium leading-relaxed">
              {result.measurement.interpretation}
            </p>
          </div>

          <div className="p-4 rounded bg-neutral-50 border border-neutral-200 text-sm space-y-1">
            <p className="font-semibold text-pantas-muted">Alasan Mengapa Hasil Ini Ditampilkan:</p>
            <p className="text-neutral-700 leading-relaxed text-xs sm:text-sm">
              {result.measurement.reason}
            </p>
          </div>
        </div>
      </section>

      {/* 4. FAKTOR RISIKO YANG DITEMUKAN */}
      <section className="p-6 bg-white border border-pantas-border rounded-lg shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-pantas-dark">
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
                  <h4 className="font-semibold text-pantas-dark">{factor.title}</h4>
                </div>
                <p className="text-xs sm:text-sm text-pantas-muted pl-4 leading-relaxed">
                  {factor.explanation}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-pantas-soft border border-pantas-border rounded text-xs sm:text-sm text-pantas-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Tidak ditemukan faktor risiko kebiasaan utama dalam pengisian kali ini. Pertahankan pola hidup sehat Anda.</span>
          </div>
        )}
      </section>

      {/* 5. LANGKAH BERIKUTNYA */}
      <section className="p-6 bg-white border border-pantas-border rounded-lg shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-pantas-dark">Langkah yang Disarankan</h3>
        <ol className="space-y-2.5 text-sm">
          {result.nextSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-3 p-3 rounded bg-pantas-bg border border-pantas-border/70">
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
      <div className="p-4 rounded-lg bg-pantas-amber-bg/60 border border-pantas-amber-border text-xs text-neutral-800 leading-relaxed">
        <strong className="font-semibold text-pantas-amber block mb-0.5">Keterangan Penting:</strong>
        {result.disclaimer}
      </div>

      {/* 7. EDUKASI YANG RELEVAN */}
      {relevantArticles.length > 0 && (
        <section className="space-y-3 no-print">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-pantas-dark">
              Bacaan Edukasi yang Sesuai untuk Anda
            </h3>
            <Link href="/edukasi" className="text-xs font-medium text-pantas-primary hover:underline">
              Lihat Semua →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relevantArticles.slice(0, 2).map((art) => (
              <Link
                key={art.id}
                href={`/edukasi/${art.id}`}
                className="p-4 bg-white border border-pantas-border rounded-lg hover:border-pantas-primary hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-semibold text-pantas-primary bg-pantas-soft px-2 py-0.5 rounded">
                    {art.category.toUpperCase()}
                  </span>
                  <h4 className="font-semibold text-sm text-pantas-dark mt-2 group-hover:text-pantas-primary transition-colors">
                    {art.title}
                  </h4>
                  <p className="text-xs text-pantas-muted mt-1 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-pantas-border/50 text-xs font-medium text-pantas-primary flex items-center gap-1">
                  <span>Baca artikel</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 8. ACTION BAR */}
      <section className="p-5 bg-white border border-pantas-border rounded-lg shadow-sm space-y-4 no-print">
        <h3 className="text-sm font-bold text-pantas-dark">Tindakan Lanjutan</h3>

        {saveSuccessMsg && (
          <div className="p-3 bg-pantas-soft border border-pantas-primary text-pantas-primary text-xs sm:text-sm rounded flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {saveErrorMsg && (
          <div className="p-3 bg-pantas-red-bg border border-pantas-red-border text-pantas-red text-xs sm:text-sm rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveErrorMsg}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {/* Tombol Simpan Hasil */}
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving || isSaved}
            className={`action-btn flex items-center gap-2 px-4 py-2.5 rounded font-medium text-sm transition-colors ${
              isSaved
                ? 'bg-pantas-soft text-pantas-primary border border-pantas-primary cursor-default'
                : 'bg-pantas-primary text-white hover:bg-pantas-primary-hover shadow-sm'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            <span>{isSaved ? 'Hasil Sudah Tersimpan' : 'Simpan Hasil Pemeriksaan'}</span>
          </button>

          {/* Jika belum login dan Supabase aktif, beri tombol simpan ke cloud */}
          {!user && isConfigured && (
            <button
              onClick={() => handleSave(true)}
              className="action-btn flex items-center gap-2 px-4 py-2.5 border border-pantas-border rounded font-medium text-sm text-pantas-dark hover:bg-pantas-soft hover:text-pantas-primary transition-colors"
            >
              <Cloud className="w-4 h-4 text-pantas-primary" />
              <span>Simpan ke Cloud (Masuk Akun)</span>
            </button>
          )}

          {/* Unduh / Cetak Ringkasan */}
          <button
            onClick={handlePrint}
            className="action-btn flex items-center gap-2 px-4 py-2.5 border border-pantas-border rounded font-medium text-sm text-pantas-dark hover:bg-neutral-100 transition-colors"
          >
            <Printer className="w-4 h-4 text-pantas-muted" />
            <span>Cetak / Unduh Ringkasan</span>
          </button>

          {/* Mulai Pemeriksaan Baru */}
          <button
            onClick={onReset}
            className="action-btn flex items-center gap-2 px-4 py-2.5 border border-pantas-border rounded font-medium text-sm text-pantas-muted hover:text-pantas-dark hover:bg-neutral-100 transition-colors ml-auto"
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
        onSuccess={() => handleSave(false)}
      />
    </div>
  );
}

