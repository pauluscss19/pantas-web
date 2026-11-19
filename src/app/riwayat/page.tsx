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
  HardDrive,
  Cloud,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { EvaluationResult, CheckupType } from '@/lib/types';
import {
  getLocalCheckups,
  deleteLocalCheckup,
  clearAllLocalCheckups,
  saveLocalCheckup,
} from '@/lib/storage/indexedDb';
import { useAuth } from '@/components/auth/AuthContext';
import {
  getRemoteCheckups,
  deleteRemoteCheckup,
  clearAllRemoteCheckups,
} from '@/lib/supabase/repository';
import { TrendCharts } from '@/components/history/TrendCharts';

export default function RiwayatPage() {
  const { user, isConfigured } = useAuth();
  const [checkups, setCheckups] = useState<EvaluationResult[]>([]);
  const [filterType, setFilterType] = useState<'semua' | CheckupType>('semua');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Ambil data lokal terlebih dahulu
      const local = await getLocalCheckups();
      let combined: EvaluationResult[] = [...local];

      // Jika user sedang login, ambil juga data remote dari Supabase
      if (user && isConfigured) {
        try {
          const remote = await getRemoteCheckups(user.id);
          if (remote.length > 0) {
            const localMap = new Map(local.map((item) => [item.id, item]));
            remote.forEach((r) => localMap.set(r.id, r));
            combined = Array.from(localMap.values());
          }
        } catch (remoteErr: any) {
          console.warn('Gagal memuat dari Supabase cloud:', remoteErr?.message);
        }
      }

      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCheckups(combined);
    } catch (err) {
      console.error('Error loading checkups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDeleteOne = async (id: string) => {
    try {
      if (user && isConfigured) {
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
    try {
      if (user && isConfigured) {
        await clearAllRemoteCheckups(user.id);
      }
      await clearAllLocalCheckups();
      setCheckups([]);
      setConfirmClearOpen(false);
      setIsDemoMode(false);
    } catch (err) {
      console.error('Failed to clear checkups:', err);
    }
  };

  // Demo Mode: generates realistic sample checkups with clear label
  const handleToggleDemoMode = async () => {
    if (isDemoMode) {
      // Remove demo records
      await clearAllLocalCheckups();
      setCheckups([]);
      setIsDemoMode(false);
      return;
    }

    const demoRecords: EvaluationResult[] = [
      {
        id: 'demo_ht_1',
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        checkupType: 'hipertensi',
        profile: {
          age: 52,
          gender: 'laki-laki',
          weight: 76,
          height: 165,
          bmi: 27.91,
          bmiFormatted: '27,9',
          bmiCategory: 'obesitas',
          bmiCategoryLabel: 'Obesitas (≥27)',
        },
        redFlags: {
          isTriggered: false,
          title: '',
          message: '',
          action: '',
          urgency: 'waspada',
          symptoms: [],
        },
        measurement: {
          hasMeasurement: true,
          primaryValue: '150 / 92',
          unit: 'mmHg',
          interpretation: 'Tekanan darah berada di atas ambang pemeriksaan awal.',
          reason: 'Sistolik (150 mmHg) dan Diastolik (92 mmHg) berada di atas batas 140/90 mmHg.',
          statusLevel: 'tinggi',
          clinicalNote: 'Perlu pemeriksaan ulang dan konsultasi dokter Puskesmas/klinik.',
        },
        riskFactors: [
          {
            id: 'rf-1',
            title: 'Indeks Massa Tubuh: Obesitas (≥27)',
            explanation: 'Beban kerja sirkulasi jantung meningkat.',
            category: 'fisik',
          },
          {
            id: 'rf-2',
            title: 'Kebiasaan Makanan Asin',
            explanation: 'Asupan natrium tinggi menahan cairan di pembuluh darah.',
            category: 'gaya_hidup',
          },
        ],
        nextSteps: ['Pemeriksaan tensi ulang di Puskesmas', 'Batasi konsumsi garam maksimal 1 sdt/hari'],
        educationIds: ['edu-ht-basics', 'edu-cerdik', 'edu-ggl'],
        disclaimer: 'Hasil pemantauan awal mandiri.',
        rawInput: {
          hasTestedBP: true,
          systolic: 150,
          diastolic: 92,
        },
      },
      {
        id: 'demo_ht_2',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        checkupType: 'hipertensi',
        profile: {
          age: 52,
          gender: 'laki-laki',
          weight: 75,
          height: 165,
          bmi: 27.54,
          bmiFormatted: '27,5',
          bmiCategory: 'obesitas',
          bmiCategoryLabel: 'Obesitas (≥27)',
        },
        redFlags: {
          isTriggered: false,
          title: '',
          message: '',
          action: '',
          urgency: 'waspada',
          symptoms: [],
        },
        measurement: {
          hasMeasurement: true,
          primaryValue: '142 / 88',
          unit: 'mmHg',
          interpretation: 'Tekanan darah sistolik masih berada di atas ambang batas 140 mmHg.',
          reason: 'Peningkatan sistolik terisolasi tetap memerlukan tindak lanjut.',
          statusLevel: 'tinggi',
          clinicalNote: 'Lanjutkan gaya hidup sehat dan pembatasan garam dapur.',
        },
        riskFactors: [],
        nextSteps: ['Tetap monitor tekanan darah mingguan.'],
        educationIds: ['edu-ht-basics'],
        disclaimer: 'Hasil pemantauan awal mandiri.',
        rawInput: {
          hasTestedBP: true,
          systolic: 142,
          diastolic: 88,
        },
      },
      {
        id: 'demo_dm_1',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        checkupType: 'diabetes',
        profile: {
          age: 48,
          gender: 'perempuan',
          weight: 64,
          height: 158,
          bmi: 25.63,
          bmiFormatted: '25,6',
          bmiCategory: 'berat-berlebih',
          bmiCategoryLabel: 'Berat Badan Berlebih (25 - <27)',
        },
        redFlags: {
          isTriggered: false,
          title: '',
          message: '',
          action: '',
          urgency: 'waspada',
          symptoms: [],
        },
        measurement: {
          hasMeasurement: true,
          primaryValue: '118',
          unit: 'mg/dL',
          interpretation: 'Hasil berada pada rentang yang memerlukan perhatian (Prediabetes).',
          reason: 'GDP antara 100 sampai <126 mg/dL tergolong Glukosa Darah Puasa Terganggu.',
          statusLevel: 'perhatian',
          clinicalNote: 'Disarankan konfirmasi dokter untuk pencegahan progresi ke diabetes.',
        },
        riskFactors: [
          {
            id: 'rf-dm1',
            title: 'Riwayat Keluarga Diabetes',
            explanation: 'Orang tua memiliki riwayat diabetes tipe 2.',
            category: 'riwayat',
          },
        ],
        nextSteps: ['Terapkan prinsip makan 3J', 'Aktivitas fisik rutin 150 menit per minggu'],
        educationIds: ['edu-dm-basics', 'edu-prinsip-3j', 'edu-cerdik'],
        disclaimer: 'Hasil pemantauan awal mandiri.',
        rawInput: {
          hasTestedGlucose: true,
          testType: 'gdp',
          glucoseValue: 118,
          fasting8Hours: true,
        },
      },
      {
        id: 'demo_dm_2',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        checkupType: 'diabetes',
        profile: {
          age: 48,
          gender: 'perempuan',
          weight: 63.5,
          height: 158,
          bmi: 25.43,
          bmiFormatted: '25,4',
          bmiCategory: 'berat-berlebih',
          bmiCategoryLabel: 'Berat Badan Berlebih (25 - <27)',
        },
        redFlags: {
          isTriggered: false,
          title: '',
          message: '',
          action: '',
          urgency: 'waspada',
          symptoms: [],
        },
        measurement: {
          hasMeasurement: true,
          primaryValue: '106',
          unit: 'mg/dL',
          interpretation: 'Hasil berada pada rentang perhatian (Prediabetes).',
          reason: 'Kadar glukosa puasa 106 mg/dL menunjukkan perbaikan dibanding sebelumnya.',
          statusLevel: 'perhatian',
          clinicalNote: 'Pertahankan pembatasan konsumsi manis.',
        },
        riskFactors: [],
        nextSteps: ['Konsultasikan hasil ke nakes Puskesmas.'],
        educationIds: ['edu-dm-basics'],
        disclaimer: 'Hasil pemantauan awal mandiri.',
        rawInput: {
          hasTestedGlucose: true,
          testType: 'gdp',
          glucoseValue: 106,
          fasting8Hours: true,
        },
      },
    ];

    for (const rec of demoRecords) {
      await saveLocalCheckup(rec);
    }
    setCheckups(demoRecords);
    setIsDemoMode(true);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pantas-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-pantas-primary tracking-tight">
            Riwayat Pemeriksaan
          </h1>
          <p className="text-sm text-pantas-muted mt-1 leading-relaxed">
            Daftar hasil pemeriksaan kesehatan yang pernah Anda simpan beserta grafik perkembangan berkala.
          </p>
        </div>

        {/* Demo Mode Toggle Button */}
        <button
          type="button"
          onClick={handleToggleDemoMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
            isDemoMode
              ? 'bg-pantas-amber-bg text-pantas-amber border-pantas-amber-border'
              : 'bg-white border-pantas-border text-pantas-muted hover:text-pantas-dark'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-pantas-amber" />
          <span>{isDemoMode ? 'Matikan Mode Demo' : 'Aktifkan Mode Demo (Data Contoh)'}</span>
        </button>
      </div>

      {/* Storage Information / Privacy Banner */}
      <div className="p-4 bg-white border border-pantas-border rounded-lg text-xs leading-relaxed flex items-start gap-3 shadow-xs">
        {user && isConfigured ? (
          <>
            <Cloud className="w-5 h-5 text-pantas-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-pantas-dark">
                Tersinkronisasi ke Akun Cloud ({user.email})
              </p>
              <p className="text-pantas-muted mt-0.5">
                Data Anda tersimpan secara aman di database server terlindungi kebijakan Row Level Security (hanya Anda yang dapat membaca dan mengelola data ini).
              </p>
            </div>
          </>
        ) : (
          <>
            <HardDrive className="w-5 h-5 text-pantas-muted shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-pantas-dark">Penyimpanan Lokal Pada Perangkat Ini</p>
              <p className="text-pantas-muted mt-0.5">
                Riwayat disimpan pada perangkat dan browser yang digunakan, serta dapat hilang jika data browser dihapus. Bila Anda ingin menyimpan riwayat secara online dan memantaunya dari perangkat lain, silakan masuk ke akun PANTAS.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Demo Mode Banner Indicator */}
      {isDemoMode && (
        <div className="p-3 bg-pantas-amber-bg border border-pantas-amber-border text-xs rounded text-pantas-amber font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Mode Demo Aktif: Menampilkan data contoh untuk simulasi grafik dan riwayat.</span>
          </div>
          <button onClick={handleToggleDemoMode} className="underline hover:text-neutral-900">
            Hapus Data Demo
          </button>
        </div>
      )}

      {/* Filter Tabs & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-pantas-border">
          <button
            onClick={() => setFilterType('semua')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              filterType === 'semua'
                ? 'bg-pantas-primary text-white'
                : 'text-pantas-muted hover:text-pantas-dark'
            }`}
          >
            Semua ({checkups.length})
          </button>
          <button
            onClick={() => setFilterType('diabetes')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              filterType === 'diabetes'
                ? 'bg-pantas-primary text-white'
                : 'text-pantas-muted hover:text-pantas-dark'
            }`}
          >
            Diabetes ({checkups.filter((c) => c.checkupType === 'diabetes').length})
          </button>
          <button
            onClick={() => setFilterType('hipertensi')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              filterType === 'hipertensi'
                ? 'bg-pantas-primary text-white'
                : 'text-pantas-muted hover:text-pantas-dark'
            }`}
          >
            Hipertensi ({checkups.filter((c) => c.checkupType === 'hipertensi').length})
          </button>
        </div>

        {checkups.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 border border-pantas-border bg-white rounded text-xs font-medium text-pantas-dark hover:bg-neutral-100 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-pantas-muted" />
              <span>Cetak Ringkasan</span>
            </button>
            <button
              onClick={() => setConfirmClearOpen(true)}
              className="px-3 py-1.5 border border-pantas-red-border text-pantas-red bg-white rounded text-xs font-medium hover:bg-pantas-red-bg flex items-center gap-1.5 transition-colors"
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
        <h2 className="text-lg font-bold text-pantas-dark">Daftar Pemeriksaan</h2>

        {isLoading ? (
          <div className="p-8 text-center bg-white border border-pantas-border rounded-lg text-sm text-pantas-muted">
            Memuat riwayat pemeriksaan...
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
            <h3 className="font-semibold text-pantas-dark text-sm">Tidak Ada Catatan Riwayat</h3>
            <p className="text-xs text-pantas-muted max-w-sm mx-auto">
              {filterType === 'semua'
                ? 'Belum ada data pemeriksaan yang disimpan. Lakukan pemeriksaan mandiri sekarang untuk mulai memantau tren kesehatan Anda.'
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
              Apakah Anda yakin ingin menghapus data pemeriksaan ini? Tindakan ini tidak dapat dibatalkan.
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
              Semua catatan pemeriksaan kesehatan yang tersimpan di perangkat ini (dan akun cloud Anda jika terhubung) akan dihapus secara permanen. Tindakan ini tidak dapat dipulihkan.
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

