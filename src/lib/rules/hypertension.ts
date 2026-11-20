import {
  EvaluationResult,
  HipertensiFormInput,
  MeasurementEvaluation,
  RedFlagAlert,
  RiskFactorItem,
} from '../types';
import { calculateBMI } from './bmi';

const DISCLAIMER_TEXT =
  'Hasil ini membantu pemantauan awal dan tidak menggantikan pemeriksaan tenaga kesehatan. Diagnosis resmi hipertensi memerlukan pengukuran berulang pada waktu berbeda oleh tenaga medis yang kompeten.';

export function evaluateHipertensi(input: HipertensiFormInput): EvaluationResult {
  const age = typeof input.age === 'number' ? input.age : 0;
  const weight = typeof input.weight === 'number' ? input.weight : 0;
  const height = typeof input.height === 'number' ? input.height : 0;

  const bmiResult = calculateBMI(weight, height);
  const bmiValue = bmiResult?.value ?? 0;
  const bmiFormatted = bmiResult?.formatted ?? '-';
  const bmiCategory = bmiResult?.category ?? 'normal';
  const bmiCategoryLabel = bmiResult?.label ?? '-';

  const systolic = typeof input.systolic === 'number' && !isNaN(input.systolic) ? input.systolic : null;
  const diastolic = typeof input.diastolic === 'number' && !isNaN(input.diastolic) ? input.diastolic : null;

  // 1. Tanda Bahaya (Red Flags)
  const redFlagSymptoms: string[] = [];

  // Severe hypertension crisis threshold (PERHI standard: >= 180 or >= 120)
  if ((systolic !== null && systolic >= 180) || (diastolic !== null && diastolic >= 120)) {
    redFlagSymptoms.push(
      `Tekanan darah sangat tinggi (${systolic ?? '-'} / ${diastolic ?? '-'} mmHg) — risiko krisis hipertensi.`
    );
  }

  if (input.complaints.nyeriDada) {
    redFlagSymptoms.push('Nyeri dada yang menekan atau menjalar (waspada gangguan jantung).');
  }

  if (input.complaints.sesakNapas) {
    redFlagSymptoms.push('Sesak napas hebat yang muncul mendadak.');
  }

  if (input.complaints.pandanganKabur && (systolic !== null && systolic >= 140)) {
    redFlagSymptoms.push('Gangguan penglihatan atau pandangan kabur mendadak bersamaan dengan tekanan darah tinggi.');
  }

  if (input.complaints.sakitKepalaHebat && (systolic !== null && systolic >= 160)) {
    redFlagSymptoms.push('Sakit kepala yang sangat hebat dan tak tertahankan dengan tekanan darah tinggi.');
  }

  let redFlags: RedFlagAlert;
  if (redFlagSymptoms.length > 0) {
    redFlags = {
      isTriggered: true,
      title: 'Tanda Bahaya Medis Terdeteksi',
      message:
        'Ditemukan keluhan atau nilai tekanan darah yang memerlukan pertolongan tenaga medis segera. Jangan menunda untuk mencari bantuan.',
      action:
        'Konsultasikan kondisi ini kepada dokter atau petugas kesehatan di Puskesmas Karangawen I atau fasilitas kesehatan terdekat.',
      urgency: 'segera_ke_fasilitas_kesehatan',
      symptoms: redFlagSymptoms,
    };
  } else {
    redFlags = {
      isTriggered: false,
      title: '',
      message: '',
      action: '',
      urgency: 'waspada',
      symptoms: [],
    };
  }

  // 2. Evaluate Measurement
  let measurement: MeasurementEvaluation;

  if (!input.hasTestedBP || systolic === null || diastolic === null) {
    measurement = {
      hasMeasurement: false,
      primaryValue: 'Belum ada hasil tekanan darah',
      unit: 'mmHg',
      interpretation: 'Belum ada hasil pengukuran tekanan darah untuk dievaluasi.',
      reason:
        'Pengguna belum melakukan atau belum mencatat hasil pengukuran tekanan darah. Evaluasi diarahkan pada faktor risiko kebiasaan, riwayat, dan keluhan fisik.',
      statusLevel: 'belum_ada',
      clinicalNote:
        'Sangat dianjurkan untuk memeriksa tekanan darah secara rutin di fasilitas kesehatan, apotek, atau Posbindu terdekat.',
    };
  } else {
    // Official Reference: Konsensus Penatalaksanaan Hipertensi PERHI 2021 & Kemenkes RI
    // Sistolik >= 140 ATAU Diastolik >= 90 -> Tekanan Darah Tinggi
    const isSystolicHigh = systolic >= 140;
    const isDiastolicHigh = diastolic >= 90;
    const isHigh = isSystolicHigh || isDiastolicHigh;

    // Normal optimal: < 120 AND < 80
    // Normal pre-hipertensi: 120-139 ATAU 80-89
    const isPreHypertension = !isHigh && (systolic >= 120 || diastolic >= 80);

    const bpDisplay = `${systolic} / ${diastolic}`;

    if (isHigh) {
      let specificReason = '';
      if (isSystolicHigh && isDiastolicHigh) {
        specificReason = `Baik sistolik (${systolic} mmHg) maupun diastolik (${diastolic} mmHg) berada pada atau di atas batas 140/90 mmHg.`;
      } else if (isSystolicHigh) {
        specificReason = `Sistolik (${systolic} mmHg) berada di atas ambang batas 140 mmHg (meskipun diastolik ${diastolic} mmHg masih di bawah 90 mmHg). Hipertensi sistolik terisolasi tetap memerlukan tindak lanjut.`;
      } else {
        specificReason = `Diastolik (${diastolic} mmHg) berada di atas ambang batas 90 mmHg (meskipun sistolik ${systolic} mmHg masih di bawah 140 mmHg). Peningkatan salah satu angka sudah cukup untuk memerlukan tindak lanjut.`;
      }

      measurement = {
        hasMeasurement: true,
        primaryValue: bpDisplay,
        unit: 'mmHg',
        interpretation: 'Tekanan darah berada di atas ambang pemeriksaan awal.',
        reason: `${specificReason} Berdasarkan pedoman PERHI & Kemenkes RI, satu pengukuran tidak otomatis menetapkan diagnosis, namun memerlukan pemeriksaan ulang dan evaluasi dokter.`,
        statusLevel: 'tinggi',
        clinicalNote:
          'Lakukan pemeriksaan ulang pada kondisi tenang (istirahat 5 menit sebelum pengukuran) dan konsultasikan hasilnya kepada tenaga kesehatan di Puskesmas atau klinik.',
      };
    } else if (isPreHypertension) {
      measurement = {
        hasMeasurement: true,
        primaryValue: bpDisplay,
        unit: 'mmHg',
        interpretation: 'Tekanan darah berada pada rentang pra-hipertensi (waspada peningkatan).',
        reason: `Nilai tekanan darah ${bpDisplay} mmHg berada di antara rentang optimal (<120/<80) dan batas hipertensi (140/90). Diperlukan kewaspadaan terhadap pola hidup agar tidak berlanjut naik.`,
        statusLevel: 'perhatian',
        clinicalNote:
          'Kurangi konsumsi garam, kelola stres, dan periksa kembali tekanan darah Anda secara berkala minimal sebulan sekali.',
      };
    } else {
      measurement = {
        hasMeasurement: true,
        primaryValue: bpDisplay,
        unit: 'mmHg',
        interpretation: 'Hasil pengukuran berada dalam rentang tekanan darah normal.',
        reason: `Nilai tekanan darah ${bpDisplay} mmHg memenuhi kriteria optimal (<120/<80 mmHg). Catatan: Hasil normal ini tidak otomatis menghapus faktor risiko kebiasaan atau genetik lainnya bila ada.`,
        statusLevel: 'normal',
        clinicalNote:
          'Pertahankan pola hidup sehat dengan olahraga rutin dan diet seimbang untuk menjaga tekanan darah tetap optimal.',
      };
    }
  }

  // 3. Evaluate Lifestyle & Clinical Risk Factors
  const riskFactors: RiskFactorItem[] = [];

  if (input.familyHistory === 'ya') {
    riskFactors.push({
      id: 'ht-family',
      title: 'Riwayat Hipertensi pada Keluarga Inti',
      explanation:
        'Riwayat tekanan darah tinggi pada orang tua atau saudara kandung mengindikasikan faktor genetik yang membuat dinding pembuluh darah lebih rentan mengalami kekakuan.',
      category: 'riwayat',
    });
  }

  if (bmiCategory === 'berat-berlebih' || bmiCategory === 'obesitas') {
    riskFactors.push({
      id: 'ht-bmi',
      title: `Indeks Massa Tubuh: ${bmiCategoryLabel}`,
      explanation:
        'Kelebihan berat badan membebani kerja pompa jantung dan memicu resistensi vaskular yang meningkatkan tekanan darah.',
      category: 'fisik',
    });
  }

  if (input.saltyFoodHabit === 'sering') {
    riskFactors.push({
      id: 'ht-salt',
      title: 'Kebiasaan Konsumsi Makanan Asin / Tinggi Natrium',
      explanation:
        'Natrium berlebih menahan cairan di dalam pembuluh darah dan membebani kerja jantung. Batasi asupan garam maksimal 1 sendok teh (5 gram) per hari.',
      category: 'gaya_hidup',
    });
  }

  if (input.smokingStatus === 'merokok') {
    riskFactors.push({
      id: 'ht-smoke',
      title: 'Status Merokok Aktif',
      explanation:
        'Nikotin dan zat toksik dalam rokok secara langsung menyebabkan penyempitan pembuluh darah (vasokonstriksi) dan merusak lapisan endotel arteri.',
      category: 'gaya_hidup',
    });
  } else if (input.smokingStatus === 'pernah_merokok') {
    riskFactors.push({
      id: 'ht-exsmoke',
      title: 'Riwayat Merokok di Masa Lalu',
      explanation:
        'Meskipun sudah berhenti, riwayat merokok sebelumnya tetap perlu diperhatikan dalam pemantauan kesehatan kardiovaskular secara berkala.',
      category: 'gaya_hidup',
    });
  }

  if (input.physicalActivity150Min === false) {
    riskFactors.push({
      id: 'ht-activity',
      title: 'Kurang Aktivitas Fisik Teratur',
      explanation:
        'Kurangnya gerak tubuh menurunkan elastisitas pembuluh darah dan kapasitas kerja jantung, sehingga tekanan darah lebih mudah meningkat.',
      category: 'gaya_hidup',
    });
  }

  if (age >= 55) {
    riskFactors.push({
      id: 'ht-age',
      title: 'Faktor Usia (≥55 Tahun)',
      explanation:
        'Secara alami elastisitas dinding pembuluh arteri berkurang seiring bertambahnya usia, sehingga kecenderungan tekanan sistolik meningkat.',
      category: 'fisik',
    });
  }

  const complaintsFound: string[] = [];
  if (input.complaints.tengkukTegang) complaintsFound.push('rasa tegang atau kaku di bagian tengkuk');
  if (input.complaints.pusingBerputar) complaintsFound.push('pusing berputar atau sensasi melayang');
  if (input.complaints.sakitKepalaHebat) complaintsFound.push('sakit kepala parah');

  if (complaintsFound.length > 0) {
    riskFactors.push({
      id: 'ht-complaints',
      title: 'Keluhan Fisik Terlaporkan',
      explanation: `Keluhan fisik yang dirasakan: ${complaintsFound.join(', ')}. Disarankan mengukur tekanan darah saat keluhan muncul untuk memastikan keterkaitannya.`,
      category: 'gejala',
    });
  }

  // 4. Next Steps (Directly aligned with Document Table)
  const nextSteps: string[] = [];

  if (measurement.statusLevel === 'tinggi') {
    nextSteps.push('Konsultasikan hasil tekanan darah ini dan lakukan kontrol rutin ke Puskesmas Karangawen I atau faskes terdekat.');
    nextSteps.push('Mengonsumsi obat antihipertensi secara teratur sesuai anjuran dokter.');
    nextSteps.push('Tidak menghentikan obat tanpa konsultasi dengan dokter, meskipun tekanan darah sudah terasa normal.');
    nextSteps.push('Diet Rendah Garam: Garam maksimal 1 sdt/hari (5 gram). Hindari ikan asin, kerupuk, mie instan, makanan kaleng, fast food, gorengan, jeroan, santan kental, dan kulit ayam. Perbanyak sayur, buah, ikan bakar/kukus, dan tahu tempe kukus.');
    nextSteps.push('Melakukan aktivitas fisik secara teratur (jalan kaki cepat, berenang, bersepeda) 30 menit 5 kali dalam seminggu.');
    nextSteps.push('Menjaga berat badan ideal (target IMT 18,5 - <25,0).');
    nextSteps.push('Menghindari rokok dan paparan asap rokok, serta hindari konsumsi alkohol.');
    nextSteps.push('Mengelola stres dengan baik (bisa dengan meditasi, hobi, dan mendengarkan musik).');
    nextSteps.push('Tidur cukup 7–8 jam per hari, kelola stres, dan jangan begadang.');
    nextSteps.push('Memantau tekanan darah secara berkala ke fasilitas kesehatan.');
    nextSteps.push('Waspada komplikasi jangka panjang: stroke, serangan jantung, gagal ginjal, dan gangguan penglihatan/kebutaan.');
  } else if (measurement.statusLevel === 'perhatian' || (!input.hasTestedBP && (input.familyHistory === 'ya' || input.saltyFoodHabit === 'sering' || input.smokingStatus === 'merokok' || bmiCategory !== 'normal'))) {
    nextSteps.push('Konsumsi makanan rendah garam atau asin (batasi garam maksimal 1 sendok teh per hari).');
    nextSteps.push('Rutin olahraga 150 menit/minggu (jalan cepat, bersepeda santai, atau berenang).');
    nextSteps.push('Manajemen stres dengan baik (meditasi, hobi, dan mendengarkan musik santai).');
    nextSteps.push('Tidur yang cukup 7–8 jam per hari dan hindari kebiasaan begadang.');
    nextSteps.push('Rutin cek tekanan darah secara berkala (lakukan pemantauan 1 minggu sekali selama 1 bulan).');
  } else {
    nextSteps.push('Pertahankan tekanan darah normal dengan rumus CERDIK: Cek tensi 6 bulan sekali, Enyahkan asap rokok & alkohol, Rajin aktivitas fisik (jalan cepat 30 menit x 5/minggu), Diet seimbang, Istirahat cukup 7-8 jam, dan Kelola stres.');
    nextSteps.push('Tetap batasi garam dapur maksimal 1 sendok teh/hari (5 gram).');
    nextSteps.push('Hindari konsumsi makanan asin berlebih (ikan asin, kerupuk, mie instan, makanan kaleng), gorengan & jeroan, serta batasi kopi dan minuman berenergi.');
  }

  // 5. Relevant Education Articles
  const educationIds: string[] = ['edu-ht-basics', 'edu-cerdik', 'edu-ggl', 'edu-kepatuhan-obat'];
  if (input.smokingStatus === 'merokok') {
    educationIds.push('edu-cerdik');
  }
  if (redFlags.isTriggered) {
    educationIds.push('edu-tanda-bahaya');
  }

  return {
    id: `ht_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    checkupType: 'hipertensi',
    profile: {
      age,
      gender: input.gender,
      weight,
      height,
      bmi: bmiValue,
      bmiFormatted,
      bmiCategory,
      bmiCategoryLabel,
    },
    redFlags,
    measurement,
    riskFactors,
    nextSteps,
    educationIds,
    disclaimer: DISCLAIMER_TEXT,
    rawInput: input,
  };
}

