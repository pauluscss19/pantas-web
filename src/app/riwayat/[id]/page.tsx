'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, LogIn } from 'lucide-react';
import { EvaluationResult } from '@/lib/types';
import { useAuth } from '@/components/auth/AuthContext';
import { getRemoteCheckups } from '@/lib/supabase/repository';
import { ResultView } from '@/components/checkup/ResultView';
import { AuthModal } from '@/components/auth/AuthModal';

export default function CheckupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const id = params.id as string;

  const [item, setItem] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    async function loadItem() {
      if (!id || authLoading) return;
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const remoteList = await getRemoteCheckups(user.id);
        const found = remoteList.find((c) => c.id === id);
        setItem(found || null);
      } catch (err) {
        console.error('Failed to load checkup detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="p-8 text-center bg-white border border-pantas-border rounded-lg text-sm text-pantas-muted">
        Memuat detail hasil pemeriksaan...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 sm:p-10 bg-white border border-pantas-border rounded-lg text-center space-y-4 max-w-md mx-auto shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-full bg-pantas-soft flex items-center justify-center text-pantas-primary">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-pantas-dark">Akses Riwayat Memerlukan Login</h2>
        <p className="text-xs text-pantas-muted leading-relaxed">
          Silakan masuk ke akun PANTAS Anda untuk melihat detail pemeriksaan ini.
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="px-5 py-2.5 bg-pantas-primary text-white rounded text-xs font-semibold hover:bg-pantas-primary-hover inline-flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Masuk ke Akun</span>
        </button>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-8 text-center bg-white border border-pantas-border rounded-lg space-y-3">
        <h2 className="text-base font-bold text-pantas-dark">Hasil Pemeriksaan Tidak Ditemukan</h2>
        <p className="text-xs text-pantas-muted">
          Catatan pemeriksaan dengan ID ini mungkin sudah dihapus atau tidak terdaftar pada akun Anda.
        </p>
        <div className="pt-2">
          <Link
            href="/riwayat"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-pantas-primary text-white rounded text-xs font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Riwayat</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print border-b border-pantas-border pb-3">
        <Link
          href="/riwayat"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-pantas-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Riwayat</span>
        </Link>
        <span className="text-xs text-pantas-muted">ID: {item.id}</span>
      </div>

      <ResultView result={item} onReset={() => router.push('/pemeriksaan')} isSavedInitial={true} />
    </div>
  );
}
