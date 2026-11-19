# Dokumentasi Aturan Klinis, Sumber Rujukan & Keputusan Implementasi — PANTAS

Dokumen ini memuat dasar medis resmi, ambang batas penilaian, serta keputusan teknis terhadap bagian dokumen atau pedoman yang membutuhkan klarifikasi pada aplikasi **PANTAS (Pemantauan Hipertensi dan Diabetes)**.

---

## 1. Sumber Resmi & Dasar Pedoman Medis

Seluruh aturan pemeriksaan awal, batasan angka laboratorium/tensi, serta materi edukasi pada aplikasi PANTAS mengacu secara ketat pada pedoman klinis resmi Indonesia:

1. **Pedoman Diabetes Melitus Tipe 2:**
   - *Sumber:* **PERKENI (Perkumpulan Endokrinologi Indonesia)** — *Pedoman Pengelolaan dan Pencegahan Diabetes Melitus Tipe 2 Dewasa di Indonesia (Konsensus 2021)*.
   - *Sumber Pendukung:* **Kementerian Kesehatan RI (Ditjen P2PTM)** — *Buku Pedoman Pengendalian Penyakit Tidak Menular*.

2. **Pedoman Hipertensi (Tekanan Darah Tinggi):**
   - *Sumber:* **PERHI (Perhimpunan Dokter Hipertensi Indonesia)** — *Konsensus Penatalaksanaan Hipertensi 2021*.
   - *Sumber Pendukung:* **Kementerian Kesehatan RI** — *Panduan Praktis Pengendalian Hipertensi*.

3. **Pedoman Indeks Massa Tubuh (IMT / BMI):**
   - *Sumber:* **Kementerian Kesehatan Republik Indonesia** — *Standar Antropometri Penilaian Status Gizi Dewasa*.

4. **Pedoman Gaya Hidup, Batas GGL, dan CERDIK:**
   - *Sumber:* **Kemenkes RI** — *Permenkes No. 30 Tahun 2013 tentang Pencantuman Informasi Kandungan Gula, Garam, dan Lemak*; Program GERMAS (Gerakan Masyarakat Hidup Sehat) & CERDIK.

---

## 2. Ringkasan Aturan Pemeriksaan & Ambang Batas

### A. Indeks Massa Tubuh (IMT) Dewasa Indonesia
- Rumus: $\text{IMT} = \frac{\text{Berat Badan (kg)}}{(\text{Tinggi Badan (m)})^2}$
- Ambang batas:
  - **Kurus:** $< 18,5\text{ kg/m}^2$
  - **Normal:** $18,5 \text{ sampai } < 25,0\text{ kg/m}^2$
  - **Berat Badan Berlebih (Overweight):** $25,0 \text{ sampai } < 27,0\text{ kg/m}^2$
  - **Obesitas:** $\ge 27,0\text{ kg/m}^2$
- *Catatan teknis:* Ditampilkan dengan 1 desimal (misal `24,9 kg/m²`), namun klasifikasi kategori menggunakan nilai riil sebelum pembulatan (misal $24,98$ tetap Normal $<25$).

### B. Gula Darah Puasa (GDP)
- Syarat puasa: Minimal 8–10 jam tanpa asupan kalori (hanya diperkenankan air putih tanpa pemanis).
- Ambang batas:
  - $< 70\text{ mg/dL}$: **Rendah (Hipoglikemia)** — bukan normal!
  - $70 - 99\text{ mg/dL}$: **Rentang Normal** pemeriksaan awal puasa.
  - $100 - 125\text{ mg/dL}$: **Perlu Perhatian & Pemeriksaan Lanjutan (Prediabetes / Glukosa Puasa Terganggu)**.
  - $\ge 126\text{ mg/dL}$: **Tinggi** — memerlukan evaluasi tenaga medis untuk pemeriksaan konfirmasi.
- *Aturan puasa:* Jika syarat puasa $\ge 8$ jam belum terpenuhi, sistem **TIDAK menerapkan interpretasi GDP**, melainkan memberi peringatan bahwa syarat puasa belum valid.

### C. Gula Darah Sewaktu (GDS)
- Dilakukan tanpa syarat puasa.
- Ambang batas:
  - $< 70\text{ mg/dL}$: **Rendah (Hipoglikemia)**.
  - $70 - 199\text{ mg/dL}$: **Di Bawah Ambang 200 mg/dL**. Sistem secara eksplisit menyatakan bahwa **GDS < 200 mg/dL tidak otomatis berarti normal atau bebas dari diabetes**, karena dipengaruhi waktu dan jenis makan terakhir.
  - $\ge 200\text{ mg/dL}$: **Tinggi** — bila disertai gejala klasik (poliuria, polidipsia, penurunan berat badan), mengarah kuat pada kemungkinan diabetes dan perlu evaluasi nakes segera.

### D. Tekanan Darah (Hipertensi)
- Kolom pengukuran dipisahkan secara tegas: Sistolik dan Diastolik.
- Ambang batas:
  - $\text{Sistolik} \ge 140 \text{ ATAU } \text{Diastolik} \ge 90\text{ mmHg}$: **Tekanan Darah Tinggi (Perlu Tindak Lanjut)**.
  - **Aturan ATAU:** Peningkatan salah satu angka saja sudah cukup untuk memerlukan tindak lanjut (misal $150/85\text{ mmHg}$ atau $135/95\text{ mmHg}$).
  - Optimal / Normal: $\text{Sistolik} < 120\text{ mmHg}$ DAN $\text{Diastolik} < 80\text{ mmHg}$.
  - Pra-hipertensi: $120–139 / 80–89\text{ mmHg}$.
  - *Catatan teknis:* Satu pengukuran tensi mandiri tidak otomatis menetapkan diagnosis medis permanen.

---

## 3. Penjelasan Bagian Ambigu & Keputusan Implementasi

| Bagian Dokumen / Kasus Ambigu | Masalah Klinis / Kerancuan | Keputusan Implementasi PANTAS |
|---|---|---|
| **Kategori GDS < 200 mg/dL** | Bila diberi label "Normal", pengguna dapat keliru menganggap dirinya bebas diabetes padahal baru makan sedikit atau memiliki riwayat keluarga/gejala kuat. | GDS $<200\text{ mg/dL}$ diberi status rujukan umum dengan catatan tegas: *"GDS <200 mg/dL tidak otomatis berarti normal atau bebas dari risiko diabetes. Untuk evaluasi akurat, lakukan tes GDP terstandar."* |
| **Gula Darah < 70 mg/dL** | Dokumen tidak boleh memasukkan angka $<70$ ke dalam rentang "Normal" karena merupakan kondisi hipoglikemia yang berbahaya. | Seluruh nilai $<70\text{ mg/dL}$ (baik GDP maupun GDS) diklasifikasikan sebagai **Rendah (Hipoglikemia)** dan memicu peringatan tanda bahaya bila disertai lemas/gemetar. |
| **Sistolik Tinggi vs Diastolik Normal (e.g. 150/85)** | Pengguna awam sering mengira tensi harus tinggi kedua-duanya sekaligus untuk disebut darah tinggi. | Sistem menerapkan aturan logis **OR (ATAU)**. Peningkatan salah satu komponen ($\ge 140$ atau $\ge 90$) langsung berstatus tinggi dan memerlukan tindak lanjut. |
| **Syarat Puasa GDP tidak terpenuhi** | Seseorang mengaku tes GDP padahal baru sarapan 2 jam sebelumnya. | Formulir mewajibkan konfirmasi puasa 8 jam. Jika pengguna memilih "Tidak/Belum 8 jam", interpretasi GDP tidak diterapkan demi integritas medis. |
| **Pengguna belum melakukan tes lab/tensi** | Sering kali aplikasi kesehatan memaksakan angka perkiraan atau skor probabilitas buatan (misal "Kemungkinan diabetes 78%"). | PANTAS **tidak pernah mengarang skor atau persentase palsu**. Jika belum periksa, ditampilkan *"Belum ada hasil pengukuran"* dan evaluasi murni difokuskan pada faktor risiko kebiasaan serta edukasi. |
| **Tanda Bahaya (Kegawatdaruratan)** | Munculnya gejala berat (misal nyeri dada menekan atau sesak napas) tidak boleh menunggu apakah tensinya tinggi atau belum diperiksa. | Tanda bahaya dievaluasi secara independen. Keluhan darurat langsung memicu instruksi ke IGD/Puskesmas tanpa mensyaratkan seluruh angka terpenuhi bersamaan. |
| **Saran Pengobatan** | Aplikasi kesehatan masyarakat dilarang memberikan resep atau dosis obat. | PANTAS secara tegas **tidak menyarankan dosis atau perubahan obat**. Pengguna diarahkan mematuhi anjuran dokter yang merawat. |

---

## 4. Ringkasan Pengujian Program (Automated Verification)

Pengujian otomatis telah dibuat pada berkas `tests/rules.test.ts` dan `tests/rls-simulation.test.ts` dan dijalankan dengan perintah `npm test`:

1. **Batas IMT:**
   - $18,48 \to \text{Kurus}$
   - $18,51 \to \text{Normal}$
   - $24,98 \to \text{Normal}$
   - $25,01 \to \text{Berat Badan Berlebih}$
   - $26,95 \to \text{Berat Badan Berlebih}$
   - $27,02 \to \text{Obesitas}$
   - Dukungan desimal koma Indonesia ($65,5 \to 65.5$).

2. **Gula Darah & Puasa:**
   - GDP $99 \to \text{Normal}$
   - GDP $100 \to \text{Perhatian (Prediabetes)}$
   - GDP $125 \to \text{Perhatian}$
   - GDP $126 \to \text{Tinggi}$
   - Gula darah $65 \to \text{Rendah & Memicu tanda bahaya}$
   - GDS $199 \to \text{Tidak otomatis normal sepihak}$
   - GDP tanpa puasa 8 jam $\to \text{Interpretasi GDP ditolak}$
   - Tanpa hasil tes $\to \text{Belum ada pengukuran (tanpa diagnosis)}$

3. **Tekanan Darah:**
   - TD $150/85 \to \text{Tinggi (Sistolik tinggi saja)}$
   - TD $135/95 \to \text{Tinggi (Diastolik tinggi saja)}$
   - TD $115/75 \to \text{Normal}$
   - TD tanpa hasil $\to \text{Belum ada pengukuran}$

4. **Tanda Bahaya:**
   - TD $185/110 \to \text{Krisis Hipertensi}$
   - Keluhan nyeri dada tanpa tensi $\to \text{Memicu peringatan gawat darurat}$

5. **Row Level Security Multi-Akun:**
   - User A hanya dapat membaca, menambah, mengubah, dan menghapus data miliknya.
   - User B tidak dapat melihat atau memanipulasi data User A.

