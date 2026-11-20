'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Search,
  Filter,
  Download,
  Printer,
  ShieldCheck,
  Heart,
  Droplet,
  RefreshCw,
  Eye,
  X,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { isAdminUser } from '@/lib/auth/admin';
import { getAllCheckupsAdmin } from '@/lib/supabase/repository';
import { EvaluationResult, CheckupType, StatusLevel } from '@/lib/types';
import { ResultView } from '@/components/checkup/ResultView';
import { AuthModal } from '@/components/auth/AuthModal';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [checkups, setCheckups] = useState<EvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'semua' | CheckupType>('semua');
  const [filterStatus, setFilterStatus] = useState<'semua' | StatusLevel>('semua');
  const [selectedCheckup, setSelectedCheckup] = useState<EvaluationResult | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const isAdmin = useMemo(() => {
    return isAdminUser(user?.email, user?.user_metadata);
  }, [user]);

  const loadData = async () => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getAllCheckupsAdmin();
      setCheckups(data);
    } catch (err: any) {
      console.error('Failed to load admin checkups:', err);
      setErrorMsg(err.message || 'Gagal memuat data pasien dari server Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [user, isAdmin, authLoading]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = checkups.length;
    const dm = checkups.filter((c) => c.checkupType === 'diabetes');
    const ht = checkups.filter((c) => c.checkupType === 'hipertensi');
    const highRisk = checkups.filter((c) => c.measurement.statusLevel === 'tinggi');
    const attention = checkups.filter((c) => c.measurement.statusLevel === 'perhatian');
    const normal = checkups.filter((c) => c.measurement.statusLevel === 'normal');

    return {
      total,
      dmTotal: dm.length,
      dmHigh: dm.filter((c) => c.measurement.statusLevel === 'tinggi').length,
      htTotal: ht.length,
      htHigh: ht.filter((c) => c.measurement.statusLevel === 'tinggi').length,
      highRiskTotal: highRisk.length,
      attentionTotal: attention.length,
      normalTotal: normal.length,
    };
  }, [checkups]);

  // Filtered checkups list
  const filteredCheckups = useMemo(() => {
    return checkups.filter((c) => {
      const matchType = filterType === 'semua' || c.checkupType === filterType;
      const matchStatus = filterStatus === 'semua' || c.measurement.statusLevel === filterStatus;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        c.id.toLowerCase().includes(query) ||
        c.createdAt.toLowerCase().includes(query) ||
        (c.userId && c.userId.toLowerCase().includes(query)) ||
        c.measurement.primaryValue.toLowerCase().includes(query) ||
        c.profile.bmiCategoryLabel.toLowerCase().includes(query);

      return matchType && matchStatus && matchSearch;
    });
  }, [checkups, filterType, filterStatus, searchQuery]);

  // Export to CSV function (dilengkapi anti-dobel klik)
  const handleExportCSV = () => {
    if (isExporting || filteredCheckups.length === 0) return;
    setIsExporting(true);

    try {
      const headers = [
        'No',
        'ID Pemeriksaan',
        'User ID',
        'Tanggal',
        'Jenis Pemeriksaan',
        'Nilai Pengukuran',
        'Satuan',
        'Status Klinis',
        'Umur',
        'Jenis Kelamin',
        'BB (kg)',
        'TB (cm)',
        'IMT (kg/m2)',
        'Kategori IMT',
        'Jumlah Faktor Risiko',
      ];

      const rows = filteredCheckups.map((c, idx) => [
        idx + 1,
        `"${c.id}"`,
        `"${c.userId || '-'}"`,
        `"${new Date(c.createdAt).toLocaleString('id-ID')}"`,
        `"${c.checkupType === 'diabetes' ? 'Diabetes Melitus' : 'Hipertensi'}"`,
        `"${c.measurement.primaryValue}"`,
        `"${c.measurement.unit}"`,
        `"${c.measurement.statusLevel.toUpperCase()}"`,
        c.profile.age,
        `"${c.profile.gender}"`,
        c.profile.weight,
        c.profile.height,
        `"${c.profile.bmiFormatted}"`,
        `"${c.profile.bmiCategoryLabel}"`,
        c.riskFactors.length,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `pantas-rekap-pasien-${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => {
        setIsExporting(false);
      }, 600);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="p-12 text-center bg-white border border-pantas-border rounded-xl text-sm text-pantas-muted space-y-2">
        <div className="w-8 h-8 mx-auto border-2 border-pantas-primary border-t-transparent rounded-full animate-spin" />
        <p>Memverifikasi kredensial admin...</p>
      </div>
    );
  }

  // 2. Unauthorized View
  if (!user || !isAdmin) {
    return (
      <div className="space-y-6">
        <div className="border-b border-pantas-border pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-pantas-primary tracking-tight">
            Panel Akses Petugas & Admin
          </h1>
          <p className="text-sm text-pantas-muted mt-1 leading-relaxed">
            Halaman ini khusus untuk tenaga medis dan administrator Puskesmas Karangawen I.
          </p>
        </div>

        <div className="p-8 sm:p-10 bg-white border border-pantas-border rounded-xl text-center space-y-5 max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-full bg-pantas-amber-bg flex items-center justify-center text-pantas-amber border border-pantas-amber-border">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-pantas-dark">
              Akses Terbatas untuk Admin / Petugas Puskesmas
            </h2>
            <p className="text-sm text-pantas-muted leading-relaxed">
              {user
                ? `Akun Anda (${user.email}) belum terdaftar sebagai administrator sistem skrining kesehatan PANTAS.`
                : 'Silakan masuk menggunakan akun admin Puskesmas untuk dapat melihat dan merekap data pemeriksaan pasien.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {!user ? (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 bg-pantas-primary text-white font-semibold rounded-lg text-sm hover:bg-pantas-primary-hover shadow-xs transition-colors"
              >
                Masuk sebagai Admin
              </button>
            ) : (
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-2.5 bg-pantas-primary text-white font-semibold rounded-lg text-sm hover:bg-pantas-primary-hover shadow-xs transition-colors"
              >
                Kembali ke Beranda
              </Link>
            )}
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

  // 3. Authorized Admin Dashboard View
  return (
    <div className="space-y-6">
      {/* Official Admin Header */}
      <div className="bg-white p-4 sm:p-5 border border-pantas-border rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative w-10 h-11">
              <Image
                src="/images/logo-puskesmas.jpg"
                alt="Logo Puskesmas"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-purple-200">
              <Image
                src="/images/logo-karangawen.jpg"
                alt="Logo Puskesmas Karangawen I"
                fill
                sizes="36px"
                className="object-cover"
                priority
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-pantas-primary tracking-tight">
                Dashboard Admin Pasien
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-pantas-soft text-pantas-primary border border-pantas-border">
                Puskesmas Karangawen I
              </span>
            </div>
            <p className="text-xs text-pantas-muted mt-0.5">
              Rekapitulasi & Pemantauan Data Skrining Kesehatan Masyarakat (Hipertensi & Diabetes)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-pantas-muted hidden md:inline">
            Admin: <strong>{user.email}</strong>
          </span>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 border border-pantas-border rounded-lg text-xs font-semibold text-pantas-dark hover:bg-neutral-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Segarkan data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-xs">Segarkan</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-pantas-red-bg border border-pantas-red-border text-pantas-red text-xs sm:text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white border border-pantas-border rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-pantas-muted uppercase tracking-wider">
              Total Pemeriksaan
            </span>
            <Users className="w-4 h-4 text-pantas-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-pantas-dark">{stats.total}</div>
          <p className="text-[11px] text-pantas-muted mt-1">Data skrining tersimpan</p>
        </div>

        <div className="p-4 bg-white border border-pantas-border rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-pantas-muted uppercase tracking-wider">
              Skrining Diabetes
            </span>
            <Droplet className="w-4 h-4 text-pantas-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-pantas-dark">{stats.dmTotal}</div>
          <p className="text-[11px] text-pantas-muted mt-1">
            <span className="text-pantas-red font-semibold">{stats.dmHigh}</span> kasus rujukan tinggi
          </p>
        </div>

        <div className="p-4 bg-white border border-pantas-border rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-pantas-muted uppercase tracking-wider">
              Skrining Hipertensi
            </span>
            <Heart className="w-4 h-4 text-pantas-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-pantas-dark">{stats.htTotal}</div>
          <p className="text-[11px] text-pantas-muted mt-1">
            <span className="text-pantas-red font-semibold">{stats.htHigh}</span> kasus tensi tinggi
          </p>
        </div>

        <div className="p-4 bg-white border border-pantas-border rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-pantas-red uppercase tracking-wider">
              Perlu Kontrol Puskesmas
            </span>
            <AlertCircle className="w-4 h-4 text-pantas-red" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-pantas-red">{stats.highRiskTotal}</div>
          <p className="text-[11px] text-pantas-muted mt-1">
            {stats.attentionTotal} kasus berstatus perhatian
          </p>
        </div>
      </section>

      {/* Filter and Action Bar */}
      <section className="bg-white p-4 border border-pantas-border rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-pantas-muted absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID pemeriksaan, tanggal, atau nilai pengukuran..."
              className="w-full pl-9 pr-3 py-2 border border-pantas-border rounded-lg text-xs sm:text-sm text-pantas-dark focus:border-pantas-primary"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 border border-pantas-border rounded-lg text-xs font-semibold text-pantas-dark hover:bg-neutral-50 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-pantas-muted" />
              <span>Cetak Rekap</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={isExporting || filteredCheckups.length === 0}
              className="px-3.5 py-2 bg-pantas-primary text-white rounded-lg text-xs font-semibold hover:bg-pantas-primary-hover flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Mengekspor...' : 'Unduh CSV'}</span>
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-pantas-border/60">
          <span className="text-xs font-bold text-pantas-muted flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Tipe:</span>
          </span>
          <div className="flex items-center gap-1">
            {(['semua', 'diabetes', 'hipertensi'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-colors ${
                  filterType === t
                    ? 'bg-pantas-primary text-white'
                    : 'bg-pantas-bg text-pantas-muted hover:text-pantas-dark'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <span className="text-xs font-bold text-pantas-muted ml-2">Status:</span>
          <div className="flex items-center gap-1">
            {(['semua', 'tinggi', 'perhatian', 'normal'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-colors ${
                  filterStatus === s
                    ? 'bg-pantas-primary text-white'
                    : 'bg-pantas-bg text-pantas-muted hover:text-pantas-dark'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <span className="text-xs text-pantas-muted ml-auto font-medium">
            Menampilkan: <strong>{filteredCheckups.length}</strong> data
          </span>
        </div>
      </section>

      {/* Patient Records Table */}
      <section className="bg-white border border-pantas-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-pantas-soft/80 border-b border-pantas-border text-pantas-dark font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Waktu & Tanggal</th>
                <th className="py-3 px-4">Jenis Skrining</th>
                <th className="py-3 px-4">Hasil Pengukuran</th>
                <th className="py-3 px-4">Profil & IMT</th>
                <th className="py-3 px-4">Status Klinis</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pantas-border/70">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-pantas-muted">
                    Memuat catatan pasien dari database Supabase...
                  </td>
                </tr>
              ) : filteredCheckups.length > 0 ? (
                filteredCheckups.map((item, idx) => {
                  const isHigh = item.measurement.statusLevel === 'tinggi';
                  const isAttention = item.measurement.statusLevel === 'perhatian';

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 text-pantas-muted font-medium">{idx + 1}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-pantas-dark block leading-tight">
                          {formatDate(item.createdAt)}
                        </span>
                        <span className="text-[10px] text-pantas-muted font-mono block mt-0.5">
                          ID: {item.id.slice(0, 14)}...
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                            item.checkupType === 'diabetes'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {item.checkupType === 'diabetes' ? (
                            <Droplet className="w-3 h-3" />
                          ) : (
                            <Heart className="w-3 h-3" />
                          )}
                          <span>{item.checkupType}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-pantas-dark text-sm block">
                          {item.measurement.hasMeasurement
                            ? `${item.measurement.primaryValue} ${item.measurement.unit}`
                            : 'Belum ada data'}
                        </span>
                        <span className="text-[11px] text-pantas-muted block truncate max-w-[180px]">
                          {item.measurement.interpretation}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-pantas-dark block">
                          {item.profile.bmiFormatted} kg/m²
                        </span>
                        <span className="text-[11px] text-pantas-muted block">
                          {item.profile.age} th ({item.profile.gender === 'laki-laki' ? 'L' : 'P'}) — {item.profile.bmiCategoryLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                            isHigh
                              ? 'bg-pantas-red-bg text-pantas-red border border-pantas-red-border'
                              : isAttention
                              ? 'bg-pantas-amber-bg text-pantas-amber border border-pantas-amber-border'
                              : 'bg-pantas-soft text-pantas-primary border border-pantas-border'
                          }`}
                        >
                          {item.measurement.statusLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedCheckup(item)}
                          className="px-2.5 py-1 border border-pantas-border rounded-md text-xs font-semibold text-pantas-primary hover:bg-pantas-soft transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-pantas-muted">
                    Tidak ditemukan data pasien yang sesuai dengan filter atau kata kunci pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detail Modal View */}
      {selectedCheckup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-pantas-border shadow-xl space-y-4 p-5 sm:p-6 my-auto">
            <div className="flex items-center justify-between border-b border-pantas-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-pantas-primary" />
                <h3 className="text-base sm:text-lg font-bold text-pantas-dark">
                  Detail Pemeriksaan Pasien (ID: {selectedCheckup.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedCheckup(null)}
                className="p-1 rounded-lg text-pantas-muted hover:text-pantas-dark hover:bg-neutral-100"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ResultView
              result={selectedCheckup}
              onReset={() => setSelectedCheckup(null)}
              isSavedInitial={true}
            />

            <div className="flex justify-end pt-2 border-t border-pantas-border">
              <button
                onClick={() => setSelectedCheckup(null)}
                className="px-4 py-2 bg-pantas-primary text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-pantas-primary-hover"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
