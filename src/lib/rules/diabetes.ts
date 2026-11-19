import {
  DiabetesFormInput,
  EvaluationResult,
  MeasurementEvaluation,
  RedFlagAlert,
  RiskFactorItem,
} from '../types';
import { calculateBMI } from './bmi';

const DISCLAIMER_TEXT =
  'Hasil ini membantu pemantauan awal dan tidak menggantikan pemeriksaan tenaga kesehatan. Diagnosis resmi hanya dapat ditegakkan oleh dokter melalui pemeriksaan klinis dan konfirmasi laboratorium.';

export function evaluateDiabetes(input: DiabetesFormInput): EvaluationResult {
  const age = typeof input.age === 'number' ? input.age : 0;
  const weight = typeof input.weight === 'number' ? input.weight : 0;
  const height = typeof input.height === 'number' ? input.height : 0;

  const bmiResult = calculateBMI(weight, height);
  const bmiValue = bmiResult?.value ?? 0;
  const bmiFormatted = bmiResult?.formatted ?? '-';
  const bmiCategory = bmiResult?.category ?? 'normal';
  const bmiCategoryLabel = bmiResult?.label ?? '-';

  // 1. Check for Tanda Bahaya (Red Flags)
  const redFlagSymptoms: string[] = [];
  const glucoseVal = typeof input.glucoseValue === 'number' && !isNaN(input.glucoseValue) ? input.glucoseValue : null;

  if (glucoseVal !== null && glucoseVal < 70) {
    redFlagSymptoms.push(`Kadar gula darah sangat rendah (${glucoseVal} mg/dL) — potensi hipoglikemia.`);
  }

  if (input.symptoms.keringatDinginGemetar) {
    redFlagSymptoms.push('Gejala lemas mendadak, gemetar, dan keringat dingin hebat.');
  }

  if (glucoseVal !== null && glucoseVal >= 300) {
    redFlagSymptoms.push(`Kadar gula darah sangat tinggi (${glucoseVal} mg/dL).`);
  }

  if (input.symptoms.mualMuntahNapasCepat) {
    redFlagSymptoms.push('Mual, muntah terus-menerus, atau napas cepat dan dalam (waspada komplikasi akut).');
  }

  let redFlags: RedFlagAlert;
  if (redFlagSymptoms.length > 0) {
    redFlags = {
      isTriggered: true,
      title: 'Tanda Bahaya Medis Terdeteksi',
      message:
        'Ditemukan kondisi atau gejala yang memerlukan pertolongan tenaga medis segera. Jangan menunda penanganan.',
      action:
        'Segera hubungi atau datangi Instalasi Gawat Darurat (IGD) atau Puskesmas/fasilitas kesehatan terdekat. Jangan mengonsumsi obat sembarangan.',
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

  if (!input.hasTestedGlucose || glucoseVal === null) {
    measurement = {
      hasMeasurement: false,
      primaryValue: 'Belum ada data laboratorium',
      unit: 'mg/dL',
      interpretation: 'Belum ada hasil pemeriksaan laboratorium untuk dinilai.',
      reason:
        'Pengguna belum melakukan atau belum memasukkan hasil tes glukosa darah. Evaluasi difokuskan pada faktor risiko kebiasaan dan gejala.',
      statusLevel: 'belum_ada',
      clinicalNote:
        'Jika Anda memiliki faktor risiko atau gejala terkait, pertimbangkan melakukan pemeriksaan gula darah di fasilitas kesehatan terdekat.',
    };
  } else if (input.testType === 'gdp') {
    // Check fasting condition
    if (input.fasting8Hours === false) {
      measurement = {
        hasMeasurement: true,
        primaryValue: `${glucoseVal}`,
        unit: 'mg/dL',
        interpretation: 'Syarat puasa belum terpenuhi, interpretasi GDP tidak dapat diterapkan.',
        reason:
          'Pemeriksaan Gula Darah Puasa (GDP) mewajibkan puasa kalori minimal 8 jam. Karena syarat belum terpenuhi, nilai ini tidak dapat dinilai sebagai GDP yang valid.',
        statusLevel: 'perhatian',
        clinicalNote:
          'Lakukan pemeriksaan ulang dengan berpuasa (hanya boleh minum air putih tanpa kalori) selama minimal 8 jam.',
      };
    } else if (glucoseVal < 70) {
      measurement = {
        hasMeasurement: true,
        primaryValue: `${glucoseVal}`,
        unit: 'mg/dL',
        interpretation: 'Hasil gula darah puasa rendah (hipoglikemia).',
        reason:
          'Kadar glukosa di bawah 70 mg/dL tergolong rendah dan bukan rentang normal. Kondisi ini memerlukan asupan glukosa cepat dan evaluasi nakes.',
        statusLevel: 'rendah',
        clinicalNote:
          'Bila timbul gemetar, pusing, atau keringat dingin, segera konsumsi sumber gula cepat (misalnya 1 sendok makan gula atau segelas teh manis hangat).',
      };
    } else if (glucoseVal < 100) {
      measurement = {
        hasMeasurement: true,
        primaryValue: `${glucoseVal}`,
        unit: 'mg/dL',
        interpretation: 'Hasil pemeriksaan awal berada dalam rentang rujukan puasa normal.',
        reason:
          'Berdasarkan konsensus PERKENI, kadar GDP normal berkisar antara 70–99 mg/dL setelah puasa kalori minimal 8 jam.',
        statusLevel: 'normal',
        clinicalNote:
          'Tetap jaga pola makan bergizi seimbang dan aktivitas fisik teratur untuk mempertahankan kadar gula darah sehat.',
      };
    } else if (glucoseVal < 126) {
      measurement = {
        hasMeasurement: true,
        primaryValue: `${glucoseVal}`,
        unit: 'mg/dL',
        interpretation: 'Hasil berada pada rentang yang memerlukan perhatian dan pemeriksaan lanjutan.',
        reason:
          'Kadar GDP antara 100 sampai <126 mg/dL tergolong Glukosa Darah Puasa Terganggu (Prediabetes). Ini adalah sinyal peringatan dini.',
        statusLevel: 'perhatian',
        clinicalNote:
          'Sangat disarankan berkonsultasi dengan dokter di Puskesmas atau klinik untuk konfirmasi serta pencegahan progresi ke diabetes.',
      };
    } else {
      measurement = {
        hasMeasurement: true,
        primaryValue: `${glucoseVal}`,
        unit: 'mg/dL',
        interpretation: 'Hasil gula darah puasa tinggi dan memerlukan evaluasi tenaga kesehatan.',
        reason:
          'Kadar GDP ≥126 mg/dL pada pemeriksaan laboratorium memerlukan pemeriksaan konfirmasi medis untuk evaluasi kemungkinan diabetes melitus.',
        statusLevel: 'tinggi',
        clinicalNote:
          'Jadwalkan konsultasi dengan dokter untuk pemeriksaan darah ulang dan penatalaksanaan medis yang sesuai.',
      };
    }
  } else {
    // testType is 'gds' (Sewaktu)
    if (glucoseVal < 70) {
      measurement = {
        hasMeasurement: true,
        primaryValue: `${glucoseVal}`,
        unit: 'mg/dL',
        interpretation: 'Hasil gula darah sewaktu rendah (hipoglikemia).',
        reason:
          'Nilai gula darah di bawah 70 mg/dL tergolong rendah dan berbahaya jika disertai gejala kelemahan sistem saraf.',
        statusLevel: 'rendah',
        clinicalNote:
          'Konsumsi sumber gula segera bila lemas atau gemetar. Hubungi fasilitas kesehatan jika tidak membaik.',
      };
    } else if (glucoseVal < 200) {
      measurement = {
        hasMeasurement: true,
        primaryValue: `${glucoseVal}`,
        unit: 'mg/dL',
        interpretation: 'Hasil gula darah sewaktu di bawah ambang 200 mg/dL.',
        reason:
          'GDS <200 mg/dL tidak otomatis berarti Anda normal atau bebas dari risiko diabetes, karena kadar gula sewaktu sangat dipengaruhi jeda dan porsi makan terakhir.',
        statusLevel: 'normal',
        clinicalNote:
          'Untuk penilaian yang lebih akurat, disarankan melakukan pemeriksaan Gula Darah Puasa (GDP) atau HbA1c di fasilitas kesehatan terdekat.',
      };
    } else {
      measurement = {
        hasMeasurement: true,
        primaryValue: `${glucoseVal}`,
        unit: 'mg/dL',
        interpretation: 'Hasil gula darah sewaktu tinggi dan memerlukan evaluasi tenaga kesehatan.',
        reason:
          'Kadar GDS ≥200 mg/dL yang disertai gejala klasik (sering kencing, sering haus, berat badan turun) mengarah kuat pada kemungkinan diabetes dan perlu evaluasi nakes.',
        statusLevel: 'tinggi',
        clinicalNote:
          'Lakukan pemeriksaan konfirmasi ke dokter atau Puskesmas untuk evaluasi lebih komprehensif.',
      };
    }
  }

  // 3. Evaluate Lifestyle & Clinical Risk Factors (Separated from measurement)
  const riskFactors: RiskFactorItem[] = [];

  if (input.familyHistory === 'ya') {
    riskFactors.push({
      id: 'dm-family',
      title: 'Riwayat Diabetes pada Keluarga Inti',
      explanation:
        'Memiliki orang tua atau saudara kandung dengan diabetes meningkatkan kecenderungan genetik terhadap resistensi insulin.',
      category: 'riwayat',
    });
  }

  if (bmiCategory === 'berat-berlebih' || bmiCategory === 'obesitas') {
    riskFactors.push({
      id: 'dm-bmi',
      title: `Indeks Massa Tubuh: ${bmiCategoryLabel}`,
      explanation:
        'Penumpukan lemak tubuh, terutama di area perut, berkaitan erat dengan peningkatan resistensi insulin pada jaringan tubuh.',
      category: 'fisik',
    });
  }

  if (age >= 45) {
    riskFactors.push({
      id: 'dm-age',
      title: 'Faktor Usia (≥45 Tahun)',
      explanation:
        'Risiko gangguan toleransi glukosa meningkat seiring pertambahan usia akibat penurunan fungsi sel beta pankreas secara bertahap.',
      category: 'fisik',
    });
  }

  if (input.sweetIntake === 'sering') {
    riskFactors.push({
      id: 'dm-sweet',
      title: 'Kebiasaan Konsumsi Manis yang Sering',
      explanation:
        'Asupan gula berlebih secara rutin memicu lonjakan glukosa darah dan meningkatkan risiko obesitas serta resistensi insulin.',
      category: 'gaya_hidup',
    });
  }

  if (input.physicalActivity150Min === false) {
    riskFactors.push({
      id: 'dm-activity',
      title: 'Kurang Aktivitas Fisik Rutin',
      explanation:
        'Aktivitas fisik kurang dari 150 menit per minggu mengurangi sensitivitas sel otot dalam menyerap dan menggunakan glukosa darah.',
      category: 'gaya_hidup',
    });
  }

  const symptomsFound: string[] = [];
  if (input.symptoms.seringHaus) symptomsFound.push('sering merasa sangat haus (polidipsia)');
  if (input.symptoms.seringKencing) symptomsFound.push('sering buang air kecil terutama malam hari (poliuria)');
  if (input.symptoms.turunBBDini) symptomsFound.push('penurunan berat badan tanpa sebab yang jelas');
  if (input.symptoms.lemasMudahLelah) symptomsFound.push('badan mudah lelah dan lemas');
  if (input.symptoms.lukaSulitSembuh) symptomsFound.push('luka pada kulit lambat sembuh');
  if (input.symptoms.kesemutan) symptomsFound.push('kesemutan atau baal pada ujung jari');

  if (symptomsFound.length > 0) {
    riskFactors.push({
      id: 'dm-symptoms',
      title: 'Keluhan / Gejala Khas Terlaporkan',
      explanation: `Anda melaporkan gejala: ${symptomsFound.join(', ')}. Gejala ini merupakan tanda awal yang lazim dijumpai pada gangguan kadar gula darah.`,
      category: 'gejala',
    });
  }

  // 4. Next Steps
  const nextSteps: string[] = [];

  if (redFlags.isTriggered) {
    nextSteps.push('Prioritas utama: Segera kunjungi IGD atau Puskesmas untuk evaluasi kondisi gawat darurat.');
  }

  if (measurement.statusLevel === 'tinggi' || measurement.statusLevel === 'perhatian') {
    nextSteps.push(
      'Jadwalkan kunjungan ke dokter atau Puskesmas untuk pemeriksaan ulang (GDP, HbA1c, atau TTGO) secara terstandar.'
    );
  } else if (!input.hasTestedGlucose) {
    nextSteps.push(
      'Pertimbangkan melakukan pemeriksaan gula darah di fasilitas kesehatan terdekat, terutama bila Anda memiliki faktor risiko keluarga atau IMT berlebih.'
    );
  }

  nextSteps.push('Terapkan prinsip makan 3J (Jadwal, Jumlah, Jenis) dan batasi konsumsi gula maksimal 4 sendok makan (50 gram) per hari.');
  nextSteps.push('Lakukan aktivitas fisik aerobik ringan hingga sedang minimal 150 menit setiap minggu (misalnya jalan cepat 30 menit, 5 hari seminggu).');
  nextSteps.push('Bila memiliki anggota keluarga dengan diabetes, diskusikan pola hidup sehat bersama untuk pencegahan dini.');

  // 5. Relevant Education Articles
  const educationIds: string[] = ['edu-dm-basics', 'edu-cerdik', 'edu-prinsip-3j', 'edu-ggl'];
  if (input.symptoms.kesemutan || input.symptoms.lukaSulitSembuh) {
    educationIds.push('edu-perawatan-kaki');
  }
  if (redFlags.isTriggered) {
    educationIds.push('edu-tanda-bahaya');
  }

  return {
    id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    checkupType: 'diabetes',
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

