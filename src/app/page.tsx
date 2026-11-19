'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Heart,
  Droplet,
  ArrowRight,
  History,
  BookOpen,
  Calendar,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { EvaluationResult } from '@/lib/types';
import { getLocalCheckups } from '@/lib/storage/indexedDb';
import { useAuth } from '@/components/auth/AuthContext';
import { getRemoteCheckups } from '@/lib/supabase/repository';

export default function HomePage() {
  const { user } = useAuth();
  const [latestCheckup, setLatestCheckup] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLatest() {
      setIsLoading(true);
      try {
        if (user) {
          const remote = await getRemoteCheckups(user.id);
          if (remote.length > 0) {
            setLatestCheckup(remote[0]);
            setIsLoading(false);
            return;
          }
        }
        const local = await getLocalCheckups();
        if (local.length > 0) {
          setLatestCheckup(local[0]);
        } else {
          setLatestCheckup(null);
        }
      } catch (err) {
        console.error('Error loading latest checkup:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLatest();
  }, [user]);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header / Intro Section */}
      <section className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-pantas-soft text-pantas-primary text-xs font-semibold uppercase tracking-wider">
          <span>Aplikasi Pemantauan Kesehatan Mandiri</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-pantas-primary leading-tight">
          Pantau gula darah dan tekanan darah Anda
        </h1>
        <p className="text-base text-pantas-muted max-w-2xl leading-relaxed">
          PANTAS membantu Anda mencatat hasil pengukuran mandiri, mengenali faktor risiko kebiasaan sehari-hari, dan mendapatkan panduan edukasi yang tepat tanpa diagnosis sepihak.
        </p>

        <div className="pt-2">
          <Link
            href="/pemeriksaan"
            className="inline-flex items-center gap-2 px-5 py-3 bg-pantas-primary text-white font-medium rounded text-base hover:bg-pantas-primary-hover transition-colors shadow-sm"
          >
            <Activity className="w-5 h-5" />
            <span>Mulai Pemeriksaan Sekarang</span>
          </Link>
        </div>
      </section>

      {/* Two Clear Choices: Diabetes & Hipertensi */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-pantas-dark">Pilih Jenis Pemeriksaan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card Diabetes */}
          <Link
            href="/pemeriksaan?tipe=diabetes"
            className="group block p-5 bg-white border border-pantas-border rounded-lg hover:border-pantas-primary transition-all shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded bg-pantas-soft flex items-center justify-center text-pantas-primary group-hover:bg-pantas-primary group-hover:text-white transition-colors">
                <Droplet className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-pantas-muted group-hover:text-pantas-primary flex items-center gap-1">
                Mulai <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-lg font-semibold text-pantas-dark mb-1 group-hover:text-pantas-primary transition-colors">
              Pemeriksaan Diabetes
            </h3>
            <p className="text-sm text-pantas-muted leading-relaxed">
              Nilai faktor risiko konsumsi manis, aktivitas fisik, riwayat keluarga, dan catat hasil laboratorium Gula Darah Puasa (GDP) atau Sewaktu (GDS).
            </p>
          </Link>

          {/* Card Hipertensi */}
          <Link
            href="/pemeriksaan?tipe=hipertensi"
            className="group block p-5 bg-white border border-pantas-border rounded-lg hover:border-pantas-primary transition-all shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded bg-pantas-soft flex items-center justify-center text-pantas-primary group-hover:bg-pantas-primary group-hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-pantas-muted group-hover:text-pantas-primary flex items-center gap-1">
                Mulai <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-lg font-semibold text-pantas-dark mb-1 group-hover:text-pantas-primary transition-colors">
              Pemeriksaan Hipertensi
            </h3>
            <p className="text-sm text-pantas-muted leading-relaxed">
              Pantau tekanan darah sistolik dan diastolik, kenali dampak asupan garam, kebiasaan merokok, dan keluhan fisik yang menyertai.
            </p>
          </Link>
        </div>
      </section>

      {/* Ringkasan Pemeriksaan Terakhir ATAU Keadaan Kosong */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-pantas-dark">Pemeriksaan Terakhir Anda</h2>
          {latestCheckup && (
            <Link
              href="/riwayat"
              className="text-xs font-medium text-pantas-primary hover:underline flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" />
              <span>Lihat semua riwayat</span>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 bg-white border border-pantas-border rounded-lg text-sm text-pantas-muted">
            Memuat catatan pemeriksaan...
          </div>
        ) : latestCheckup ? (
          <div className="p-5 bg-white border border-pantas-border rounded-lg space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pantas-border pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-pantas-soft text-pantas-primary uppercase">
                  {latestCheckup.checkupType === 'diabetes' ? 'Diabetes Melitus' : 'Hipertensi'}
                </span>
                <span className="text-xs text-pantas-muted flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(latestCheckup.createdAt)}
                </span>
              </div>
              <Link
                href={`/riwayat/${latestCheckup.id}`}
                className="text-xs font-medium text-pantas-primary hover:underline"
              >
                Buka Detail Hasil →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="p-3 bg-pantas-bg rounded border border-pantas-border/60">
                <span className="text-xs text-pantas-muted block mb-0.5">Hasil Pengukuran</span>
                <span className="font-semibold text-pantas-dark text-base">
                  {latestCheckup.measurement.hasMeasurement
                    ? `${latestCheckup.measurement.primaryValue} ${latestCheckup.measurement.unit}`
                    : 'Belum ada data lab/tensi'}
                </span>
              </div>

              <div className="p-3 bg-pantas-bg rounded border border-pantas-border/60">
                <span className="text-xs text-pantas-muted block mb-0.5">Status IMT</span>
                <span className="font-semibold text-pantas-dark text-base">
                  {latestCheckup.profile.bmiFormatted} kg/m² ({latestCheckup.profile.bmiCategoryLabel})
                </span>
              </div>

              <div className="p-3 bg-pantas-bg rounded border border-pantas-border/60">
                <span className="text-xs text-pantas-muted block mb-0.5">Faktor Risiko Terdeteksi</span>
                <span className="font-semibold text-pantas-dark text-base">
                  {latestCheckup.riskFactors.length} Faktor
                </span>
              </div>
            </div>

            <div className="p-3 rounded bg-pantas-soft border border-pantas-border text-xs text-pantas-dark flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-pantas-primary shrink-0 mt-0.5" />
              <div>
                <strong className="block font-medium">Interpretasi Awal:</strong>
                <p className="mt-0.5 text-pantas-muted leading-relaxed">
                  {latestCheckup.measurement.interpretation}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state - JANGAN diisi data contoh palsu */
          <div className="p-6 bg-white border border-pantas-border rounded-lg text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-pantas-soft flex items-center justify-center text-pantas-primary">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="font-semibold text-pantas-dark text-base">Belum Ada Riwayat Pemeriksaan</h3>
              <p className="text-sm text-pantas-muted mt-1 leading-relaxed">
                Anda belum pernah menyimpan hasil pemeriksaan di perangkat ini. Klik tombol di bawah untuk memulai penilaian faktor risiko dan pemantauan mandiri pertama Anda.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/pemeriksaan?tipe=diabetes"
                className="px-4 py-2 bg-pantas-primary text-white text-xs font-medium rounded hover:bg-pantas-primary-hover transition-colors"
              >
                Periksa Diabetes
              </Link>
              <Link
                href="/pemeriksaan?tipe=hipertensi"
                className="px-4 py-2 border border-pantas-primary text-pantas-primary text-xs font-medium rounded hover:bg-pantas-soft transition-colors"
              >
                Periksa Hipertensi
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Satu Materi Edukasi Singkat Pilihan */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-pantas-dark">Edukasi Kesehatan Pilihan</h2>
          <Link
            href="/edukasi"
            className="text-xs font-medium text-pantas-primary hover:underline flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lihat semua bacaan</span>
          </Link>
        </div>

        <div className="p-5 bg-white border border-pantas-border rounded-lg space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-pantas-soft text-pantas-primary">
              Pedoman Kemenkes RI
            </span>
            <span className="text-xs text-pantas-muted">Waktu baca ~3 menit</span>
          </div>
          <h3 className="text-base font-semibold text-pantas-dark">
            CERDIK: 6 Langkah Nyata Mengendalikan Risiko Penyakit Tidak Menular
          </h3>
          <p className="text-sm text-pantas-muted leading-relaxed">
            Kementerian Kesehatan RI merumuskan CERDIK sebagai langkah praktis sehari-hari: Cek kesehatan teratur, Enyahkan asap rokok, Rajin aktivitas fisik minimal 30 menit sehari, Diet sehat dengan membatasi Gula-Garam-Lemak, Istirahat cukup, dan Kelola stres dengan baik.
          </p>
          <div className="pt-1">
            <Link
              href="/edukasi/edu-cerdik"
              className="text-sm font-semibold text-pantas-primary hover:underline inline-flex items-center gap-1"
            >
              Baca selengkapnya <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Privasi & Informasi Keamanan */}
      <section className="p-4 rounded-lg bg-neutral-100/70 border border-neutral-200 text-xs text-pantas-muted leading-relaxed">
        <p className="font-medium text-pantas-dark mb-1">Prinsip Privasi PANTAS:</p>
        <p>
          Pemeriksaan awal dan materi edukasi dapat digunakan sepenuhnya tanpa perlu mendaftar atau masuk ke akun. Hasil pemeriksaan disimpan di perangkat lokal (browser) Anda atas pilihan Anda sendiri. Bila Anda ingin mengakses riwayat dari perangkat lain, Anda dapat menggunakan akun online terlindungi Row Level Security. Kami tidak pernah meminta NIK, nomor telepon, atau data sensitif yang tidak diperlukan.
        </p>
      </section>
    </div>
  );
}
