/**
 * PANTAS Clinical Screening Rules Test Suite
 * Covers all validation criteria from Section 13 of the specification.
 */

import { calculateBMI, parseIndonesianNumber } from '../src/lib/rules/bmi';
import { evaluateDiabetes } from '../src/lib/rules/diabetes';
import { evaluateHipertensi } from '../src/lib/rules/hypertension';
import { DiabetesFormInput, HipertensiFormInput } from '../src/lib/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('\n--- 1. Testing IMT (BMI) Boundaries ---');
// Batas IMT 18,5; 25; dan 27
// Height 1.7m:
// 53.4 kg -> 18.477 (< 18.5 => Kurus)
const bmiUnder = calculateBMI(53.4, 170);
assert(bmiUnder !== null && bmiUnder.category === 'kurus', 'IMT < 18.5 diklasifikasikan sebagai Kurus');

// 53.5 kg -> 18.512 (>= 18.5 and < 25 => Normal)
const bmiNormal = calculateBMI(53.5, 170);
assert(bmiNormal !== null && bmiNormal.category === 'normal', 'IMT 18.5 diklasifikasikan sebagai Normal');

// 72.2 kg -> 24.98 (< 25 => Normal)
const bmiNormalUpper = calculateBMI(72.2, 170);
assert(bmiNormalUpper !== null && bmiNormalUpper.category === 'normal', 'IMT 24.98 diklasifikasikan sebagai Normal');

// 72.3 kg -> 25.01 (>= 25 and < 27 => Berat Badan Berlebih)
const bmiOver = calculateBMI(72.3, 170);
assert(bmiOver !== null && bmiOver.category === 'berat-berlebih', 'IMT 25.0 diklasifikasikan sebagai Berat Badan Berlebih');

// 77.9 kg -> 26.95 (< 27 => Berat Badan Berlebih)
const bmiOverUpper = calculateBMI(77.9, 170);
assert(bmiOverUpper !== null && bmiOverUpper.category === 'berat-berlebih', 'IMT 26.95 diklasifikasikan sebagai Berat Badan Berlebih');

// 78.1 kg -> 27.02 (>= 27 => Obesitas)
const bmiObese = calculateBMI(78.1, 170);
assert(bmiObese !== null && bmiObese.category === 'obesitas', 'IMT >= 27 diklasifikasikan sebagai Obesitas');

// Test Indonesian number comma parsing
assert(parseIndonesianNumber('65,5') === 65.5, 'Parsing desimal koma Indonesia (65,5 -> 65.5)');
assert(parseIndonesianNumber(' 170.2 ') === 170.2, 'Parsing desimal titik dengan spasi');

console.log('\n--- 2. Testing Diabetes Rules & Edge Cases ---');
const baseDmInput: DiabetesFormInput = {
  age: 40,
  gender: 'laki-laki',
  weight: 65,
  height: 170,
  familyHistory: 'tidak',
  sweetIntake: 'jarang',
  physicalActivity150Min: true,
  hasTestedGlucose: true,
  testType: 'gdp',
  glucoseValue: 90,
  testDate: '2026-11-17',
  fasting8Hours: true,
  symptoms: {
    seringHaus: false,
    seringKencing: false,
    turunBBDini: false,
    lemasMudahLelah: false,
    lukaSulitSembuh: false,
    kesemutan: false,
    keringatDinginGemetar: false,
    mualMuntahNapasCepat: false,
  },
};

// GDP 99 -> Normal
const resGdp99 = evaluateDiabetes({ ...baseDmInput, glucoseValue: 99 });
assert(resGdp99.measurement.statusLevel === 'normal', 'GDP 99 mg/dL berada dalam status normal');

// GDP 100 -> Perhatian (Prediabetes)
const resGdp100 = evaluateDiabetes({ ...baseDmInput, glucoseValue: 100 });
assert(
  resGdp100.measurement.statusLevel === 'perhatian',
  'GDP 100 mg/dL masuk status perhatian dan pemeriksaan lanjutan (Prediabetes)'
);

// GDP 125 -> Perhatian
const resGdp125 = evaluateDiabetes({ ...baseDmInput, glucoseValue: 125 });
assert(
  resGdp125.measurement.statusLevel === 'perhatian',
  'GDP 125 mg/dL tetap masuk status perhatian'
);

// GDP 126 -> Tinggi (Perlu evaluasi nakes)
const resGdp126 = evaluateDiabetes({ ...baseDmInput, glucoseValue: 126 });
assert(
  resGdp126.measurement.statusLevel === 'tinggi',
  'GDP 126 mg/dL masuk status tinggi & perlu evaluasi nakes'
);

// Gula Darah Rendah (< 70 mg/dL) TIDAK boleh masuk kategori normal
const resGdp65 = evaluateDiabetes({ ...baseDmInput, glucoseValue: 65 });
assert(
  resGdp65.measurement.statusLevel === 'rendah',
  'Gula darah < 70 mg/dL (65 mg/dL) diklasifikasikan sebagai RENDAH, bukan normal'
);
assert(
  resGdp65.redFlags.isTriggered === true,
  'Kadar glukosa < 70 memicu peringatan tanda bahaya hipoglikemia'
);

// GDS 199 mg/dL TIDAK otomatis diberi status normal sepihak
const resGds199 = evaluateDiabetes({ ...baseDmInput, testType: 'gds', glucoseValue: 199 });
assert(
  resGds199.measurement.reason.includes('tidak otomatis berarti Anda normal atau bebas dari risiko diabetes'),
  'GDS 199 mg/dL menegaskan bahwa nilai sewaktu < 200 tidak otomatis bebas dari risiko diabetes'
);

// Jika syarat puasa tidak terpenuhi pada GDP, jangan terapkan interpretasi GDP
const resGdpNoFast = evaluateDiabetes({ ...baseDmInput, testType: 'gdp', glucoseValue: 115, fasting8Hours: false });
assert(
  resGdpNoFast.measurement.interpretation.includes('Syarat puasa belum terpenuhi'),
  'Jika puasa 8 jam belum terpenuhi, interpretasi GDP tidak diterapkan'
);

// Pemeriksaan tanpa hasil laboratorium TIDAK menghasilkan diagnosis
const resDmNoTest = evaluateDiabetes({ ...baseDmInput, hasTestedGlucose: false, glucoseValue: '' });
assert(
  resDmNoTest.measurement.hasMeasurement === false && resDmNoTest.measurement.statusLevel === 'belum_ada',
  'Pemeriksaan tanpa tes gula darah tidak menghasilkan nilai lab atau diagnosis'
);

console.log('\n--- 3. Testing Hypertension Rules & Edge Cases ---');
const baseHtInput: HipertensiFormInput = {
  age: 45,
  gender: 'perempuan',
  weight: 60,
  height: 160,
  familyHistory: 'tidak',
  saltyFoodHabit: 'jarang',
  physicalActivity150Min: true,
  smokingStatus: 'tidak_pernah',
  hasTestedBP: true,
  systolic: 120,
  diastolic: 80,
  testDate: '2026-11-17',
  complaints: {
    sakitKepalaHebat: false,
    pusingBerputar: false,
    tengkukTegang: false,
    nyeriDada: false,
    sesakNapas: false,
    pandanganKabur: false,
  },
};

// Tekanan darah 150/85 (Sistolik tinggi saja) -> TETAP memerlukan tindak lanjut
const resHt150_85 = evaluateHipertensi({ ...baseHtInput, systolic: 150, diastolic: 85 });
assert(
  resHt150_85.measurement.statusLevel === 'tinggi',
  'Tekanan darah 150/85 mmHg (sistolik tinggi saja) berstatus tinggi & memerlukan tindak lanjut'
);

// Tekanan darah 135/95 (Diastolik tinggi saja) -> TETAP memerlukan tindak lanjut
const resHt135_95 = evaluateHipertensi({ ...baseHtInput, systolic: 135, diastolic: 95 });
assert(
  resHt135_95.measurement.statusLevel === 'tinggi',
  'Tekanan darah 135/95 mmHg (diastolik tinggi saja) berstatus tinggi & memerlukan tindak lanjut'
);

// Tekanan darah normal optimal (<120/<80)
const resHtNormal = evaluateHipertensi({ ...baseHtInput, systolic: 115, diastolic: 75 });
assert(
  resHtNormal.measurement.statusLevel === 'normal',
  'Tekanan darah 115/75 mmHg berstatus normal'
);

// Pemeriksaan tanpa hasil pengukuran tekanan darah
const resHtNoTest = evaluateHipertensi({ ...baseHtInput, hasTestedBP: false, systolic: '', diastolic: '' });
assert(
  resHtNoTest.measurement.hasMeasurement === false && resHtNoTest.measurement.statusLevel === 'belum_ada',
  'Pemeriksaan tanpa hasil tensi menampilkan belum ada hasil dan tidak mendiagnosis'
);

console.log('\n--- 4. Testing Red Flags & Emergency Prioritization ---');
// Tanda bahaya krisis hipertensi (>=180 or >=120)
const resHtCrisis = evaluateHipertensi({ ...baseHtInput, systolic: 185, diastolic: 110 });
assert(
  resHtCrisis.redFlags.isTriggered === true,
  'Sistolik 185 mmHg memicu kondisi tanda bahaya krisis hipertensi'
);

// Gejala darurat (nyeri dada) memicu tanda bahaya meski tensi belum dites
const resHtChestPain = evaluateHipertensi({
  ...baseHtInput,
  hasTestedBP: false,
  systolic: '',
  diastolic: '',
  complaints: { ...baseHtInput.complaints, nyeriDada: true },
});
assert(
  resHtChestPain.redFlags.isTriggered === true,
  'Keluhan nyeri dada memicu peringatan darurat medis meskipun belum ada angka tensi'
);

console.log('\n🎉 ALL 18 CLINICAL RULES & BOUNDARY TESTS PASSED SUCCESSFULLY!\n');

