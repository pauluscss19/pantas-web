# Rancangan Flowchart Aplikasi PANTAS

Dokumen ini memuat diagram alur (flowchart) terstruktur untuk aplikasi **PANTAS (Pemantauan Hipertensi dan Diabetes)**. Diagram menggunakan notasi Mermaid standar yang dapat langsung dirender di GitHub, VS Code, maupun viewer Markdown.

---

## 1. Flowchart Alur Pengguna Utama (Main User Journey)

Diagram ini menggambarkan alur kerja pengguna dari saat pertama kali membuka aplikasi hingga melihat hasil dan memilih mekanisme penyimpanan data.

```mermaid
flowchart TD
    Start(["Mulai: Pengguna Membuka PANTAS"]) --> Home["Halaman Beranda"]
    
    Home --> Choice{"Pilih Menu Utama"}
    Choice -->|"Akses Langsung Tanpa Login"| Edukasi["Pusat Edukasi Kesehatan"]
    Choice -->|"Lihat Catatan"| Riwayat["Halaman Riwayat & Grafik Tren"]
    Choice -->|"Mulai Skrining"| TypeChoice{"Pilih Jenis Pemeriksaan"}
    
    TypeChoice -->|"Diabetes"| DM_Flow["Formulir Pemeriksaan Diabetes"]
    TypeChoice -->|"Hipertensi"| HT_Flow["Formulir Pemeriksaan Hipertensi"]
    
    DM_Flow --> Step1["Langkah 1: Data Diri & Hitung IMT Otomatis"]
    HT_Flow --> Step1
    
    Step1 --> Step2["Langkah 2: Kebiasaan, Riwayat Keluarga & Keluhan"]
    Step2 --> Step3["Langkah 3: Pengukuran Lab / Tensimeter (Opsional)"]
    Step3 --> Step4["Langkah 4: Ringkasan & Konfirmasi Isian"]
    
    Step4 --> Engine["Mesin Evaluasi Aturan Klinis (Non-AI)"]
    
    Engine --> CheckRedFlag{"Apakah Ada Tanda Bahaya Medis?"}
    CheckRedFlag -->|"Ya"| RedFlagView["Prioritaskan Arahan Medis Darurat IGD/Puskesmas"]
    CheckRedFlag -->|"Tidak"| StandardView["Tampilkan Hasil Pengukuran & Faktor Risiko"]
    
    RedFlagView --> ActionChoice{"Tindakan Pengguna di Halaman Hasil"}
    StandardView --> ActionChoice
    
    ActionChoice -->|"Cetak / Simpan PDF"| PrintDoc["Cetak Ringkasan (Print Layout)"]
    ActionChoice -->|"Baca Edukasi Terkait"| ReadArticle["Buka Artikel Edukasi Terkait"]
    ActionChoice -->|"Simpan Hasil"| SaveChoice{"Status Autentikasi Pengguna"}
    
    SaveChoice -->|"Belum Login (Mode Tamu)"| SaveLocal["Simpan ke IndexedDB (Lokal Browser)"]
    SaveChoice -->|"Sudah Login (Cloud)"| SaveCloud["Simpan ke Supabase PostgreSQL (RLS Protected)"]
    
    SaveLocal --> Finish(["Selesai / Mulai Pemeriksaan Baru"])
    SaveCloud --> Finish
    PrintDoc --> Finish
    ReadArticle --> Finish
```

---

## 2. Flowchart Logika Pemeriksaan Diabetes Melitus

Diagram ini memetakan logika evaluasi klinis diabetes berdasarkan konsensus resmi PERKENI dan Kemenkes RI, termasuk pemisahan tes GDP vs GDS, konfirmasi puasa 8 jam, dan penanganan hipoglikemia.

```mermaid
flowchart TD
    StartDM(["Mulai Skrining Diabetes"]) --> InputProfile["Input Umur, Jenis Kelamin, Berat (kg), Tinggi (cm)"]
    InputProfile --> CalcBMI["Hitung IMT = BB / TB^2 (Kurus, Normal, Berlebih, Obesitas)"]
    
    CalcBMI --> InputHabits["Input: Riwayat Keluarga, Konsumsi Manis, Aktivitas Fisik 150m, Gejala"]
    InputHabits --> CheckTested{"Apakah Pernah Tes Gula Darah?"}
    
    CheckTested -->|"Belum Pernah"| NoLab["Status: Belum Ada Data Lab"]
    NoLab --> LifestyleRisk["Evaluasi Faktor Risiko Kebiasaan & Gejala (Tanpa Skor Palsu)"]
    LifestyleRisk --> OutResultDM["Hasilkan Ringkasan & Rekomendasi Tes Lab"]
    
    CheckTested -->|"Pernah"| SelectType{"Jenis Pemeriksaan Glukosa"}
    
    SelectType -->|"Gula Darah Puasa (GDP)"| CheckFasting{"Apakah Puasa Kalori Minimal 8 Jam?"}
    CheckFasting -->|"Tidak / Belum"| InvalidGDP["Interpretasi GDP Ditolak: Syarat Puasa Belum Terpenuhi"]
    InvalidGDP --> OutResultDM
    
    CheckFasting -->|"Ya, Terkonfirmasi"| EvalGDP{"Nilai GDP (mg/dL)"}
    EvalGDP -->|"< 70"| HypoDM["Status: RENDAH (Hipoglikemia) - Tanda Bahaya"]
    EvalGDP -->|"70 - 99"| NormalGDP["Status: Rentang Rujukan Puasa Normal"]
    EvalGDP -->|"100 - 125"| Prediabetes["Status: PERHATIAN (Glukosa Puasa Terganggu / Prediabetes)"]
    EvalGDP -->|">= 126"| HighGDP["Status: TINGGI (Perlu Evaluasi Dokter & Konfirmasi)"]
    
    SelectType -->|"Gula Darah Sewaktu (GDS)"| EvalGDS{"Nilai GDS (mg/dL)"}
    EvalGDS -->|"< 70"| HypoDM
    EvalGDS -->|"70 - 199"| CautionGDS["Status: Di Bawah 200 (Tidak Otomatis Bebas Diabetes)"]
    EvalGDS -->|">= 200"| HighGDS["Status: TINGGI (Perlu Evaluasi Dokter Jika Disertai Gejala)"]
    
    HypoDM --> OutResultDM
    NormalGDP --> OutResultDM
    Prediabetes --> OutResultDM
    HighGDP --> OutResultDM
    CautionGDS --> OutResultDM
    HighGDS --> OutResultDM
    
    OutResultDM --> RedFlagCheck{"Keluhan Akut: Lemas Hebat, Gemetar, Keringat Dingin, Muntah/Napas Cepat?"}
    RedFlagCheck -->|"Ya"| AlertEmergency["Tampilkan Peringatan Tanda Bahaya Medis di Urutan Teratas"]
    RedFlagCheck -->|"Tidak"| FinalViewDM["Tampilkan Hasil, Faktor Risiko, dan Edukasi 3J/GGL"]
```

---

## 3. Flowchart Logika Pemeriksaan Hipertensi

Diagram ini memetakan evaluasi tekanan darah berdasarkan Konsensus PERHI 2021 dan Kemenkes RI, menerapkan aturan logika **OR (ATAU)** pada sistolik dan diastolik serta penanganan krisis hipertensi.

```mermaid
flowchart TD
    StartHT(["Mulai Skrining Hipertensi"]) --> InputProfileHT["Input Umur, Jenis Kelamin, Berat (kg), Tinggi (cm)"]
    InputProfileHT --> CalcBMIHT["Hitung IMT Otomatis"]
    
    CalcBMIHT --> InputHabitsHT["Input: Riwayat Keluarga, Kebiasaan Garam, Merokok, Aktivitas Fisik, Keluhan"]
    InputHabitsHT --> CheckTestedBP{"Apakah Sudah Mengukur Tekanan Darah?"}
    
    CheckTestedBP -->|"Belum"| NoBP["Status: Belum Ada Hasil Tekanan Darah"]
    NoBP --> EvalHabitsHT["Evaluasi Faktor Risiko Kebiasaan (Tanpa Diagnosis)"]
    EvalHabitsHT --> OutResultHT["Hasilkan Rekomendasi Pengukuran Tensimeter"]
    
    CheckTestedBP -->|"Sudah"| InputBP["Input Dua Kolom Terpisah: Sistolik & Diastolik (mmHg)"]
    
    InputBP --> CheckCrisis{"Sistolik >= 180 ATAU Diastolik >= 120?"}
    CheckCrisis -->|"Ya"| CrisisHT["Status: KRISIS HIPERTENSI (Tanda Bahaya Medis Segera)"]
    CrisisHT --> EmergencyAction["Rujuk Segera ke IGD Rumah Sakit / Puskesmas"]
    
    CheckCrisis -->|"Tidak"| CheckHigh{"Sistolik >= 140 ATAU Diastolik >= 90?"}
    CheckHigh -->|"Ya (Salah Satu / Keduanya)"| HighBP["Status: TEKANAN DARAH TINGGI (Perlu Tindak Lanjut)"]
    HighBP --> NoteHigh["Penjelasan: Peningkatan salah satu angka sudah cukup memerlukan tindak lanjut"]
    
    CheckHigh -->|"Tidak"| CheckPreHT{"Sistolik 120-139 ATAU Diastolik 80-89?"}
    CheckPreHT -->|"Ya"| PreHT["Status: PRA-HIPERTENSI (Waspada Peningkatan)"]
    CheckPreHT -->|"Tidak"| NormalBP["Status: TEKANAN DARAH OPTIMAL (<120 / <80 mmHg)"]
    
    EmergencyAction --> OutResultHT
    NoteHigh --> OutResultHT
    PreHT --> OutResultHT
    NormalBP --> OutResultHT
    
    OutResultHT --> CheckComplaints{"Ada Nyeri Dada, Sesak Napas, atau Pandangan Kabur Mendadak?"}
    CheckComplaints -->|"Ya"| RedFlagHT["Tampilkan Tanda Bahaya Medis Teratas"]
    CheckComplaints -->|"Tidak"| FinalViewHT["Tampilkan Hasil, Batas Garam, dan Edukasi CERDIK"]
```

---

## 4. Flowchart Penyimpanan & Keamanan Data (Storage & Row Level Security)

Diagram ini mengilustrasikan bagaimana data dipisahkan antara penyimpanan lokal (IndexedDB) dan penyimpanan online (Supabase PostgreSQL) yang dilindungi kebijakan Row Level Security (RLS) multi-akun.

```mermaid
flowchart TD
    ResultReady["Hasil Pemeriksaan Selesai Dievaluasi"] --> UserChoice{"Pilihan Pengguna: Simpan Hasil?"}
    
    UserChoice -->|"Tidak"| SkipSave["Data Selesai Sesi (Tidak Disimpan Permanen)"]
    UserChoice -->|"Ya, Simpan"| AuthCheck{"Apakah Pengguna Sudah Masuk Akun?"}
    
    AuthCheck -->|"Mode Tamu (Tanpa Akun)"| SaveIDB["Simpan ke IndexedDB (Database Lokal Browser)"]
    SaveIDB --> SuccessLocal["Data Tersimpan di Perangkat Ini (Bebas Login, Bebas Tracking)"]
    
    AuthCheck -->|"Ingin Sinkron Online"| TriggerAuth["Tampilkan Modal Masuk / Daftar Supabase Auth"]
    TriggerAuth --> AuthSuccess{"Autentikasi Berhasil?"}
    AuthSuccess -->|"Batal / Gagal"| SaveIDB
    AuthSuccess -->|"Berhasil"| GetJWT["Dapatkan JWT Token: auth.uid()"]
    
    GetJWT --> ReqPostgres["Kirim Data ke Supabase PostgreSQL (Tabel checkups)"]
    
    ReqPostgres --> RLS_Check{"Pemeriksaan Row Level Security (RLS)"}
    
    RLS_Check -->|"auth.uid() == user_id"| AllowSQL["Izinkan Operasi SQL (INSERT / SELECT / UPDATE / DELETE)"]
    RLS_Check -->|"auth.uid() != user_id"| RejectSQL["Tolak Akses (403 Forbidden / 0 Rows Affected)"]
    
    AllowSQL --> SyncSuccess["Data Tersimpan Aman di Cloud & Terisolasi Hanya untuk Pengguna Tersebut"]
    RejectSQL --> SecurityLog["Pelanggaran Akses Dicegah oleh Kebijakan Database Postgres"]
```

