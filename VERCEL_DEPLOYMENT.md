# Panduan Deployment Vercel & Konfigurasi Supabase — PANTAS

Dokumen ini memandu langkah-langkah men-deploy aplikasi **PANTAS (Pemantauan Hipertensi dan Diabetes)** ke platform **Vercel** dengan database **Supabase PostgreSQL** dan autentikasi **Supabase Auth**.

---

## 1. Persiapan Proyek di Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan buat proyek baru (*New Project*).
2. Catat kredensial proyek dari menu **Project Settings -> API**:
   - **Project URL** (contoh: `https://xyzcompany.supabase.co`)
   - **anon / public key** (kunci publik aman untuk browser)
   - **service_role key** (kunci rahasia server, **JANGAN** pernah diekspos ke client!)
3. Buka menu **SQL Editor** di Supabase Dashboard.
4. Salin seluruh isi berkas `supabase/schema.sql` pada proyek ini, lalu klik **Run**.
   - Skrip ini akan membuat tabel `public.checkups`, indeks performa, mengaktifkan **Row Level Security (RLS)**, serta menerapkan 4 kebijakan akses ketat (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) berbasis `auth.uid() = user_id`.

---

## 2. Pengaturan Environment Variables di Vercel

Pada dashboard proyek Anda di Vercel, masuk ke **Settings -> Environment Variables** dan tambahkan variabel berikut:

| Nama Variabel | Nilai Contoh | Keterangan & Lingkup |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xyzcompany.supabase.co` | **Public** (Production, Preview, Development) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | **Public** (Production, Preview, Development) |
| `SUPABASE_SERVICE_ROLE_KEY` *(Opsional/Server Only)* | `eyJhbGciOi...` | **Secret Server Only** (Hanya jika ada background job/admin route). Jangan tambahkan prefix `NEXT_PUBLIC_`! |

> [!IMPORTANT]
> **Prinsip Keamanan Secret Key:**
> Hanya variabel dengan awalan `NEXT_PUBLIC_` yang dapat diakses oleh browser. Kunci `service_role` memiliki bypass RLS dan tidak boleh memiliki awalan `NEXT_PUBLIC_` agar tidak bocor ke bundle JavaScript browser.

---

## 3. Langkah Deploy ke Vercel

### Opsi A: Menghubungkan Repository Git (Direkomendasikan)
1. Push kode Anda ke GitHub, GitLab, atau Bitbucket:
   ```bash
   git add .
   git commit -m "feat: release PANTAS app"
   git push origin main
   ```
2. Di Vercel Dashboard, klik **Add New... -> Project**, lalu impor repositori Anda.
3. Pastikan Framework Preset terdeteksi sebagai **Next.js**.
4. Masukkan environment variables seperti pada tabel di atas.
5. Klik tombol **Deploy**.

### Opsi B: Menggunakan Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
# Untuk production build:
vercel --prod
```

---

## 4. Konfigurasi URL Autentikasi di Supabase

Agar pengalihan email verifikasi dan reset password Supabase Auth bekerja pada domain Vercel:
1. Di Supabase Dashboard, buka **Authentication -> URL Configuration**.
2. Masukkan URL deployment Vercel Anda (misal: `https://pantas-app.vercel.app`) pada **Site URL**.
3. Tambahkan `https://pantas-app.vercel.app/**` pada **Redirect URLs**.

---

## 5. Mode Tanpa Login & Fallback Offline

Aplikasi PANTAS dirancang adaptif:
- Jika environment variables Supabase belum diisi, aplikasi **tetap dapat digunakan 100% fungsional** dalam **Mode Tamu (Penyimpanan Lokal / IndexedDB)**.
- Ketika pengguna ingin menyimpan riwayat online atau mengakses dari perangkat berbeda, mereka dapat masuk ke akun yang terhubung ke Supabase.

