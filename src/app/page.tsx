'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Lock,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { EvaluationResult } from '@/lib/types';
import { useAuth } from '@/components/auth/AuthContext';
import { getRemoteCheckups } from '@/lib/supabase/repository';
import { AuthModal } from '@/components/auth/AuthModal';

export default function HomePage() {
  const { user } = useAuth();
  const [latestCheckup, setLatestCheckup] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    async function loadLatest() {
      if (!user) {
        setLatestCheckup(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const remote = await getRemoteCheckups(user.id);
        if (remote.length > 0) {
          setLatestCheckup(remote[0]);
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
    <div className="space-y-6 sm:space-y-8">
      {/* Puskesmas Karangawen I Institutional Badge */}
      <section className="bg-white border border-pantas-border rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-12 h-14">
            <Image
              src="/images/logo-puskesmas.jpg"
              alt="Logo Puskesmas Kemenkes"
              fill
              sizes="48px"
              className="object-contain"
              priority
            />
          </div>
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-200 shadow-xs">
            <Image
              src="/images/logo-karangawen.jpg"
              alt="Logo Puskesmas Karangawen I"
              fill
              sizes="48px"
              className="object-cover"
              priority
            />
          </div>
        </div>
        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="flex items-center justify-center sm:justify-start">
            <span className="text-sm font-bold text-pantas-primary uppercase tracking-wider">
              Puskesmas Karangawen I
            </span>
          </div>
          <p className="text-xs sm:text-sm text-pantas-muted mt-1 leading-relaxed">
            Layanan Skrining Kesehatan Mandiri untuk Masyarakat Karangawen dan Sekitarnya — Deteksi Dini Gula Darah &amp; Tekanan Darah.
          </p>
        </div>
      </section>

      {/* Header / Intro Section */}
      <section className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-pantas-soft text-pantas-primary text-xs font-semibold uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5" />
          <span>Aplikasi Pemantauan Mandiri</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-pantas-primary leading-tight">
          Pantau gula darah dan tekanan darah Anda
        </h1>
        <p className="text-sm sm:text-base text-pantas-muted max-w-2xl leading-relaxed">
          PANTAS membantu Anda mencatat hasil pengukuran mandiri, mengenali faktor risiko kebiasaan sehari-hari, dan mendapatkan panduan edukasi yang tepat tanpa diagnosis sepihak.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/pemeriksaan"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-pantas-primary text-white font-medium rounded-lg text-sm sm:text-base hover:bg-pantas-primary-hover transition-colors shadow-sm min-h-[48px]"
          >
            <Activity className="w-5 h-5" />
            <span>Mulai Pemeriksaan Sekarang</span>
          </Link>
          <Link
            href="/edukasi"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 border border-pantas-border bg-white text-pantas-dark font-medium rounded-lg text-sm sm:text-base hover:bg-neutral-50 transition-colors min-h-[48px]"
          >
            <BookOpen className="w-5 h-5 text-pantas-muted" />
            <span>Baca Edukasi Kesehatan</span>
          </Link>
        </div>
      </section>

      {/* Two Clear Choices: Diabetes & Hipertensi */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-pantas-dark">Pilih Jenis Pemeriksaan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card Diabetes */}
          <Link
            href="/pemeriksaan?tipe=diabetes"
            className="group block p-5 bg-white border border-pantas-border rounded-xl hover:border-pantas-primary hover:shadow-md transition-all shadow-xs"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-lg bg-pantas-soft flex items-center justify-center text-pantas-primary group-hover:bg-pantas-primary group-hover:text-white transition-colors">
                <Droplet className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-pantas-muted group-hover:text-pantas-primary flex items-center gap-1">
                Mulai <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-lg font-bold text-pantas-dark mb-1 group-hover:text-pantas-primary transition-colors">
              Pemeriksaan Diabetes
            </h3>
            <p className="text-xs sm:text-sm text-pantas-muted leading-relaxed">
              Nilai faktor risiko konsumsi manis, aktivitas fisik, riwayat keluarga, dan catat hasil laboratorium Gula Darah Puasa (GDP) atau Sewaktu (GDS).
            </p>
          </Link>

          {/* Card Hipertensi */}
          <Link
            href="/pemeriksaan?tipe=hipertensi"
            className="group block p-5 bg-white border border-pantas-border rounded-xl hover:border-pantas-primary hover:shadow-md transition-all shadow-xs"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-lg bg-pantas-soft flex items-center justify-center text-pantas-primary group-hover:bg-pantas-primary group-hover:text-white transition-colors">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-pantas-muted group-hover:text-pantas-primary flex items-center gap-1">
                Mulai <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-lg font-bold text-pantas-dark mb-1 group-hover:text-pantas-primary transition-colors">
              Pemeriksaan Hipertensi
            </h3>
            <p className="text-xs sm:text-sm text-pantas-muted leading-relaxed">
              Pantau tekanan darah sistolik dan diastolik, kenali dampak asupan garam, kebiasaan merokok, dan keluhan fisik yang menyertai.
            </p>
          </Link>
        </div>
      </section>

      {/* Ringkasan Pemeriksaan Terakhir ATAU Keadaan Kosong */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-pantas-dark">Pemeriksaan Terakhir Anda</h2>
          {user && latestCheckup && (
            <Link
              href="/riwayat"
              className="text-xs font-semibold text-pantas-primary hover:underline flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" />
              <span>Lihat semua riwayat</span>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 bg-white border border-pantas-border rounded-xl text-sm text-pantas-muted">
            Memuat catatan pemeriksaan...
          </div>
        ) : !user ? (
          /* Locked State for Guest */
          <div className="p-6 sm:p-8 bg-white border border-pantas-border rounded-xl text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-pantas-soft flex items-center justify-center text-pantas-primary">
              <Lock className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="font-bold text-pantas-dark text-base">Riwayat Memerlukan Akun</h3>
              <p className="text-xs sm:text-sm text-pantas-muted mt-1 leading-relaxed">
                Fitur penyimpanan riwayat dan grafik perkembangan kesehatan hanya dapat diakses setelah masuk ke akun PANTAS. Anda tetap dapat melakukan pemeriksaan awal secara mandiri tanpa login.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-5 py-2.5 bg-pantas-primary text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-pantas-primary-hover transition-colors inline-flex items-center gap-1.5 shadow-2xs min-h-[44px]"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk atau Buat Akun</span>
              </button>
            </div>
          </div>
        ) : latestCheckup ? (
          <div className="p-5 bg-white border border-pantas-border rounded-xl space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pantas-border pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-pantas-soft text-pantas-primary uppercase">
                  {latestCheckup.checkupType === 'diabetes' ? 'Diabetes Melitus' : 'Hipertensi'}
                </span>
                <span className="text-xs text-pantas-muted flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(latestCheckup.createdAt)}
                </span>
              </div>
              <Link
                href={`/riwayat/${latestCheckup.id}`}
                className="text-xs font-semibold text-pantas-primary hover:underline"
              >
                Buka Detail Hasil →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="p-3 bg-pantas-bg rounded-lg border border-pantas-border/60">
                <span className="text-xs text-pantas-muted block mb-0.5">Hasil Pengukuran</span>
                <span className="font-bold text-pantas-dark text-base">
                  {latestCheckup.measurement.hasMeasurement
                    ? `${latestCheckup.measurement.primaryValue} ${latestCheckup.measurement.unit}`
                    : 'Belum ada data lab/tensi'}
                </span>
              </div>

              <div className="p-3 bg-pantas-bg rounded-lg border border-pantas-border/60">
                <span className="text-xs text-pantas-muted block mb-0.5">Status IMT</span>
                <span className="font-bold text-pantas-dark text-base">
                  {latestCheckup.profile.bmiFormatted} kg/m² ({latestCheckup.profile.bmiCategoryLabel})
                </span>
              </div>

              <div className="p-3 bg-pantas-bg rounded-lg border border-pantas-border/60">
                <span className="text-xs text-pantas-muted block mb-0.5">Faktor Risiko Terdeteksi</span>
                <span className="font-bold text-pantas-dark text-base">
                  {latestCheckup.riskFactors.length} Faktor
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-pantas-soft border border-pantas-border text-xs text-pantas-dark flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-pantas-primary shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Interpretasi Awal:</strong>
                <p className="mt-0.5 text-pantas-muted leading-relaxed">
                  {latestCheckup.measurement.interpretation}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state for logged in user who hasn't saved checkups yet */
          <div className="p-6 bg-white border border-pantas-border rounded-xl text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-pantas-soft flex items-center justify-center text-pantas-primary">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="font-bold text-pantas-dark text-base">Belum Ada Riwayat Pemeriksaan</h3>
              <p className="text-xs sm:text-sm text-pantas-muted mt-1 leading-relaxed">
                Akun Anda belum memiliki catatan pemeriksaan. Mulai pemeriksaan pertama Anda sekarang untuk mencatat data kesehatan.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
              <Link
                href="/pemeriksaan?tipe=diabetes"
                className="px-4 py-2.5 bg-pantas-primary text-white text-xs font-semibold rounded-lg hover:bg-pantas-primary-hover transition-colors"
              >
                Periksa Diabetes
              </Link>
              <Link
                href="/pemeriksaan?tipe=hipertensi"
                className="px-4 py-2.5 border border-pantas-primary text-pantas-primary text-xs font-semibold rounded-lg hover:bg-pantas-soft transition-colors"
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
          <h2 className="text-lg font-bold text-pantas-dark">Edukasi Kesehatan Pilihan</h2>
          <Link
            href="/edukasi"
            className="text-xs font-semibold text-pantas-primary hover:underline flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lihat semua bacaan</span>
          </Link>
        </div>

        <div className="p-5 bg-white border border-pantas-border rounded-xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-pantas-soft text-pantas-primary">
              Pedoman Kemenkes RI
            </span>
            <span className="text-xs text-pantas-muted">Waktu baca ~3 menit</span>
          </div>
          <h3 className="text-base font-bold text-pantas-dark">
            CERDIK: 6 Langkah Nyata Mengendalikan Risiko Penyakit Tidak Menular
          </h3>
          <p className="text-xs sm:text-sm text-pantas-muted leading-relaxed">
            Kementerian Kesehatan RI merumuskan CERDIK sebagai langkah praktis sehari-hari: Cek kesehatan teratur, Enyahkan asap rokok, Rajin aktivitas fisik minimal 30 menit sehari, Diet sehat dengan membatasi Gula-Garam-Lemak, Istirahat cukup, dan Kelola stres dengan baik.
          </p>
          <div className="pt-1">
            <Link
              href="/edukasi/edu-cerdik"
              className="text-xs sm:text-sm font-bold text-pantas-primary hover:underline inline-flex items-center gap-1"
            >
              Baca selengkapnya <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Kontak Puskesmas & Privasi */}
      <footer className="p-4 sm:p-5 rounded-xl bg-white border border-pantas-border text-xs text-pantas-muted leading-relaxed space-y-2 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 border-b border-pantas-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-9 shrink-0">
              <Image
                src="/images/logo-puskesmas.jpg"
                alt="Logo Puskesmas"
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-purple-200 shrink-0">
              <Image
                src="/images/logo-karangawen.jpg"
                alt="Logo Karangawen I"
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-pantas-dark">Puskesmas Karangawen I</p>
              <p className="text-[11px] text-pantas-muted">Kecamatan Karangawen, Kabupaten Demak, Jawa Tengah</p>
            </div>
          </div>
          <div className="text-[11px] text-pantas-primary font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Pelayanan Ramah & Terpercaya</span>
          </div>
        </div>
        <p className="pt-1">
          Aplikasi PANTAS (Pemantauan Hipertensi dan Diabetes) dikembangkan untuk mempermudah masyarakat melakukan skrining awal mandiri. Seluruh hasil bersifat rujukan awal dan tidak menggantikan pemeriksaan fisik langsung oleh dokter atau tenaga medis di Puskesmas.
        </p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
