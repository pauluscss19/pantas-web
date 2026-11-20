'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  Activity,
  History,
  BookOpen,
  User as UserIcon,
  LogOut,
  Cloud,
  ShieldCheck,
  Lock,
  Users,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import { isAdminUser } from '@/lib/auth/admin';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { name: 'Beranda', href: '/', icon: Home },
  { name: 'Pemeriksaan', href: '/pemeriksaan', icon: Activity },
  { name: 'Riwayat', href: '/riwayat', icon: History },
  { name: 'Edukasi', href: '/edukasi', icon: BookOpen },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const isAdmin = useMemo(() => {
    return isAdminUser(user?.email, user?.user_metadata);
  }, [user]);

  const navItems = useMemo(() => {
    if (isAdmin) {
      return [
        ...BASE_NAV_ITEMS,
        { name: 'Data Pasien', href: '/admin', icon: Users },
      ];
    }
    return BASE_NAV_ITEMS;
  }, [isAdmin]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-pantas-bg text-pantas-dark flex flex-col md:flex-row antialiased">
      {/* DESKTOP: Slim Side Navigation */}
      <aside className="hidden md:flex md:w-64 flex-col justify-between border-r border-pantas-border bg-white p-5 shrink-0 min-h-screen sticky top-0 shadow-xs">
        <div>
          {/* Brand with Puskesmas Logos */}
          <Link href="/" className="block mb-6 group">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="relative w-9 h-10">
                  <Image
                    src="/images/logo-puskesmas.jpg"
                    alt="Logo Puskesmas"
                    fill
                    sizes="36px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-purple-200 shadow-xs">
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
              <div className="min-w-0">
                <span className="font-bold text-lg tracking-tight text-pantas-primary block leading-none group-hover:text-pantas-primary-hover transition-colors">
                  PANTAS
                </span>
                <span className="text-xs font-semibold text-pantas-dark block mt-1 truncate">
                  Puskesmas Karangawen I
                </span>
                <span className="text-[10px] text-pantas-muted block truncate">
                  Kabupaten Demak
                </span>
              </div>
            </div>
          </Link>

          {/* Subtitle badge */}
          <div className="mb-5 px-3 py-1.5 bg-pantas-soft rounded text-[11px] font-medium text-pantas-primary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pantas-primary animate-pulse" />
            <span>Skrining Hipertensi & Diabetes</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Navigasi Utama Desktop">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              const isSpecialAdmin = item.href === '/admin';

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? isSpecialAdmin
                        ? 'bg-purple-100 text-purple-900 font-bold shadow-2xs'
                        : 'bg-pantas-soft text-pantas-primary font-semibold shadow-2xs'
                      : isSpecialAdmin
                      ? 'text-purple-700 hover:bg-purple-50 hover:text-purple-900 font-semibold'
                      : 'text-pantas-muted hover:text-pantas-dark hover:bg-neutral-50'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      active
                        ? isSpecialAdmin
                          ? 'text-purple-800 stroke-[2.4]'
                          : 'text-pantas-primary stroke-[2.3]'
                        : isSpecialAdmin
                        ? 'text-purple-600'
                        : 'text-pantas-muted'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account / Storage Info */}
        <div className="pt-4 border-t border-pantas-border">
          {user ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <Cloud className="w-4 h-4 text-pantas-primary shrink-0" />
                <div className="overflow-hidden min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-pantas-primary truncate">Akun Aktif</p>
                    {isAdmin && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-pantas-purple text-white shrink-0">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-pantas-muted truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-pantas-border rounded-lg text-xs font-medium text-pantas-muted hover:text-pantas-red hover:border-pantas-red-border hover:bg-pantas-red-bg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <Lock className="w-4 h-4 text-pantas-muted shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-pantas-dark">Mode Tanpa Login</p>
                  <p className="text-[11px] text-pantas-muted">Login untuk simpan riwayat</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setAuthModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-pantas-primary text-white rounded-lg text-xs font-medium hover:bg-pantas-primary-hover transition-colors shadow-2xs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Masuk / Buat Akun</span>
              </button>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-pantas-border/60 flex items-center gap-1 text-[11px] text-pantas-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-pantas-primary shrink-0" />
            <span>Terlindungi Row Level Security</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        {/* Mobile Top Header (Optimized for small screens) */}
        <header className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-pantas-border sticky top-0 z-30 shadow-2xs">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1 shrink-0">
              <div className="relative w-7 h-8">
                <Image
                  src="/images/logo-puskesmas.jpg"
                  alt="Logo Puskesmas"
                  fill
                  sizes="28px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-purple-200">
                <Image
                  src="/images/logo-karangawen.jpg"
                  alt="Logo Puskesmas Karangawen I"
                  fill
                  sizes="28px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm tracking-tight text-pantas-primary block leading-none">
                PANTAS
              </span>
              <span className="text-[10px] text-pantas-muted block truncate mt-0.5">
                Puskesmas Karangawen I
              </span>
            </div>
          </Link>

          <div className="shrink-0 ml-2 flex items-center gap-1.5">
            {isAdmin && (
              <Link
                href="/admin"
                className="px-2 py-1 text-xs font-semibold bg-pantas-purple text-white rounded flex items-center gap-1 shadow-2xs hover:bg-pantas-purple-hover"
                title="Panel Data Pasien"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="text-[11px]">Admin</span>
              </Link>
            )}

            {user ? (
              <button
                onClick={() => signOut()}
                className="px-2 py-1 text-xs text-pantas-muted border border-pantas-border rounded flex items-center gap-1 hover:bg-neutral-50"
                title="Keluar"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-[11px]">Keluar</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setAuthModalOpen(true);
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-pantas-primary text-white rounded hover:bg-pantas-primary-hover shadow-2xs"
              >
                Masuk
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* MOBILE: Bottom Navigation (Touch-friendly & Safe-area padded) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs border-t border-pantas-border flex items-center justify-around py-1 px-1 safe-area-bottom shadow-lg"
        aria-label="Navigasi Utama Ponsel"
      >
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const isSpecialAdmin = item.href === '/admin';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-1.5 rounded-lg text-center transition-all min-w-[56px] min-h-[48px] ${
                active
                  ? isSpecialAdmin
                    ? 'text-purple-800 font-bold bg-purple-100'
                    : 'text-pantas-primary font-bold bg-pantas-soft/60'
                  : isSpecialAdmin
                  ? 'text-purple-700'
                  : 'text-pantas-muted hover:text-pantas-dark'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  active
                    ? isSpecialAdmin
                      ? 'text-purple-800 stroke-[2.4]'
                      : 'text-pantas-primary stroke-[2.3]'
                    : isSpecialAdmin
                    ? 'text-purple-600'
                    : 'text-pantas-muted'
                }`}
              />
              <span className="text-[10px] mt-1 leading-none">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
