'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  History,
  Trash2,
  Printer,
  Calendar,
  AlertTriangle,
  AlertCircle,
  Cloud,
  ChevronRight,
  Lock,
  UserCheck,
  ShieldCheck,
  Activity,
  LogIn,
} from 'lucide-react';
import { EvaluationResult, CheckupType } from '@/lib/types';
import { deleteLocalCheckup } from '@/lib/storage/indexedDb';
import { useAuth } from '@/components/auth/AuthContext';
import {
  getRemoteCheckups,
  deleteRemoteCheckup,
  clearAllRemoteCheckups,
} from '@/lib/supabase/repository';
import { TrendCharts } from '@/components/history/TrendCharts';
import { AuthModal } from '@/components/auth/AuthModal';

export default function RiwayatPage() {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const [checkups, setCheckups] = useState<EvaluationResult[]>([]);
  const [filterType, setFilterType] = useState<'semua' | CheckupType>('semua');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const loadData = async () => {
    if (!user) {
      setCheckups([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      if (isConfigured) {
        const remote = await getRemoteCheckups(user.id);
        setCheckups(remote);
      }
    } catch (err) {
      console.error('Error loading checkups from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading]);

  const handleDeleteOne = async (id: string) => {
    if (!user) return;
    try {
      if (isConfigured) {
        await deleteRemoteCheckup(id, user.id);
      }
      await deleteLocalCheckup(id);
      setCheckups((prev) => prev.filter((item) => item.id !== id));
      setDeleteTargetId(null);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleClearAll = async () => {
    if (!user) return;
    try {
      if (isConfigured) {
        await clearAllRemoteCheckups(user.id);
      }
      setCheckups([]);
      setConfirmClearOpen(false);
    } catch (err) {
      console.error('Failed to clear checkups:', err);
    }
  };

  const filteredCheckups = checkups.filter((item) => {
    if (filterType === 'semua') return true;
    return item.checkupType === filterType;
  });

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // 1. Loading State saat auth sedang dicek
  if (authLoading) {
    return (
      <div className="p-12 text-center bg-white border border-pantas-border rounded-lg text-sm text-pantas-muted space-y-2">
        <div className="w-8 h-8 mx-auto border-2 border-pantas-primary border-t-transparent rounded-full animate-spin" />
        <p>Memeriksa status akun...</p>
      </div>
    );
  }

  // 2. Proteksi Akses: Jika belum login, tampilkan layar pemberitahuan harus login
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="border-b border-pantas-border pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-pantas-primary tracking-tight">
            Riwayat Pemeriksaan
          </h1>
          <p className="text-sm text-pantas-muted mt-1 leading-relaxed">
            Pantau riwayat gula darah dan tekanan darah Anda secara berkelanjutan.
          </p>
        </div>

        <div className="p-8 sm:p-10 bg-white border border-pantas-border rounded-lg text-center space-y-5 max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-pantas-soft flex items-center justify-center text-pantas-primary">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-pantas-dark">
              Fitur Riwayat Memerlukan Akun
            </h2>
            <p className="text-sm text-pantas-muted leading-relaxed">
              Untuk melindungi privasi kesehatan Anda, fitur penyimpanan riwayat dan grafik tren perkembangan hanya dapat diakses setelah masuk ke akun PANTAS.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-pantas-bg border border-pantas-border text-left text-xs text-neutral-800 space-y-2">
            <p className="font-semibold text-pantas-primary flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-pantas-primary shrink-0" />
              <span>Manfaat Memiliki Akun PANTAS:</span>
            </p>
            <ul className="space-y-1 text-pantas-muted pl-5 list-disc">
              <li>Menyimpan seluruh catatan gula darah dan tensi di database cloud terenkripsi.</li>
              <li>Melihat grafik perkembangan berkala (Recharts) untuk mendeteksi perubahan dini.</li>
              <li>Mencetak ringkasan pemeriksaan rapi untuk dibawa konsultasi ke dokter/Puskesmas.</li>
              <li>Data Anda terlindungi penuh dengan aturan Row Level Security (RLS).</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full sm:w-auto px-6 py-2.5 bg-pantas-primary text-white font-medium rounded text-sm hover:bg-pantas-primary-hover shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk atau Buat Akun</span>
            </button>

            <Link
              href="/pemeriksaan"
              className="w-full sm:w-auto px-5 py-2.5 border border-pantas-border text-pantas-dark font-medium rounded text-sm hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4 text-pantas-primary" />
              <span>Mulai Pemeriksaan Tanpa Login</span>
            </Link>
          </div>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => loadData()}
        />
      </div>
    );
  }

  // 3. Tampilan Riwayat untuk Pengguna yang Sudah Login
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pantas-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-pantas-primary tracking-tight">
            Riwayat Pemeriksaan
          </h1>
          <p className="text-sm text-pantas-muted mt-1 leading-relaxed">
            Daftar hasil pemeriksaan kesehatan yang tersimpan di akun Anda beserta grafik perkembangan berkala.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-pantas-soft rounded-lg text-xs font-semibold text-pantas-primary">
          <UserCheck className="w-4 h-4" />
          <span>Tersambung: {user.email}</span>
        </div>
      </div>

      {/* Cloud Status Banner */}
      <div className="p-4 bg-white border border-pantas-border rounded-lg text-xs leading-relaxed flex items-start gap-3 shadow-xs">
        <Cloud className="w-5 h-5 text-pantas-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-pantas-dark">
            Tersimpan Aman di Server Cloud Terproteksi RLS
          </p>
          <p className="text-pantas-muted mt-0.5">
            Setiap catatan pemeriksaan Anda dilindungi oleh kebijakan Row Level Security PostgreSQL sehingga hanya akun Anda yang memiliki izin untuk membaca, mengubah, dan menghapus data ini.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Action Bar (Mobile Responsive) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-pantas-border overflow-x-auto w-full sm:w-auto shadow-2xs">
          <button
            onClick={() => setFilterType('semua')}
            className={`px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap flex-1 sm:flex-none transition-colors min-h-[38px] ${
              filterType === 'semua'
                ? 'bg-pantas-primary text-white shadow-2xs'
                : 'text-pantas-muted hover:text-pantas-dark'
            }`}
          >
            Semua ({checkups.length})
          </button>
          <button
            onClick={() => setFilterType('diabetes')}
            className={`px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap flex-1 sm:flex-none transition-colors min-h-[38px] ${
              filterType === 'diabetes'
                ? 'bg-pantas-primary text-white shadow-2xs'
                : 'text-pantas-muted hover:text-pantas-dark'
            }`}
          >
            Diabetes ({checkups.filter((c) => c.checkupType === 'diabetes').length})
          </button>
          <button
            onClick={() => setFilterType('hipertensi')}
            className={`px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap flex-1 sm:flex-none transition-colors min-h-[38px] ${
              filterType === 'hipertensi'
                ? 'bg-pantas-primary text-white shadow-2xs'
                : 'text-pantas-muted hover:text-pantas-dark'
            }`}
          >
            Hipertensi ({checkups.filter((c) => c.checkupType === 'hipertensi').length})
          </button>
        </div>

        {checkups.length > 0 && (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 border border-pantas-border bg-white rounded-lg text-xs font-semibold text-pantas-dark hover:bg-neutral-50 flex items-center gap-1.5 transition-colors min-h-[38px]"
            >
              <Printer className="w-3.5 h-3.5 text-pantas-muted" />
              <span>Cetak Ringkasan</span>
            </button>
            <button
              onClick={() => setConfirmClearOpen(true)}
              className="px-3.5 py-2 border border-pantas-red-border text-pantas-red bg-white rounded-lg text-xs font-semibold hover:bg-pantas-red-bg flex items-center gap-1.5 transition-colors min-h-[38px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua</span>
            </button>
          </div>
        )}
      </div>

      {/* TREND CHARTS (RECHARTS) */}
      {checkups.length > 0 && (
        <section aria-label="Grafik Tren Riwayat">
          <TrendCharts checkups={checkups} />
        </section>
      )}

      {/* CHECKUPS LIST */}
      <section className="space-y-3" aria-label="Daftar Riwayat Pemeriksaan">
        <h2 className="text-lg font-bold text-pantas-dark">Daftar Pemeriksaan Anda</h2>

        {isLoading ? (
          <div className="p-8 text-center bg-white border border-pantas-border rounded-lg text-sm text-pantas-muted">
            Memuat riwayat pemeriksaan dari cloud...
          </div>
        ) : filteredCheckups.length > 0 ? (
          <div className="space-y-3">
            {filteredCheckups.map((item) => {
              const isHigh = item.measurement.statusLevel === 'tinggi';
              const isAttention = item.measurement.statusLevel === 'perhatian';
              const isRedFlag = item.redFlags.isTriggered;

              return (
                <div
                  key={item.id}
                  className="p-5 bg-white border border-pantas-border rounded-lg shadow-sm hover:border-pantas-primary/60 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pantas-border/70 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-pantas-soft text-pantas-primary">
                        {item.checkupType === 'diabetes' ? 'Diabetes Melitus' : 'Hipertensi'}
                      </span>
                      <span className="text-xs text-pantas-muted flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isRedFlag && (
                        <span className="px-2 py-0.5 rounded bg-pantas-red text-white text-[11px] font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Tanda Bahaya</span>
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          isHigh
                            ? 'bg-pantas-red-bg text-pantas-red'
                            : isAttention
                            ? 'bg-pantas-amber-bg text-pantas-amber'
                            : 'bg-pantas-soft text-pantas-primary'
                        }`}
                      >
                        {item.measurement.statusLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-pantas-muted block text-xs">Hasil Pengukuran:</span>
                      <span className="font-bold text-pantas-dark text-base">
                        {item.measurement.hasMeasurement
                          ? `${item.measurement.primaryValue} ${item.measurement.unit}`
                          : 'Belum ada pengukuran'}
                      </span>
                    </div>
                    <div>
                      <span className="text-pantas-muted block text-xs">Indeks Massa Tubuh:</span>
                      <span className="font-semibold text-pantas-dark">
                        {item.profile.bmiFormatted} kg/m² ({item.profile.bmiCategoryLabel})
                      </span>
                    </div>
                    <div>
                      <span className="text-pantas-muted block text-xs">Faktor Risiko:</span>
                      <span className="font-semibold text-pantas-dark">
                        {item.riskFactors.length} Faktor Terdeteksi
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-pantas-bg text-xs text-pantas-muted leading-relaxed">
                    <strong className="text-pantas-dark">Interpretasi: </strong>
                    {item.measurement.interpretation}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href={`/riwayat/${item.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-pantas-primary hover:underline"
                    >
                      <span>Lihat Rincian Lengkap</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(item.id)}
                      className="p-1 text-xs text-pantas-muted hover:text-pantas-red rounded transition-colors"
                      title="Hapus rekaman ini"
                      aria-label="Hapus rekaman pemeriksaan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white border border-pantas-border rounded-lg space-y-3">
            <History className="w-8 h-8 text-pantas-muted mx-auto" />
            <h3 className="font-semibold text-pantas-dark text-sm">Belum Ada Riwayat Pemeriksaan</h3>
            <p className="text-xs text-pantas-muted max-w-sm mx-auto">
              {filterType === 'semua'
                ? 'Akun Anda belum memiliki data pemeriksaan yang disimpan. Lakukan pemeriksaan mandiri sekarang untuk mulai mencatat dan memantau tren kesehatan Anda.'
                : `Belum ada data pemeriksaan kategori ${filterType}.`}
            </p>
            <div className="pt-2">
              <Link
                href="/pemeriksaan"
                className="px-4 py-2 bg-pantas-primary text-white text-xs font-medium rounded hover:bg-pantas-primary-hover inline-block"
              >
                Mulai Pemeriksaan
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Modal Konfirmasi Hapus Satu Rekaman */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full border border-pantas-border space-y-4">
            <h3 className="text-base font-bold text-pantas-dark">Konfirmasi Hapus</h3>
            <p className="text-xs text-pantas-muted leading-relaxed">
              Apakah Anda yakin ingin menghapus data pemeriksaan ini dari akun Anda? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-3 py-1.5 border border-pantas-border rounded text-xs font-medium text-pantas-muted hover:bg-neutral-100"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteOne(deleteTargetId)}
                className="px-3 py-1.5 bg-pantas-red text-white rounded text-xs font-medium hover:bg-red-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Seluruh Riwayat */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full border border-pantas-border space-y-4">
            <div className="flex items-center gap-2 text-pantas-red font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>Hapus Seluruh Riwayat Pemeriksaan?</span>
            </div>
            <p className="text-xs text-pantas-muted leading-relaxed">
              Semua catatan pemeriksaan kesehatan yang tersimpan di akun cloud Anda akan dihapus secara permanen. Tindakan ini tidak dapat dipulihkan.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-2 border border-pantas-border rounded text-xs font-medium text-pantas-muted hover:bg-neutral-100"
              >
                Batal
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-pantas-red text-white rounded text-xs font-medium hover:bg-red-700"
              >
                Ya, Hapus Semua Riwayat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
