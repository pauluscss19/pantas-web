'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { X, Lock, Mail, AlertCircle, CheckCircle2, Cloud } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'signin' }: AuthModalProps) {
  const { signIn, signUp, isConfigured } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Mohon isi email dan kata sandi dengan lengkap.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg('Berhasil masuk.');
          setTimeout(() => {
            onClose();
            onSuccess?.();
          }, 800);
        }
      } else {
        const res = await signUp(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg(res.message || 'Pendaftaran berhasil!');
          setTimeout(() => {
            onClose();
            onSuccess?.();
          }, 1200);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan tidak terduga.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md bg-white rounded-lg shadow-lg border border-pantas-border overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-pantas-soft border-b border-pantas-border">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-pantas-primary" />
            <h2 id="auth-modal-title" className="text-lg font-semibold text-pantas-dark">
              {mode === 'signin' ? 'Masuk ke Akun PANTAS' : 'Buat Akun Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-pantas-muted hover:text-pantas-dark rounded transition-colors"
            aria-label="Tutup jendela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isConfigured ? (
            <div className="p-4 bg-pantas-amber-bg border border-pantas-amber-border rounded text-sm text-pantas-dark">
              <div className="flex items-start gap-2 mb-2 font-medium text-pantas-amber">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Koneksi Supabase Belum Dikonfigurasi</span>
              </div>
              <p className="mb-2">
                Aplikasi sedang berjalan dalam <strong>Mode Tamu (Penyimpanan Lokal / IndexedDB)</strong>. Seluruh fitur pemeriksaan dan edukasi tetap dapat digunakan secara penuh.
              </p>
              <p className="text-xs text-pantas-muted">
                Untuk mengaktifkan sinkronisasi cloud, masukkan <code>NEXT_PUBLIC_SUPABASE_URL</code> dan <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> pada pengaturan environment.
              </p>
              <button
                onClick={onClose}
                className="mt-4 w-full py-2 bg-pantas-primary text-white rounded font-medium text-sm hover:bg-pantas-primary-hover"
              >
                Tetap Lanjut dalam Mode Tamu
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-pantas-muted mb-4">
                {mode === 'signin'
                  ? 'Masuk untuk mengakses riwayat pemeriksaan kesehatan Anda yang tersimpan di server cloud terenkripsi.'
                  : 'Daftarkan email Anda untuk menyimpan dan memantau riwayat kesehatan secara aman dari berbagai perangkat.'}
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 bg-pantas-red-bg border border-pantas-red-border text-pantas-red text-sm rounded flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 bg-pantas-soft border border-pantas-primary text-pantas-primary text-sm rounded flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="auth-email" className="block text-sm font-medium text-pantas-dark mb-1">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-pantas-muted absolute left-3 top-3" />
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      required
                      className="w-full pl-9 pr-3 py-2 border border-pantas-border rounded text-sm text-pantas-dark focus:border-pantas-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-password" className="block text-sm font-medium text-pantas-dark mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-pantas-muted absolute left-3 top-3" />
                    <input
                      id="auth-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      required
                      className="w-full pl-9 pr-3 py-2 border border-pantas-border rounded text-sm text-pantas-dark focus:border-pantas-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-pantas-primary text-white font-medium rounded hover:bg-pantas-primary-hover disabled:opacity-50 text-sm transition-colors"
                >
                  {isSubmitting
                    ? 'Memproses...'
                    : mode === 'signin'
                    ? 'Masuk ke Akun'
                    : 'Daftar Sekarang'}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-pantas-border text-center text-sm">
                {mode === 'signin' ? (
                  <p className="text-pantas-muted">
                    Belum memiliki akun?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setErrorMsg(null);
                      }}
                      className="text-pantas-primary font-medium hover:underline"
                    >
                      Daftar di sini
                    </button>
                  </p>
                ) : (
                  <p className="text-pantas-muted">
                    Sudah memiliki akun?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setErrorMsg(null);
                      }}
                      className="text-pantas-primary font-medium hover:underline"
                    >
                      Masuk di sini
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

