'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EvaluationResult } from '@/lib/types';
import { getLocalCheckupById } from '@/lib/storage/indexedDb';
import { useAuth } from '@/components/auth/AuthContext';
import { getRemoteCheckups } from '@/lib/supabase/repository';
import { ResultView } from '@/components/checkup/ResultView';

export default function CheckupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [item, setItem] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItem() {
      if (!id) return;
      setLoading(true);
      try {
        if (user) {
          const remoteList = await getRemoteCheckups(user.id);
          const foundRemote = remoteList.find((c) => c.id === id);
          if (foundRemote) {
            setItem(foundRemote);
            setLoading(false);
            return;
          }
        }

        const local = await getLocalCheckupById(id);
        setItem(local);
      } catch (err) {
        console.error('Failed to load checkup detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id, user]);

  if (loading) {
    return (
      <div className="p-8 text-center bg-white border border-pantas-border rounded-lg text-sm text-pantas-muted">
        Memuat detail hasil pemeriksaan...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-8 text-center bg-white border border-pantas-border rounded-lg space-y-3">
        <h2 className="text-base font-bold text-pantas-dark">Hasil Pemeriksaan Tidak Ditemukan</h2>
        <p className="text-xs text-pantas-muted">
          Catatan pemeriksaan dengan ID ini mungkin sudah dihapus atau tidak tersimpan di perangkat ini.
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

