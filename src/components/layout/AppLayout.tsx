'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Activity,
  History,
  BookOpen,
  User as UserIcon,
  LogOut,
  Cloud,
  HardDrive,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { AuthModal } from '../auth/AuthModal';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
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

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-pantas-bg text-pantas-dark flex flex-col md:flex-row">
      {/* DESKTOP: Slim Side Navigation */}
      <aside className="hidden md:flex md:w-64 flex-col justify-between border-r border-pantas-border bg-white p-5 shrink-0 min-h-screen sticky top-0">
        <div>
          {/* Brand */}
          <Link href="/" className="block mb-8 group">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded bg-pantas-primary flex items-center justify-center text-white font-bold text-lg tracking-wider">
                P
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-pantas-primary block leading-none">
                  PANTAS
                </span>
                <span className="text-xs text-pantas-muted block mt-1">
                  Hipertensi & Diabetes
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Navigasi Utama Desktop">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-sm font-medium transition-colors ${
                    active
                      ? 'bg-pantas-soft text-pantas-primary font-semibold'
                      : 'text-pantas-muted hover:text-pantas-dark hover:bg-neutral-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-pantas-primary' : 'text-pantas-muted'}`} />
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
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-pantas-primary truncate">Akun Cloud Aktif</p>
                  <p className="text-xs text-pantas-muted truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-pantas-border rounded text-xs font-medium text-pantas-muted hover:text-pantas-red hover:border-pantas-red-border hover:bg-pantas-red-bg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <HardDrive className="w-4 h-4 text-pantas-muted shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-pantas-dark">Mode Tamu (Lokal)</p>
                  <p className="text-[11px] text-pantas-muted">Disimpan di perangkat ini</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setAuthModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-pantas-primary text-white rounded text-xs font-medium hover:bg-pantas-primary-hover transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Masuk / Sinkron Cloud</span>
              </button>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-pantas-border/60 flex items-center gap-1 text-[11px] text-pantas-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-pantas-primary shrink-0" />
            <span>Privasi terjaga, tanpa pelacak</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-pantas-border sticky top-0 z-30">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-pantas-primary flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-pantas-primary">PANTAS</span>
              <span className="text-[10px] text-pantas-muted block -mt-0.5">Pemantauan Hipertensi & Diabetes</span>
            </div>
          </Link>

          <div>
            {user ? (
              <button
                onClick={() => signOut()}
                className="p-1.5 text-xs text-pantas-muted border border-pantas-border rounded flex items-center gap-1"
                title="Keluar"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="sr-only">Keluar</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setAuthModalOpen(true);
                }}
                className="px-2.5 py-1 text-xs font-medium bg-pantas-primary text-white rounded"
              >
                Masuk
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* MOBILE: Bottom Navigation (4 items) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-pantas-border flex items-center justify-around py-2 px-1 safe-area-bottom"
        aria-label="Navigasi Utama Ponsel"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded text-center transition-colors ${
                active ? 'text-pantas-primary font-semibold' : 'text-pantas-muted'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-pantas-primary' : 'text-pantas-muted'}`} />
              <span className="text-[11px] mt-1 leading-none">{item.name}</span>
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

