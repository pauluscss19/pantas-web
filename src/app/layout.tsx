import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'PANTAS — Pemantauan Hipertensi dan Diabetes',
  description:
    'Aplikasi pemantauan kesehatan mandiri untuk menilai faktor risiko dan mencatat hasil pemeriksaan gula darah dan tekanan darah masyarakat Indonesia.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-pantas-bg text-pantas-dark antialiased">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
