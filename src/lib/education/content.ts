import { EducationArticle } from '../types';

export const EDUCATION_ARTICLES: EducationArticle[] = [
  {
    id: 'edu-dm-basics',
    title: 'Mengenal Diabetes Melitus: Penyebab, Gejala, dan Pemeriksaan Awal',
    category: 'diabetes',
    readTimeMinutes: 4,
    summary:
      'Diabetes melitus terjadi ketika kadar glukosa dalam darah meningkat akibat gangguan kerja atau produksi hormon insulin. Pahami gejalanya sedini mungkin.',
    sections: [
      {
        heading: 'Apa Itu Diabetes Melitus?',
        content: [
          'Diabetes melitus (sering disebut penyakit kencing manis) adalah kondisi kronis di mana tubuh tidak dapat memproses gula darah (glukosa) secara optimal.',
          'Pada diabetes tipe 2 (yang paling sering ditemui pada orang dewasa), pankreas tetap memproduksi insulin namun sel-sel tubuh kurang peka terhadap insulin (resistensi insulin). Akibatnya, glukosa menumpuk di aliran darah.',
        ],
      },
      {
        heading: 'Gejala Khas yang Perlu Diwaspadai',
        content: [
          'Pada tahap awal, diabetes kerap tidak menimbulkan keluhan jelas sehingga sering disebut "silent condition". Namun jika diperhatikan, terdapat beberapa tanda khas:',
        ],
        tips: [
          'Poliuria: Sangat sering buang air kecil, terutama terbangun berulang kali di malam hari.',
          'Polidipsia: Mudah merasa haus yang berlebihan walau sudah cukup minum.',
          'Polifagia: Cepat merasa lapar walau sudah makan.',
          'Penurunan berat badan mendadak tanpa niat diet atau olahraga ekstra.',
          'Keluhan lain: Badan cepat lemas, luka di kulit lambat sembuh, pandangan agak buram, atau kesemutan di ujung jari.',
        ],
      },
      {
        heading: 'Memahami Angka Pemeriksaan Laboratorium',
        content: [
          'Pemeriksaan laboratorium dilakukan dengan mengambil sampel darah:',
          '1. Gula Darah Puasa (GDP): Diukur setelah puasa kalori 8–10 jam. Rentang normal: 70–99 mg/dL. Rentang 100–125 mg/dL menandakan prediabetes (perlu perhatian). Nilai ≥126 mg/dL memerlukan konfirmasi dokter.',
          '2. Gula Darah Sewaktu (GDS): Diukur kapan saja tanpa syarat puasa. Nilai <200 mg/dL tidak otomatis menyingkirkan diabetes. Nilai ≥200 mg/dL disertai gejala klasik mengarah kuat pada diabetes.',
        ],
      },
    ],
    sources: [
      {
        institution: 'Kementerian Kesehatan Republik Indonesia (Kemenkes RI)',
        documentTitle: 'Buku Pedoman Pengendalian Penyakit Tidak Menular',
        reviewDate: 'Ditinjau: November 2024',
      },
      {
        institution: 'Perkumpulan Endokrinologi Indonesia (PERKENI)',
        documentTitle: 'Pedoman Pengelolaan dan Pencegahan Diabetes Melitus Tipe 2 Dewasa di Indonesia',
        reviewDate: 'Edisi Konsensus 2021',
      },
    ],
  },
  {
    id: 'edu-ht-basics',
    title: 'Mengenal Hipertensi: Mengapa Tekanan Darah Perlu Dipantau Rutin',
    category: 'hipertensi',
    readTimeMinutes: 4,
    summary:
      'Hipertensi sering dijuluki "the silent killer" karena jarang menimbulkan gejala hingga memicu komplikasi jantung atau ginjal. Ketahui batas amannya.',
    sections: [
      {
        heading: 'Apa yang Dimaksud dengan Tekanan Darah?',
        content: [
          'Tekanan darah dinyatakan dalam dua angka: sistolik (angka atas saat jantung memompa darah) dan diastolik (angka bawah saat jantung beristirahat di antara detakan). Satuan yang digunakan adalah milimeter air raksa (mmHg).',
          'Seseorang dikatakan mengalami tekanan darah tinggi apabila hasil pemeriksaan menunjukkan sistolik ≥140 mmHg ATAU diastolik ≥90 mmHg pada pemeriksaan berulang dalam keadaan tenang.',
        ],
      },
      {
        heading: 'Mengapa Peningkatan Salah Satu Angka Saja Sudah Bermakna?',
        content: [
          'Banyak orang mengira sistolik dan diastolik harus tinggi bersamaan untuk disebut hipertensi. Hal ini tidak tepat.',
          'Kondisi sistolik tinggi dengan diastolik normal (misalnya 150/85 mmHg) sering disebut Hipertensi Sistolik Terisolasi dan sangat sering terjadi pada orang dewasa atau lansia. Begitu pula diastolik tinggi (misalnya 135/95 mmHg) menunjukkan tekanan pembuluh darah tetap tinggi saat jantung istirahat.',
          'Keduanya sama-sama memerlukan perhatian dan konsultasi ke tenaga medis.',
        ],
      },
      {
        heading: 'Cara Mengukur Tekanan Darah yang Benar',
        content: [
          'Hasil pengukuran tensi dapat berubah-ubah dipengaruhi rasa cemas, kopi, atau aktivitas fisik sesaat. Untuk memperoleh hasil yang akurat:',
        ],
        tips: [
          'Duduk istirahat dengan tenang minimal 5 menit sebelum pengukuran.',
          'Hindari merokok atau minum kopi 30 menit sebelum diperiksa.',
          'Letakkan lengan di atas meja setinggi dada/jantung.',
          'Jangan berbicara atau bergerak selama manset tensimeter memompa.',
        ],
      },
    ],
    sources: [
      {
        institution: 'Perhimpunan Dokter Hipertensi Indonesia (PERHI)',
        documentTitle: 'Konsensus Penatalaksanaan Hipertensi 2021',
        reviewDate: 'Ditinjau: November 2024',
      },
      {
        institution: 'Kemenkes RI - Direktorat P2PTM',
        documentTitle: 'Panduan Praktis Pengendalian Hipertensi',
        reviewDate: 'Ditinjau: Agustus 2024',
      },
    ],
  },
  {
    id: 'edu-cerdik',
    title: 'Pedoman CERDIK: 6 Langkah Nyata Cegah Penyakit Tidak Menular',
    category: 'umum',
    readTimeMinutes: 3,
    summary:
      'Program CERDIK dari Kementerian Kesehatan RI merupakan panduan gaya hidup sehat yang mudah diterapkan dalam keseharian masyarakat Indonesia.',
    sections: [
      {
        heading: 'Prinsip CERDIK Sehari-hari',
        content: [
          'Penyakit tidak menular seperti diabetes dan hipertensi sebagian besar dapat dicegah dan dikendalikan dengan perubahan perilaku yang konsisten.',
        ],
        tips: [
          'C - Cek kesehatan secara berkala: Periksa tekanan darah, gula darah, dan berat badan minimal satu kali setiap bulan bagi usia dewasa berisiko.',
          'E - Enyahkan asap rokok: Hindari rokok konvensional maupun rokok elektrik, serta lindungi keluarga dari paparan asap rokok pasif.',
          'R - Rajin aktivitas fisik: Luangkan waktu 30 menit sehari untuk bergerak atau berolahraga ringan hingga sedang.',
          'D - Diet sehat dengan kalori seimbang: Perbanyak sayuran dan buah lokal, batasi gula, garam, dan santan berlebih.',
          'I - Istirahat cukup: Tidur berkualitas 7–8 jam setiap malam untuk membantu stabilisasi hormon tubuh.',
          'K - Kelola stres: Luangkan waktu untuk relaksasi, berkumpul bersama keluarga, atau ibadah guna menurunkan hormon stres kortisol.',
        ],
      },
    ],
    sources: [
      {
        institution: 'Kementerian Kesehatan Republik Indonesia',
        documentTitle: 'Pedoman Gerakan Masyarakat Hidup Sehat (GERMAS) & CERDIK',
        reviewDate: 'Ditinjau: Oktober 2024',
      },
    ],
  },
  {
    id: 'edu-prinsip-3j',
    title: 'Prinsip Makan 3J: Kunci Pengendalian Gula Darah bagi Masyarakat',
    category: 'diabetes',
    readTimeMinutes: 4,
    summary:
      'Mengatur makan untuk penderita dan pencegah diabetes tidak berarti harus kelaparan. Kuncinya ada pada Jadwal, Jumlah, dan Jenis bahan makanan.',
    sections: [
      {
        heading: '1. Jadwal Makan yang Teratur',
        content: [
          'Penting menjaga ritme makan dengan 3 kali makan utama (sarapan, makan siang, makan malam) dan 2–3 kali selingan buah sehat.',
          'Jadwal yang konsisten membantu mencegah fluktuasi tajam gula darah serta mencegah rasa lapar berlebih yang memicu makan berlebihan.',
        ],
      },
      {
        heading: '2. Jumlah Porsi yang Sesuai (Isi Piringku)',
        content: [
          'Gunakan panduan "Isi Piringku" dari Kemenkes RI:',
          'Setengah piring (50%) diisi dengan aneka sayuran (bayam, sawi, kangkung, wortel) dan sedikit buah.',
          'Seperempat piring (25%) diisi makanan pokok sumber karbohidrat (nasi, singkong, kentang, jagung). Utamakan porsi yang terukur.',
          'Seperempat piring (25%) diisi lauk pauk sumber protein (ikan, tahu, tempe, telur, ayam tanpa kulit).',
        ],
      },
      {
        heading: '3. Jenis Makanan yang Dipilih',
        content: [
          'Pilihlah karbohidrat kompleks dengan serat tinggi agar penyerapan gula berlangsung perlahan. Batasi makanan berindeks glikemik tinggi.',
        ],
        tips: [
          'Utamakan: Nasi merah, oat, singkong rebus, tempe bacem panggang, ikan pepes, sayur bening bayam, lalapan segar.',
          'Batasi: Kue manis, donat, es teh manis berulang, gorengan bertepung tebal, dan minuman bersoda.',
        ],
      },
    ],
    sources: [
      {
        institution: 'Kemenkes RI & PERKENI',
        documentTitle: 'Petunjuk Teknis Diet Diabetes Melitus & Isi Piringku',
        reviewDate: 'Ditinjau: September 2024',
      },
    ],
  },
  {
    id: 'edu-ggl',
    title: 'Aturan Batasan GGL: Gula, Garam, dan Lemak dalam Masakan Indonesia',
    category: 'umum',
    readTimeMinutes: 4,
    summary:
      'Masakan nusantara kaya bumbu, namun sering kali tersembunyi gula, garam, dan santan berlebih. Ingat rumus praktis G4 - G1 - L5 setiap hari.',
    sections: [
      {
        heading: 'Rumus Praktis Kemenkes: G4 - G1 - L5 per Orang per Hari',
        content: [
          'Agar mudah diingat oleh seluruh anggota keluarga, Kementerian Kesehatan merumuskan batasan konsumsi harian:',
        ],
        tips: [
          'Gula: Maksimal 4 Sendok Makan (50 gram) per orang per hari.',
          'Garam: Maksimal 1 Sendok Teh (5 gram atau setara 2.000 mg Natrium) per orang per hari.',
          'Lemak: Maksimal 5 Sendok Makan minyak (67 gram) per orang per hari.',
        ],
      },
      {
        heading: 'Waspada Natrium Tersembunyi pada Makanan Indonesia',
        content: [
          'Garam tidak hanya berasal dari garam dapur saat memasak, melainkan juga dari:',
          '• Penyedap rasa (MSG) dan kaldu bubuk instan.',
          '• Kecap asin, saus tiram, dan tauco.',
          '• Makanan olahan: kerupuk, ikan asin, mi instan, dan kornet.',
        ],
        tips: [
          'Gunakan rempah alami seperti bawang putih, jahe, kunyit, daun salam, dan serai untuk memperkaya rasa masakan tanpa perlu banyak garam.',
          'Pilih metode memasak rebus, kukus, pepes, atau panggang dibanding menggoreng rendam minyak (deep frying).',
        ],
      },
    ],
    sources: [
      {
        institution: 'Kementerian Kesehatan Republik Indonesia',
        documentTitle: 'Permenkes No. 30 Tahun 2013 tentang Pencantuman Informasi Kandungan Gula, Garam, dan Lemak',
        reviewDate: 'Ditinjau: Oktober 2024',
      },
    ],
  },
  {
    id: 'edu-aktivitas-fisik',
    title: 'Panduan Aktivitas Fisik 150 Menit per Minggu yang Realistis',
    category: 'umum',
    readTimeMinutes: 3,
    summary:
      'Tidak harus ke pusat kebugaran mahal. Jalan kaki cepat 30 menit sehari selama 5 hari sudah sangat efektif memperbaiki kontrol tensi dan gula darah.',
    sections: [
      {
        heading: 'Bagaimana Aktivitas Fisik Membantu Tubuh?',
        content: [
          'Saat otot bergerak aktif, sel-sel menyerap glukosa darah langsung sebagai bahan bakar tanpa membutuhkan terlalu banyak insulin. Dengan demikian resistensi insulin berkurang.',
          'Bagi pembuluh darah, olahraga aerobik memicu produksi nitrat oksida yang membuat dinding arteri melebar dan elastis, menurunkan tekanan darah secara alami.',
        ],
      },
      {
        heading: 'Contoh Aktivitas yang Nyaman dan Terjangkau',
        content: [
          'Target yang direkomendasikan adalah minimal 150 menit per minggu dengan intensitas sedang (napas agak lebih cepat, namun masih bisa berbicara satu-dua kalimat):',
        ],
        tips: [
          'Jalan cepat di sekitar lingkungan rumah 30 menit, Senin sampai Jumat pagi atau sore.',
          'Bersepeda santai bersama keluarga di akhir pekan.',
          'Senam aerobik ringan atau senam lansia di balai RW/Puskesmas.',
          'Bekerja aktif di kebun atau membersihkan rumah secara energik.',
        ],
      },
    ],
    sources: [
      {
        institution: 'World Health Organization (WHO) & Kemenkes RI',
        documentTitle: 'Pedoman Aktivitas Fisik untuk Kesehatan Masyarakat',
        reviewDate: 'Ditinjau: Agustus 2024',
      },
    ],
  },
  {
    id: 'edu-perawatan-kaki',
    title: 'Perawatan Kaki bagi Penyandang Diabetes: Cegah Luka Sejak Dini',
    category: 'diabetes',
    readTimeMinutes: 4,
    summary:
      'Gula darah tinggi yang berkepanjangan dapat menurunkan sensitivitas saraf dan memperlambat penyembuhan luka kaki. Lakukan langkah perlindungan harian.',
    sections: [
      {
        heading: 'Mengapa Kaki Perlu Perhatian Khusus?',
        content: [
          'Kondisi neuropati diabetik membuat ujung jari kaki terasa baal atau kebas. Penderita kerap tidak merasakan saat kakinya terkena duri, lecet akibat sepatu sempit, atau terkena air panas.',
          'Bila luka tidak dirawat dengan cepat dan benar, infeksi dapat berkembang luas. Karena itu, pencegahan adalah langkah terbaik.',
        ],
      },
      {
        heading: 'Kebiasaan Harian Perawatan Kaki',
        content: ['Jadikan langkah berikut sebagai rutinitas sebelum tidur atau setelah mandi:'],
        tips: [
          'Periksa telapak dan sela-sela jari kaki setiap hari dengan bantuan cermin atau bantuan keluarga.',
          'Cuci kaki dengan air bersih bersuhu hangat kuku dan sabun lembut, lalu keringkan sela-sela jari dengan handuk bersih.',
          'Oleskan pelembap/lotion pada punggung kaki dan tumit agar tidak pecah-pecah, namun jangan dioleskan di sela jari kaki (agar tidak lembap berjamur).',
          'Potong kuku kaki secara lurus mengikuti bentuk ujung jari, jangan memotong terlalu dalam ke sudut kuku.',
          'Selalu kenakan alas kaki (sandal atau sepatu yang nyaman) bahkan saat berada di dalam rumah.',
          'Gunakan kaus kaki bersih berbahan katun yang menyerap keringat dan tidak terlalu ketat.',
        ],
      },
    ],
    sources: [
      {
        institution: 'PERKENI (Perkumpulan Endokrinologi Indonesia)',
        documentTitle: 'Petunjuk Teknis Pencegahan Kaki Diabetes',
        reviewDate: 'Konsensus 2021',
      },
    ],
  },
  {
    id: 'edu-kepatuhan-obat',
    title: 'Kepatuhan Minum Obat: Jangan Hentikan Tanpa Anjuran Dokter',
    category: 'hipertensi',
    readTimeMinutes: 3,
    summary:
      'Merasa sudah enak badan bukan berarti hipertensi telah sembuh total. Obat antihipertensi bekerja mengendalikan tekanan darah agar komplikasi tidak terjadi.',
    sections: [
      {
        heading: 'Mitos yang Sering Salah Paham di Masyarakat',
        content: [
          'Banyak masyarakat menghentikan obat darah tinggi saat kepalanya sudah tidak pusing, karena khawatir obat akan merusak ginjal. Pemikiran ini keliru.',
          'Faktanya: Justru tekanan darah tinggi yang tidak terkontrol yang perlahan merusak pembuluh darah ginjal dan menyebabkan gagal ginjal. Obat yang diresepkan dokter telah teruji aman dan melindungi organ vital.',
        ],
      },
      {
        heading: 'Tips Disiplin Minum Obat',
        content: ['Agar jadwal konsumsi obat tidak terlewat:'],
        tips: [
          'Minum obat pada jam yang sama setiap hari (misalnya tiap selesai sarapan pagi).',
          'Gunakan kotak obat bersekat hari (pill organizer) atau pasang alarm pengingat di ponsel.',
          'Jangan pernah menambah, melipatgandakan, atau mengurangi dosis tanpa berkonsultasi langsung dengan dokter.',
          'Bawa catatan daftar obat yang sedang dikonsumsi saat berkunjung ke fasilitas kesehatan.',
        ],
      },
    ],
    sources: [
      {
        institution: 'Badan Pengawas Obat dan Makanan (BPOM) & Kemenkes RI',
        documentTitle: 'Pedoman Penggunaan Obat Rasional pada Hipertensi Kronis',
        reviewDate: 'Ditinjau: Juli 2024',
      },
    ],
  },
  {
    id: 'edu-tanda-bahaya',
    title: 'Kenali Tanda Bahaya (Red Flags): Kapan Harus Segera ke IGD',
    category: 'umum',
    readTimeMinutes: 3,
    summary:
      'Beberapa gejala fisik membutuhkan penanganan medis darurat dan tidak boleh ditunggu di rumah. Ketahui tanda bahaya pada gula darah dan tensi.',
    sections: [
      {
        heading: 'Tanda Bahaya Terkait Tekanan Darah (Krisis Hipertensi)',
        content: [
          'Segera cari pertolongan IGD terdekat bila tekanan darah sangat tinggi disertai satu atau lebih gejala berikut:',
        ],
        tips: [
          'Nyeri dada yang berat, terasa seperti tertindih beban berat, atau menjalar ke leher dan lengan kiri.',
          'Sesak napas hebat yang muncul tiba-tiba.',
          'Sakit kepala sangat hebat dan tak tertahankan disertai muntah menyembur.',
          'Pandangan mendadak gelap atau kabur secara mendadak.',
          'Kelemahan atau kelumpuhan separuh anggota tubuh, bicara pelo, atau wajah tampak miring (tanda stroke).',
        ],
      },
      {
        heading: 'Tanda Bahaya Terkait Gula Darah',
        content: [
          '1. Hipoglikemia Berat (Gula darah <70 mg/dL): Lemas mendadak, gemetar tak terkendali, keringat dingin membasahi pakaian, linglung, atau pingsan.',
          '2. Krisis Hiperglikemia / Ketoasidosis: Gula darah sangat tinggi disertai muntah terus-menerus, napas terengah-engah cepat dan dalam berbau buah, serta penurunan kesadaran.',
        ],
      },
      {
        heading: 'Tindakan yang Harus Dilakukan',
        content: [
          'Segera bawa pasien ke fasilitas pelayanan kesehatan terdekat (IGD Rumah Sakit atau Puskesmas 24 Jam).',
          'Jangan memberikan obat penurun tensi atau suntikan insulin sembarangan tanpa petunjuk dokter jaga.',
        ],
      },
    ],
    sources: [
      {
        institution: 'Kemenkes RI & IDI (Ikatan Dokter Indonesia)',
        documentTitle: 'Panduan Praktik Klinis Penanganan Kegawatdaruratan Medik',
        reviewDate: 'Ditinjau: Oktober 2024',
      },
    ],
  },
  {
    id: 'edu-mitos-menu-dm',
    title: 'Mitos vs Fakta Diabetes & Panduan Contoh Menu Sehari (Diet 3J)',
    category: 'diabetes',
    readTimeMinutes: 4,
    summary:
      'Kupas tuntas mitos konsumsi nasi, mitos obat merusak ginjal, serta panduan menu makan sehat sehari (Pagi, Siang, Malam, Selingan) lengkap dengan prinsip 3J.',
    sections: [
      {
        heading: 'Mitos vs Fakta Seputar Diabetes',
        content: [
          'Banyak informasi yang kurang tepat beredar di masyarakat mengenai diabetes melitus. Mari kita luruskan faktanya:',
        ],
        tips: [
          'Mitos: Makan manis sekali langsung terkena diabetes. -> Fakta: Diabetes terjadi karena penumpukan gula dan kalori berlebih selama bertahun-tahun, ditambah faktor obesitas dan riwayat keturunan.',
          'Mitos: Penderita diabetes tidak boleh makan nasi sama sekali. -> Fakta: Boleh makan nasi dalam porsi terukur (1/4 piring), dan lebih dianjurkan memilih beras merah atau karbohidrat tinggi serat.',
          'Mitos: Obat diabetes merusak ginjal jika diminum terus. -> Fakta: Justru kadar gula darah yang tinggi dan tidak terkontrol yang merusak pembuluh darah ginjal hingga memicu gagal ginjal.',
          'Mitos: Luka kecil di kaki tidak berbahaya. -> Fakta: Pada penyandang diabetes, luka kecil bisa cepat membesar, bernanah, dan sulit sembuh karena sirkulasi darah terganggu.',
        ],
      },
      {
        heading: 'Prinsip Diet 3J: Jumlah, Jenis, Jadwal',
        content: [
          '1. Jumlah: Porsi tidak berlebihan. Terapkan prinsip Piring T: 1/2 piring sayur & buah, 1/4 nasi merah, 1/4 lauk berprotein (ikan, ayam tanpa kulit, tahu/tempe).',
          '2. Jenis: HINDARI gula pasir, sirup, kue manis, boba, soda, gorengan, jeroan, dan makanan super asin. PILIH beras merah, ubi rebus, sayur hijau, ikan kukus/bakar, dan buah segar (apel, pir, jambu).',
          '3. Jadwal: Makan teratur dengan 3x makan utama + 2x selingan sehat. Jangan telat makan agar gula darah stabil.',
        ],
      },
      {
        heading: 'Contoh Menu Sehari PANTAS',
        content: [
          'Berikut inspirasi menu makan harian yang sehat dan bergizi:',
        ],
        tips: [
          'Pagi: Nasi merah + telur rebus + sayur bayam bening.',
          'Selingan Pagi (Pukul 10.00): 1 buah apel kecil atau pir.',
          'Siang: Nasi merah + ikan bakar/kukus + tahu kukus + lalapan sayur segar.',
          'Selingan Sore (Pukul 16.00): Ubi rebus atau kacang sangrai.',
          'Malam: Nasi merah + tumis dada ayam tanpa kulit + capcay sayur.',
          'Kebutuhan Cairan: Minum air putih minimal 8 gelas per hari.',
        ],
      },
    ],
    sources: [
      {
        institution: 'Puskesmas Karangawen I & Kemenkes RI',
        documentTitle: 'Buku Panduan Edukasi Diabetes Melitus PANTAS',
        reviewDate: 'Ditinjau: 2024',
      },
    ],
  },
  {
    id: 'edu-pencegahan-ht',
    title: '9 Langkah Pencegahan Hipertensi & Mengenali Bahaya Silent Killer',
    category: 'hipertensi',
    readTimeMinutes: 4,
    summary:
      'Tekanan darah tinggi sering dijuluki Silent Killer karena kerap tanpa gejala. Pelajari definisi, gejala yang sering muncul, komplikasi, dan 9 langkah pencegahan resmi Kemenkes.',
    sections: [
      {
        heading: 'Definisi & Gejala yang Sering Muncul',
        content: [
          'Hipertensi didefinisikan sebagai hasil pengukuran tekanan darah sistolik ≥140 mmHg dan/atau diastolik ≥90 mmHg setelah dilakukan pemeriksaan berulang pada usia dewasa (>18 tahun).',
          'Karena sering tidak menunjukkan keluhan di awal ("silent killer"), perhatikan tanda-tanda berikut:',
        ],
        tips: [
          'Sakit kepala atau rasa berat di kepala.',
          'Leher terasa kencang atau kaku di bagian tengkuk.',
          'Mudah marah atau gelisah tanpa sebab jelas.',
          'Telinga berdengung (tinnitus).',
          'Mata berkunang-kunang atau pandangan kabur.',
        ],
      },
      {
        heading: '9 Langkah Nyata Pencegahan Hipertensi (Kemenkes RI)',
        content: [
          'Kementerian Kesehatan merekomendasikan 9 langkah terpadu berikut:',
        ],
        tips: [
          '1. Kurangi Garam: Batasi konsumsi garam tidak lebih dari 1 sendok teh (5 gram) per hari. Hindari ikan asin, mie instan, dan makanan kaleng.',
          '2. Makan Makanan Bergizi Seimbang: Perbanyak sayur, buah, kacang-kacangan, gandum utuh, dan makanan rendah lemak jenuh.',
          '3. Jaga Berat Badan Ideal: Kelebihan berat badan meningkatkan beban kerja jantung. Turunkan 5–10% berat badan bila berlebih.',
          '4. Rutin Berolahraga: Lakukan aktivitas fisik minimal 30 menit sehari, 5 hari seminggu (jalan cepat, bersepeda, berenang, senam).',
          '5. Berhenti Merokok: Nikotin menyebabkan penyempitan pembuluh darah dan memicu stroke.',
          '6. Batasi / Hindari Alkohol.',
          '7. Kelola Stres: Redakan ketegangan dengan relaksasi, meditasi, ibadah, hobi, dan mendengarkan musik.',
          '8. Tidur Cukup: Tidur 7–9 jam setiap malam untuk menjaga keseimbangan hormon dan tekanan darah.',
          '9. Periksa Tekanan Darah Secara Berkala: Pantau tensi secara rutin di Puskesmas atau fasilitas kesehatan.',
        ],
      },
      {
        heading: 'Waspada Komplikasi Berat',
        content: [
          'Tekanan darah tinggi yang dibiarkan bertahun-tahun merusak organ vital tubuh:',
        ],
        tips: [
          'Stroke: Akibat pecah atau tersumbatnya pembuluh darah di otak.',
          'Gagal Jantung & Serangan Jantung: Karena jantung dipaksa memompa melawan tekanan tinggi terus-menerus.',
          'Gagal Ginjal Kronis: Kerusakan saringan darah ginjal hingga memerlukan cuci darah.',
          'Retinopati Hipertensi: Kerusakan pembuluh darah mata hingga menyebabkan kebutaan.',
        ],
      },
    ],
    sources: [
      {
        institution: 'Kementerian Kesehatan RI & Puskesmas Karangawen I',
        documentTitle: 'Infografis 9 Langkah Pencegahan Hipertensi & Modul PANTAS',
        reviewDate: 'Ditinjau: 2024',
      },
    ],
  },
];

