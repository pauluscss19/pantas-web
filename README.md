# PANTAS — Pemantauan Hipertensi dan Diabetes

Aplikasi web kesehatan masyarakat yang dirancang khusus untuk membantu masyarakat Indonesia memantau faktor risiko, mencatat hasil pengukuran mandiri (gula darah dan tekanan darah), memahami interpretasi awal secara transparan, serta mengakses panduan edukasi gaya hidup sehat.

---

## 🌟 Fitur Utama

1. **Pemeriksaan Awal Tanpa Login:**
   - Pengguna umum dapat langsung mengisi data tubuh, menilai kebiasaan, dan mendapatkan hasil evaluasi awal tanpa hambatan login.
   - Pilihan pemeriksaan spesifik: **Diabetes Melitus** dan **Hipertensi**.

2. **Formulir Bertahap yang Nyaman & Aman:**
   - Tahapan: *Data Diri → Kebiasaan & Riwayat → Hasil Pengukuran → Ringkasan & Konfirmasi*.
   - Kalkulasi otomatis Indeks Massa Tubuh (IMT) sesuai standar Kemenkes RI, mendukung format desimal koma Indonesia (misal `65,5`).
   - Isian tersimpan selama sesi pemeriksaan; pengguna dapat leluasa berpindah langkah tanpa kehilangan data.

3. **Aturan Evaluasi Klinis Transparan (Non-AI / Non-Black-Box):**
   - Berdasarkan konsensus resmi **PERKENI 2021** (Diabetes) dan **PERHI 2021** (Hipertensi).
   - Membedakan tes Gula Darah Puasa (GDP) dan Gula Darah Sewaktu (GDS).
   - Mendeteksi kriteria sistolik atau diastolik tinggi secara terpisah ($\ge 140$ atau $\ge 90$ mmHg).
   - Penanganan khusus hipoglikemia ($< 70$ mg/dL) sebagai hasil rendah, bukan normal.

4. **Tanda Bahaya Medis (Red Flags):**
   - Mendeteksi kondisi darurat (krisis hipertensi $\ge 180 / 120$ mmHg, hipoglikemia, nyeri dada, sesak napas) dan memprioritaskan arahan segera ke IGD/Puskesmas.

5. **Pusat Edukasi Kesehatan Masyarakat:**
   - Materi praktis berdasar pedoman Kemenkes: CERDIK, Prinsip Makan 3J, Pembatasan Gula-Garam-Lemak (GGL G4-G1-L5), Aktivitas Fisik 150 menit, Perawatan Kaki Diabetes, dan Kepatuhan Obat.
   - Menggunakan contoh masakan lokal (nasi putih, tempe, lalapan, gorengan, kerupuk, sayur bening).

6. **Penyimpanan Fleksibel & Privasi Ketat:**
   - **Mode Tamu (Offline / Lokal):** Menggunakan **IndexedDB** browser pengguna. Tanpa pelacak pihak ketiga dan tanpa meminta NIK/data pribadi.
   - **Mode Online Cloud:** Menggunakan **Supabase Auth** & **Supabase PostgreSQL** dengan **Row Level Security (RLS)** ketat agar pengguna hanya dapat membaca, menyimpan, mengubah, dan menghapus data miliknya sendiri.

7. **Grafik Tren Perkembangan (Recharts):**
   - Grafik tren tekanan darah sistolik dan diastolik dengan garis ambang rujukan.
   - Grafik tren glukosa darah yang **memisahkan GDP dan GDS** secara tegas agar tidak disalahartikan.

8. **Cetak & Ekspor Ringkasan:**
   - Tampilan cetak rapi (*print stylesheet*) untuk dibawa saat konsultasi ke Puskesmas atau dokter keluarga.

9. **Mode Demo (Data Contoh):**
   - Data contoh hanya muncul jika pengguna sengaja mengaktifkan *Mode Demo* dengan label yang jelas.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) & TypeScript
- **Styling:** Tailwind CSS (Palet dirancang khusus: Putih Gading `#F7F8F3`, Hijau Tua `#244B3B`, Hijau Lembut `#E7EEE7`, Teks Gelap `#202923`)
- **Icons:** Lucide React
- **Grafik:** Recharts
- **Penyimpanan Lokal:** IndexedDB (`idb`)
- **Database & Auth:** Supabase PostgreSQL & Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`)
- **Pengujian:** TSX / Node Test Runner
- **Target Deployment:** Vercel

---

## 📂 Struktur Proyek

```
pantas/
├── public/                     # Aset statis & favicon
├── src/
│   ├── app/
│   │   ├── edukasi/            # Halaman daftar edukasi
│   │   │   └── [id]/           # Halaman pembaca artikel edukasi
│   │   ├── pemeriksaan/        # Alur pemeriksaan mandiri bertahap
│   │   ├── riwayat/            # Riwayat pemeriksaan & grafik tren
│   │   │   └── [id]/           # Detail hasil pemeriksaan
│   │   ├── globals.css         # Styling tema, tipografi, & print media
│   │   ├── layout.tsx          # Root layout aplikasi
│   │   └── page.tsx            # Beranda utama PANTAS
│   ├── components/
│   │   ├── auth/               # AuthContext, AuthModal (Supabase)
│   │   ├── checkup/            # CheckupWizard, ResultView
│   │   ├── history/            # TrendCharts (Recharts GDP, GDS, Tensi)
│   │   └── layout/             # AppLayout (Sidebar desktop & Bottom nav ponsel)
│   └── lib/
│       ├── education/          # Konten edukasi klinis lengkap
│       ├── rules/              # Aturan BMI, Diabetes, Hipertensi
│       ├── storage/            # Adapter IndexedDB untuk penyimpanan lokal
│       ├── supabase/           # Supabase browser client, server client, repository
│       └── types.ts            # Type definitions TypeScript
├── supabase/
│   └── schema.sql              # Skrip migrasi SQL & kebijakan akses RLS
├── tests/
│   ├── rules.test.ts           # Pengujian batas klinis & edge cases
│   └── rls-simulation.test.ts  # Pengujian isolasi multi-akun Row Level Security
├── .env.example                # Contoh environment variables
├── CLINICAL_RULES_AND_SOURCES.md # Dokumentasi aturan medis & keputusan implementasi
├── VERCEL_DEPLOYMENT.md        # Panduan deployment ke Vercel
└── README.md
```

---

## 🚀 Cara Menjalankan Secara Lokal

### 1. Kloning dan Masuk ke Folder Proyek
```bash
cd pantas
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables (Opsional untuk Sinkronisasi Cloud)
Salin berkas `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Isi dengan kredensial proyek Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://proyek-anda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```
*(Jika tidak diisi, aplikasi otomatis berjalan dalam Mode Tamu / IndexedDB lokal).*

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 5. Menjalankan Pengujian Otomatis
```bash
npm test
```
Perintah ini akan menjalankan 18 pengujian aturan klinis serta simulasi pembatasan akses data multi-akun (RLS).

### 6. Membangun Aplikasi untuk Produksi
```bash
npm run build
npm start
```

---

## 🔒 Kebijakan Database & Row Level Security (RLS)

Seluruh data online pada tabel `checkups` dilindungi oleh **Row Level Security**:
- **SELECT:** `USING (auth.uid() = user_id)`
- **INSERT:** `WITH CHECK (auth.uid() = user_id)`
- **UPDATE:** `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
- **DELETE:** `USING (auth.uid() = user_id)`

Skrip migrasi SQL lengkap dapat ditemukan pada berkas [`supabase/schema.sql`](supabase/schema.sql).

---

## 📄 Dokumentasi Tambahan

- [Dokumentasi Aturan Klinis & Sumber Medis](CLINICAL_RULES_AND_SOURCES.md)
- [Panduan Deployment Vercel](VERCEL_DEPLOYMENT.md)
