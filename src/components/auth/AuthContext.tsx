'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>;
  signUp: (email: string, pass: string) => Promise<{ error: string | null; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  signIn: async () => ({ error: 'Auth belum diatur' }),
  signUp: async () => ({ error: 'Auth belum diatur' }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = async (email: string, pass: string) => {
    if (!configured) {
      return { error: 'Koneksi Supabase belum dikonfigurasi di file environment.' };
    }
    const supabase = createClient();
    if (!supabase) return { error: 'Gagal inisialisasi Supabase client.' };

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  const signUp = async (email: string, pass: string) => {
    if (!configured) {
      return { error: 'Koneksi Supabase belum dikonfigurasi di file environment.' };
    }
    const supabase = createClient();
    if (!supabase) return { error: 'Gagal inisialisasi Supabase client.' };

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
    });
    if (error) {
      return { error: error.message };
    }
    return {
      error: null,
      message: data.user && data.session
        ? 'Pendaftaran berhasil dan Anda telah masuk!'
        : 'Pendaftaran berhasil. Silakan periksa email Anda untuk verifikasi bila diperlukan.',
    };
  };

  const signOut = async () => {
    if (!configured) {
      setUser(null);
      return;
    }
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

