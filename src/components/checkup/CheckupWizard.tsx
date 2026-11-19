'use client';

import React, { useState, useMemo } from 'react';
import {
  Heart,
  Droplet,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import {
  CheckupType,
  DiabetesFormInput,
  HipertensiFormInput,
  EvaluationResult,
  Gender,
  FamilyHistory,
  Frequency,
  SmokingStatus,
} from '@/lib/types';
import { calculateBMI, parseIndonesianNumber } from '@/lib/rules/bmi';
import { evaluateDiabetes } from '@/lib/rules/diabetes';
import { evaluateHipertensi } from '@/lib/rules/hypertension';
import { ResultView } from './ResultView';

interface CheckupWizardProps {
  initialType?: CheckupType;
}

const TOTAL_STEPS = 4;
const STEP_TITLES = [
  'Data Diri & Fisik',
  'Kebiasaan & Riwayat',
  'Hasil Pengukuran',
  'Konfirmasi & Ringkasan',
];

export function CheckupWizard({ initialType }: CheckupWizardProps) {
  // Checkup type selector if not provided
  const [checkupType, setCheckupType] = useState<CheckupType>(initialType || 'diabetes');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  // Common Profile State (using strings for inputs to allow comma typing)
  const [ageStr, setAgeStr] = useState<string>('');
  const [gender, setGender] = useState<Gender>('laki-laki');
  const [weightStr, setWeightStr] = useState<string>('');
  const [heightStr, setHeightStr] = useState<string>('');

  // Diabetes specific State
  const [dmFamilyHistory, setDmFamilyHistory] = useState<FamilyHistory>('tidak_tahu');
  const [sweetIntake, setSweetIntake] = useState<Frequency>('kadang');
  const [dmPhysicalActivity, setDmPhysicalActivity] = useState<boolean | null>(null);
  const [hasTestedGlucose, setHasTestedGlucose] = useState<boolean | null>(null);
  const [testType, setTestType] = useState<'gdp' | 'gds' | ''>('');
  const [glucoseValStr, setGlucoseValStr] = useState<string>('');
  const [glucoseDate, setGlucoseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fasting8Hours, setFasting8Hours] = useState<boolean | null>(null);
  const [dmSymptoms, setDmSymptoms] = useState({
    seringHaus: false,
    seringKencing: false,
    turunBBDini: false,
    lemasMudahLelah: false,
    lukaSulitSembuh: false,
    kesemutan: false,
    keringatDinginGemetar: false,
    mualMuntahNapasCepat: false,
  });

  // Hipertensi specific State
  const [htFamilyHistory, setHtFamilyHistory] = useState<FamilyHistory>('tidak_tahu');
  const [saltyFoodHabit, setSaltyFoodHabit] = useState<Frequency>('kadang');
  const [htPhysicalActivity, setHtPhysicalActivity] = useState<boolean | null>(null);
  const [smokingStatus, setSmokingStatus] = useState<SmokingStatus>('tidak_pernah');
  const [hasTestedBP, setHasTestedBP] = useState<boolean | null>(null);
  const [systolicStr, setSystolicStr] = useState<string>('');
  const [diastolicStr, setDiastolicStr] = useState<string>('');
  const [bpDate, setBpDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [htComplaints, setHtComplaints] = useState({
    sakitKepalaHebat: false,
    pusingBerputar: false,
    tengkukTegang: false,
    nyeriDada: false,
    sesakNapas: false,
    pandanganKabur: false,
  });

  // Errors per step
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculated BMI
  const bmiCalc = useMemo(() => {
    const w = parseIndonesianNumber(weightStr);
    const h = parseIndonesianNumber(heightStr);
    if (w && h && w > 0 && h > 0) {
      return calculateBMI(w, h);
    }
    return null;
  }, [weightStr, heightStr]);

  // Validation per step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      const ageNum = parseIndonesianNumber(ageStr);
      if (!ageNum || ageNum <= 0) {
        newErrors.age = 'Masukkan umur yang valid dalam angka (tahun).';
      } else if (ageNum < 18) {
        newErrors.age = 'PANTAS dirancang khusus untuk pemantauan dewasa (≥18 tahun).';
      } else if (ageNum > 120) {
        newErrors.age = 'Mohon periksa kembali umur yang Anda masukkan.';
      }

      const weightNum = parseIndonesianNumber(weightStr);
      if (!weightNum || weightNum <= 0) {
        newErrors.weight = 'Masukkan berat badan dalam kg (misal: 62 atau 62,5).';
      } else if (weightNum < 25 || weightNum > 300) {
        newErrors.weight = 'Nilai berat badan di luar rentang lazim. Mohon periksa kembali.';
      }

      const heightNum = parseIndonesianNumber(heightStr);
      if (!heightNum || heightNum <= 0) {
        newErrors.height = 'Masukkan tinggi badan dalam cm (misal: 165).';
      } else if (heightNum < 100 || heightNum > 250) {
        newErrors.height = 'Nilai tinggi badan di luar rentang lazim. Mohon periksa kembali.';
      }
    }

    if (step === 2) {
      if (checkupType === 'diabetes') {
        if (dmPhysicalActivity === null) {
          newErrors.dmPhysicalActivity = 'Pilih apakah aktivitas fisik Anda mencapai 150 menit per minggu.';
        }
      } else {
        if (htPhysicalActivity === null) {
          newErrors.htPhysicalActivity = 'Pilih apakah aktivitas fisik Anda mencapai 150 menit per minggu.';
        }
      }
    }

    if (step === 3) {
      if (checkupType === 'diabetes') {
        if (hasTestedGlucose === null) {
          newErrors.hasTestedGlucose = 'Pilih apakah Anda pernah melakukan pemeriksaan gula darah.';
        } else if (hasTestedGlucose === true) {
          if (!testType) {
            newErrors.testType = 'Pilih jenis pemeriksaan (GDP atau GDS).';
          }
          const val = parseIndonesianNumber(glucoseValStr);
          if (val === null || val <= 0) {
            newErrors.glucoseValue = 'Masukkan nilai gula darah dalam mg/dL.';
          } else if (val < 20 || val > 1000) {
            newErrors.glucoseValue = 'Nilai tidak lazim. Mohon periksa kembali hasil tes darah Anda.';
          }
          if (testType === 'gdp' && fasting8Hours === null) {
            newErrors.fasting8Hours = 'Konfirmasikan apakah Anda berpuasa minimal 8 jam sebelum tes.';
          }
        }
      } else {
        if (hasTestedBP === null) {
          newErrors.hasTestedBP = 'Pilih apakah Anda sudah melakukan pengukuran tekanan darah.';
        } else if (hasTestedBP === true) {
          const sys = parseIndonesianNumber(systolicStr);
          const dia = parseIndonesianNumber(diastolicStr);

          if (sys === null || sys <= 0) {
            newErrors.systolic = 'Masukkan angka sistolik (angka atas, misal: 120).';
          } else if (sys < 50 || sys > 300) {
            newErrors.systolic = 'Nilai sistolik tidak lazim. Mohon periksa kembali.';
          }

          if (dia === null || dia <= 0) {
            newErrors.diastolic = 'Masukkan angka diastolik (angka bawah, misal: 80).';
          } else if (dia < 30 || dia > 200) {
            newErrors.diastolic = 'Nilai diastolik tidak lazim. Mohon periksa kembali.';
          }

          if (sys !== null && dia !== null && sys <= dia) {
            newErrors.systolic = 'Angka sistolik biasanya lebih besar daripada diastolik.';
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleSubmitEvaluation();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitEvaluation = () => {
    const age = parseIndonesianNumber(ageStr) || 0;
    const weight = parseIndonesianNumber(weightStr) || 0;
    const height = parseIndonesianNumber(heightStr) || 0;

    if (checkupType === 'diabetes') {
      const glucoseVal = parseIndonesianNumber(glucoseValStr);
      const dmInput: DiabetesFormInput = {
        age,
        gender,
        weight,
        height,
        familyHistory: dmFamilyHistory,
        sweetIntake,
        physicalActivity150Min: dmPhysicalActivity,
        hasTestedGlucose,
        testType,
        glucoseValue: glucoseVal ?? '',
        testDate: glucoseDate,
        fasting8Hours,
        symptoms: dmSymptoms,
      };
      const res = evaluateDiabetes(dmInput);
      setResult(res);
    } else {
      const sys = parseIndonesianNumber(systolicStr);
      const dia = parseIndonesianNumber(diastolicStr);
      const htInput: HipertensiFormInput = {
        age,
        gender,
        weight,
        height,
        familyHistory: htFamilyHistory,
        saltyFoodHabit,
        physicalActivity150Min: htPhysicalActivity,
        smokingStatus,
        hasTestedBP,
        systolic: sys ?? '',
        diastolic: dia ?? '',
        testDate: bpDate,
        complaints: htComplaints,
      };
      const res = evaluateHipertensi(htInput);
      setResult(res);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setResult(null);
    setCurrentStep(1);
    setErrors({});
  };

  // If result is generated, render ResultView
  if (result) {
    return <ResultView result={result} onReset={handleReset} />;
  }

  return (
    <div className="space-y-6">
      {/* Type Switcher Banner (if user wants to toggle between Diabetes and Hipertensi) */}
      <div className="bg-white p-3 border border-pantas-border rounded-lg flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-semibold text-pantas-muted uppercase tracking-wider">
          Jenis Pemeriksaan Aktif:
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setCheckupType('diabetes');
              setCurrentStep(1);
            }}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              checkupType === 'diabetes'
                ? 'bg-pantas-primary text-white'
                : 'text-pantas-muted hover:text-pantas-dark bg-pantas-soft/50'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>Diabetes Melitus</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCheckupType('hipertensi');
              setCurrentStep(1);
            }}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              checkupType === 'hipertensi'
                ? 'bg-pantas-primary text-white'
                : 'text-pantas-muted hover:text-pantas-dark bg-pantas-soft/50'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Hipertensi (Tekanan Darah)</span>
          </button>
        </div>
      </div>

      {/* Progress Steps Header */}
      <div className="bg-white p-5 border border-pantas-border rounded-lg shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-pantas-muted">
          <span>Langkah {currentStep} dari {TOTAL_STEPS}: <strong>{STEP_TITLES[currentStep - 1]}</strong></span>
          <span>{Math.round((currentStep / TOTAL_STEPS) * 100)}% Selesai</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-pantas-soft rounded-full h-2 overflow-hidden">
          <div
            className="bg-pantas-primary h-2 transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: DATA DIRI & FISIK */}
      {currentStep === 1 && (
        <section className="p-6 bg-white border border-pantas-border rounded-lg shadow-sm space-y-6">
          <div className="border-b border-pantas-border pb-3">
            <h2 className="text-xl font-bold text-pantas-dark">Langkah 1: Data Diri dan Pengukuran Fisik</h2>
            <p className="text-sm text-pantas-muted mt-1 leading-relaxed">
              Informasi tubuh digunakan untuk menghitung Indeks Massa Tubuh (IMT) secara otomatis sesuai standar Kementerian Kesehatan RI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Umur */}
            <div>
              <label htmlFor="input-age" className="block text-sm font-semibold text-pantas-dark mb-1">
                Umur (Tahun) <span className="text-pantas-red">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-age"
                  type="number"
                  min="18"
                  max="120"
                  value={ageStr}
                  onChange={(e) => {
                    setAgeStr(e.target.value);
                    if (errors.age) setErrors((prev) => ({ ...prev, age: '' }));
                  }}
                  placeholder="Contoh: 45"
                  className="w-full px-3.5 py-2.5 border border-pantas-border rounded text-sm text-pantas-dark focus:border-pantas-primary"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-pantas-muted">tahun</span>
              </div>
              {errors.age && (
                <p className="text-xs text-pantas-red mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.age}</span>
                </p>
              )}
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-sm font-semibold text-pantas-dark mb-1">
                Jenis Kelamin <span className="text-pantas-red">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('laki-laki')}
                  className={`py-2.5 px-3 rounded text-sm font-medium border text-center transition-colors ${
                    gender === 'laki-laki'
                      ? 'bg-pantas-soft text-pantas-primary border-pantas-primary font-semibold'
                      : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                  }`}
                >
                  Laki-laki
                </button>
                <button
                  type="button"
                  onClick={() => setGender('perempuan')}
                  className={`py-2.5 px-3 rounded text-sm font-medium border text-center transition-colors ${
                    gender === 'perempuan'
                      ? 'bg-pantas-soft text-pantas-primary border-pantas-primary font-semibold'
                      : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                  }`}
                >
                  Perempuan
                </button>
              </div>
            </div>

            {/* Berat Badan */}
            <div>
              <label htmlFor="input-weight" className="block text-sm font-semibold text-pantas-dark mb-1">
                Berat Badan (kg) <span className="text-pantas-red">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-weight"
                  type="text"
                  inputMode="decimal"
                  value={weightStr}
                  onChange={(e) => {
                    setWeightStr(e.target.value);
                    if (errors.weight) setErrors((prev) => ({ ...prev, weight: '' }));
                  }}
                  placeholder="Contoh: 65 atau 65,5"
                  className="w-full px-3.5 py-2.5 border border-pantas-border rounded text-sm text-pantas-dark focus:border-pantas-primary"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-pantas-muted">kg</span>
              </div>
              <span className="text-[11px] text-pantas-muted mt-0.5 block">
                Bisa menggunakan koma atau titik untuk desimal.
              </span>
              {errors.weight && (
                <p className="text-xs text-pantas-red mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.weight}</span>
                </p>
              )}
            </div>

            {/* Tinggi Badan */}
            <div>
              <label htmlFor="input-height" className="block text-sm font-semibold text-pantas-dark mb-1">
                Tinggi Badan (cm) <span className="text-pantas-red">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-height"
                  type="number"
                  value={heightStr}
                  onChange={(e) => {
                    setHeightStr(e.target.value);
                    if (errors.height) setErrors((prev) => ({ ...prev, height: '' }));
                  }}
                  placeholder="Contoh: 165"
                  className="w-full px-3.5 py-2.5 border border-pantas-border rounded text-sm text-pantas-dark focus:border-pantas-primary"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-pantas-muted">cm</span>
              </div>
              {errors.height && (
                <p className="text-xs text-pantas-red mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.height}</span>
                </p>
              )}
            </div>
          </div>

          {/* Kalkulasi IMT Otomatis */}
          <div className="p-4 bg-pantas-bg rounded border border-pantas-border space-y-1">
            <span className="text-xs font-semibold text-pantas-muted block uppercase tracking-wider">
              Hasil Indeks Massa Tubuh (IMT) Otomatis
            </span>
            {bmiCalc ? (
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-bold text-pantas-primary">
                  {bmiCalc.formatted} <span className="text-sm font-normal text-pantas-muted">kg/m²</span>
                </span>
                <span className="text-sm font-semibold text-pantas-dark px-2.5 py-0.5 rounded bg-pantas-soft border border-pantas-border">
                  {bmiCalc.label}
                </span>
              </div>
            ) : (
              <p className="text-xs text-pantas-muted italic pt-1">
                Masukkan berat badan dan tinggi badan di atas untuk melihat nilai IMT Anda.
              </p>
            )}
            <p className="text-[11px] text-pantas-muted pt-2 border-t border-pantas-border/50">
              Kategori IMT Dewasa (Kemenkes): Kurus (&lt;18,5), Normal (18,5–&lt;25), Berat Badan Berlebih (25–&lt;27), Obesitas (≥27).
            </p>
          </div>
        </section>
      )}

      {/* STEP 2: KEBIASAAN, RIWAYAT, & KELUHAN */}
      {currentStep === 2 && (
        <section className="p-6 bg-white border border-pantas-border rounded-lg shadow-sm space-y-6">
          <div className="border-b border-pantas-border pb-3">
            <h2 className="text-xl font-bold text-pantas-dark">
              Langkah 2: Kebiasaan, Riwayat Keluarga & Keluhan
            </h2>
            <p className="text-sm text-pantas-muted mt-1 leading-relaxed">
              Faktor risiko gaya hidup membantu melengkapi pemantauan awal tanpa menyimpulkan diagnosis sepihak.
            </p>
          </div>

          {/* DIABETES QUESTIONS */}
          {checkupType === 'diabetes' && (
            <div className="space-y-5">
              {/* Riwayat Keluarga Diabetes */}
              <div>
                <label className="block text-sm font-semibold text-pantas-dark mb-1">
                  Apakah orang tua atau saudara kandung memiliki riwayat diabetes?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'ya', label: 'Ya, Ada' },
                    { val: 'tidak', label: 'Tidak Ada' },
                    { val: 'tidak_tahu', label: 'Tidak Tahu' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setDmFamilyHistory(item.val as FamilyHistory)}
                      className={`py-2 px-3 rounded text-sm border text-center transition-colors ${
                        dmFamilyHistory === item.val
                          ? 'bg-pantas-soft text-pantas-primary border-pantas-primary font-semibold'
                          : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Konsumsi Manis */}
              <div>
                <label className="block text-sm font-semibold text-pantas-dark mb-1">
                  Seberapa sering mengonsumsi makanan atau minuman manis (sirup, teh manis, kue, boba)?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'sering', label: 'Sering (Tiap Hari)' },
                    { val: 'kadang', label: 'Kadang-kadang' },
                    { val: 'jarang', label: 'Jarang / Tidak Pernah' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setSweetIntake(item.val as Frequency)}
                      className={`py-2 px-3 rounded text-sm border text-center transition-colors ${
                        sweetIntake === item.val
                          ? 'bg-pantas-soft text-pantas-primary border-pantas-primary font-semibold'
                          : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aktivitas Fisik 150 menit */}
              <div>
                <label className="block text-sm font-semibold text-pantas-dark mb-1">
                  Apakah aktivitas fisik atau olahraga Anda mencapai minimal 150 menit per minggu?
                </label>
                <p className="text-xs text-pantas-muted mb-2">
                  Contoh: Jalan cepat atau senam 30 menit per hari selama 5 hari dalam seminggu.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDmPhysicalActivity(true);
                      if (errors.dmPhysicalActivity) setErrors((p) => ({ ...p, dmPhysicalActivity: '' }));
                    }}
                    className={`py-2.5 px-3 rounded text-sm border text-center transition-colors ${
                      dmPhysicalActivity === true
                        ? 'bg-pantas-soft text-pantas-primary border-pantas-primary font-semibold'
                        : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                    }`}
                  >
                    Ya, Tercapai (≥150 menit/minggu)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDmPhysicalActivity(false);
                      if (errors.dmPhysicalActivity) setErrors((p) => ({ ...p, dmPhysicalActivity: '' }));
                    }}
                    className={`py-2.5 px-3 rounded text-sm border text-center transition-colors ${
                      dmPhysicalActivity === false
                        ? 'bg-pantas-soft text-pantas-primary border-pantas-primary font-semibold'
                        : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                    }`}
                  >
                    Belum Tercapai (&lt;150 menit/minggu)
                  </button>
                </div>
                {errors.dmPhysicalActivity && (
                  <p className="text-xs text-pantas-red mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.dmPhysicalActivity}</span>
                  </p>
                )}
              </div>

              {/* Gejala Fisik Terkait Diabetes */}
              <div className="pt-2">
                <label className="block text-sm font-semibold text-pantas-dark mb-1">
                  Keluhan atau Gejala yang Sedang Dirasakan (Pilih semua yang sesuai)
                </label>
                <p className="text-xs text-pantas-muted mb-3">
                  Keluhan ini membantu tenaga kesehatan dalam evaluasi awal.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: 'seringHaus', label: 'Sering merasa sangat haus (polidipsia)' },
                    { key: 'seringKencing', label: 'Sering buang air kecil malam hari (poliuria)' },
                    { key: 'turunBBDini', label: 'Penurunan berat badan tanpa sebab jelas' },
                    { key: 'lemasMudahLelah', label: 'Badan cepat lemas dan mengantuk' },
                    { key: 'lukaSulitSembuh', label: 'Luka di kulit sulit/lambat mengering' },
                    { key: 'kesemutan', label: 'Kesemutan atau baal pada kaki/tangan' },
                    { key: 'keringatDinginGemetar', label: 'Keringat dingin & gemetar (hipo)' },
                    { key: 'mualMuntahNapasCepat', label: 'Mual muntah & napas terengah-engah' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2.5 p-3 rounded border border-pantas-border bg-pantas-bg hover:bg-neutral-50 cursor-pointer text-xs sm:text-sm text-pantas-dark"
                    >
                      <input
                        type="checkbox"
                        checked={(dmSymptoms as any)[item.key]}
                        onChange={(e) =>
                          setDmSymptoms((prev) => ({
                            ...prev,
                            [item.key]: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded text-pantas-primary focus:ring-pantas-primary"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HIPERTENSI QUESTIONS */}
          {checkupType === 'hipertensi' && (
            <div className="space-y-5">
              {/* Riwayat Keluarga Hipertensi */}
              <div>
                <label className="block text-sm font-semibold text-pantas-dark mb-1">
                  Apakah orang tua atau saudara kandung memiliki riwayat hipertensi?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'ya', label: 'Ya, Ada' },
                    { val: 'tidak', label: 'Tidak Ada' },
                    { val: 'tidak_tahu', label: 'Tidak Tahu' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setHtFamilyHistory(item.val as FamilyHistory)}
                      className={`py-2 px-3 rounded text-sm border text-center transition-colors ${
                        htFamilyHistory === item.val
                          ? 'bg-pantas-soft text-pantas-primary border-pantas-primary font-semibold'
                          : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kebiasaan Makanan Asin */}
              <div>
                <label className="block text-sm font-semibold text-pantas-dark mb-1">
                  Seberapa sering mengonsumsi makanan asin, kecap asin, kerupuk, atau makanan instan/olahan?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'sering', label: 'Sering (Tiap Hari)' },
                    { val: 'kadang', label: 'Kadang-kadang' },
                    { val: 'jarang', label: 'Jarang / Rendah Garam' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setSaltyFoodHabit(item.val as Frequency)}
                      className={`py-2 px-3 rounded text-sm border text-center transition-colors ${
                        saltyFoodHabit === item.val
                          ? 'bg-pantas-soft text-pantas-primary border-pantas-primary font-semibold'
                          : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Merokok */}
              <div>
                <label className="block text-sm font-semibold text-pantas-dark mb-1">
                  Status kebiasaan merokok Anda:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'merokok', label: 'Merokok Aktif' },
                    { val: 'pernah_merokok', label: 'Pernah Merokok (Mantan)' },
                    { val: 'tidak_pernah', label: 'Tidak Pernah Merokok' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setSmokingStatus(item.val as SmokingStatus)}
                      className={`py-2 px-3 rounded text-sm border text-center transition-colors ${
                        smokingStatus === item.val
                          ? 'bg-pantas-soft text-pantas-primary border-pantas-primary font-semibold'
                          : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aktivitas Fisik */}
              <div>
                <label className="block text-sm font-semibold text-pantas-dark mb-1">
                  Apakah aktivitas fisik atau olahraga Anda mencapai minimal 150 menit per minggu?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHtPhysicalActivity(true);
                      if (errors.htPhysicalActivity) setErrors((p) => ({ ...p, htPhysicalActivity: '' }));
                    }}
                    className={`py-2.5 px-3 rounded text-sm border text-center transition-colors ${
                      htPhysicalActivity === true
                        ? 'bg-pantas-soft text-pantas-primary border-pantas-primary font-semibold'
                        : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                    }`}
                  >
                    Ya, Tercapai (≥150 menit/minggu)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHtPhysicalActivity(false);
                      if (errors.htPhysicalActivity) setErrors((p) => ({ ...p, htPhysicalActivity: '' }));
                    }}
                    className={`py-2.5 px-3 rounded text-sm border text-center transition-colors ${
                      htPhysicalActivity === false
                        ? 'bg-pantas-soft text-pantas-primary border-pantas-primary font-semibold'
                        : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                    }`}
                  >
                    Belum Tercapai (&lt;150 menit/minggu)
                  </button>
                </div>
                {errors.htPhysicalActivity && (
                  <p className="text-xs text-pantas-red mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.htPhysicalActivity}</span>
                  </p>
                )}
              </div>

              {/* Keluhan Hipertensi */}
              <div className="pt-2">
                <label className="block text-sm font-semibold text-pantas-dark mb-1">
                  Keluhan Fisik yang Sedang Dirasakan (Pilih semua yang sesuai)
                </label>
                <p className="text-xs text-pantas-muted mb-3">
                  Keluhan berat seperti nyeri dada atau sesak napas merupakan indikasi penting untuk pemeriksaan dokter segera.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: 'tengkukTegang', label: 'Tengkuk terasa kaku atau tegang' },
                    { key: 'pusingBerputar', label: 'Pusing atau sensasi berputar' },
                    { key: 'sakitKepalaHebat', label: 'Sakit kepala yang sangat hebat' },
                    { key: 'pandanganKabur', label: 'Pandangan mendadak kabur / gelap' },
                    { key: 'nyeriDada', label: 'Nyeri dada menekan / menjalar' },
                    { key: 'sesakNapas', label: 'Sesak napas saat beraktivitas ringan' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2.5 p-3 rounded border border-pantas-border bg-pantas-bg hover:bg-neutral-50 cursor-pointer text-xs sm:text-sm text-pantas-dark"
                    >
                      <input
                        type="checkbox"
                        checked={(htComplaints as any)[item.key]}
                        onChange={(e) =>
                          setHtComplaints((prev) => ({
                            ...prev,
                            [item.key]: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded text-pantas-primary focus:ring-pantas-primary"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* STEP 3: HASIL PENGUKURAN */}
      {currentStep === 3 && (
        <section className="p-6 bg-white border border-pantas-border rounded-lg shadow-sm space-y-6">
          <div className="border-b border-pantas-border pb-3">
            <h2 className="text-xl font-bold text-pantas-dark">Langkah 3: Hasil Pengukuran Alat / Lab</h2>
            <p className="text-sm text-pantas-muted mt-1 leading-relaxed">
              Bila Anda belum pernah melakukan tes laboratorium atau tensimeter, Anda tetap dapat melanjutkan. PANTAS akan memberikan penilaian berdasarkan faktor risiko kebiasaan tanpa membuat-buat diagnosis.
            </p>
          </div>

          {/* DIABETES MEASUREMENTS */}
          {checkupType === 'diabetes' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-pantas-dark mb-1">
                  Apakah Anda pernah melakukan pemeriksaan gula darah? <span className="text-pantas-red">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHasTestedGlucose(true);
                      if (errors.hasTestedGlucose) setErrors((p) => ({ ...p, hasTestedGlucose: '' }));
                    }}
                    className={`py-2.5 px-3 rounded text-sm border text-center transition-colors ${
                      hasTestedGlucose === true
                        ? 'bg-pantas-soft text-pantas-primary border-pantas-primary font-semibold'
                        : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                    }`}
                  >
                    Pernah / Ada Hasil Tes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHasTestedGlucose(false);
                      if (errors.hasTestedGlucose) setErrors((p) => ({ ...p, hasTestedGlucose: '' }));
                    }}
                    className={`py-2.5 px-3 rounded text-sm border text-center transition-colors ${
                      hasTestedGlucose === false
                        ? 'bg-pantas-soft text-pantas-primary border-pantas-primary font-semibold'
                        : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                    }`}
                  >
                    Belum Pernah Periksa
                  </button>
                </div>
                {errors.hasTestedGlucose && (
                  <p className="text-xs text-pantas-red mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.hasTestedGlucose}</span>
                  </p>
                )}
              </div>

              {hasTestedGlucose === true && (
                <div className="p-4 bg-pantas-bg rounded-lg border border-pantas-border space-y-4">
                  {/* Jenis Tes */}
                  <div>
                    <label className="block text-sm font-semibold text-pantas-dark mb-1">
                      Jenis Pemeriksaan Gula Darah <span className="text-pantas-red">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTestType('gdp');
                          if (errors.testType) setErrors((p) => ({ ...p, testType: '' }));
                        }}
                        className={`p-3 rounded text-left border transition-colors ${
                          testType === 'gdp'
                            ? 'bg-white border-pantas-primary shadow-sm'
                            : 'border-pantas-border bg-white/70 hover:border-pantas-dark'
                        }`}
                      >
                        <p className="text-sm font-bold text-pantas-dark">Gula Darah Puasa (GDP)</p>
                        <p className="text-xs text-pantas-muted mt-0.5">
                          Diperiksa setelah puasa kalori minimal 8 jam.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTestType('gds');
                          if (errors.testType) setErrors((p) => ({ ...p, testType: '' }));
                        }}
                        className={`p-3 rounded text-left border transition-colors ${
                          testType === 'gds'
                            ? 'bg-white border-pantas-primary shadow-sm'
                            : 'border-pantas-border bg-white/70 hover:border-pantas-dark'
                        }`}
                      >
                        <p className="text-sm font-bold text-pantas-dark">Gula Darah Sewaktu (GDS)</p>
                        <p className="text-xs text-pantas-muted mt-0.5">
                          Diperiksa sewaktu-waktu tanpa syarat puasa.
                        </p>
                      </button>
                    </div>
                    {errors.testType && (
                      <p className="text-xs text-pantas-red mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.testType}</span>
                      </p>
                    )}
                  </div>

                  {/* Konfirmasi Puasa untuk GDP */}
                  {testType === 'gdp' && (
                    <div className="p-3 bg-white rounded border border-pantas-border space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-pantas-dark">
                        Konfirmasi: Apakah Anda benar-benar berpuasa (tidak makan kalori) minimal 8 jam sebelum darah diambil? <span className="text-pantas-red">*</span>
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setFasting8Hours(true);
                            if (errors.fasting8Hours) setErrors((p) => ({ ...p, fasting8Hours: '' }));
                          }}
                          className={`py-1.5 px-3 rounded text-xs font-semibold border ${
                            fasting8Hours === true
                              ? 'bg-pantas-soft text-pantas-primary border-pantas-primary'
                              : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                          }`}
                        >
                          Ya, Puasa Minimal 8 Jam
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFasting8Hours(false);
                            if (errors.fasting8Hours) setErrors((p) => ({ ...p, fasting8Hours: '' }));
                          }}
                          className={`py-1.5 px-3 rounded text-xs font-semibold border ${
                            fasting8Hours === false
                              ? 'bg-pantas-amber-bg text-pantas-amber border-pantas-amber-border'
                              : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                          }`}
                        >
                          Tidak / Belum 8 Jam
                        </button>
                      </div>
                      {errors.fasting8Hours && (
                        <p className="text-xs text-pantas-red mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.fasting8Hours}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Nilai Glukosa & Tanggal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="input-glucose" className="block text-sm font-semibold text-pantas-dark mb-1">
                        Nilai Glukosa Darah (mg/dL) <span className="text-pantas-red">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="input-glucose"
                          type="number"
                          value={glucoseValStr}
                          onChange={(e) => {
                            setGlucoseValStr(e.target.value);
                            if (errors.glucoseValue) setErrors((p) => ({ ...p, glucoseValue: '' }));
                          }}
                          placeholder="Contoh: 110"
                          className="w-full px-3.5 py-2.5 border border-pantas-border rounded text-sm text-pantas-dark bg-white focus:border-pantas-primary"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs text-pantas-muted">mg/dL</span>
                      </div>
                      {errors.glucoseValue && (
                        <p className="text-xs text-pantas-red mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.glucoseValue}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="input-glucose-date" className="block text-sm font-semibold text-pantas-dark mb-1">
                        Tanggal Pemeriksaan
                      </label>
                      <div className="relative">
                        <input
                          id="input-glucose-date"
                          type="date"
                          value={glucoseDate}
                          onChange={(e) => setGlucoseDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-pantas-border rounded text-sm text-pantas-dark bg-white focus:border-pantas-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HIPERTENSI MEASUREMENTS */}
          {checkupType === 'hipertensi' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-pantas-dark mb-1">
                  Apakah Anda sudah melakukan pengukuran tekanan darah? <span className="text-pantas-red">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHasTestedBP(true);
                      if (errors.hasTestedBP) setErrors((p) => ({ ...p, hasTestedBP: '' }));
                    }}
                    className={`py-2.5 px-3 rounded text-sm border text-center transition-colors ${
                      hasTestedBP === true
                        ? 'bg-pantas-soft text-pantas-primary border-pantas-primary font-semibold'
                        : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                    }`}
                  >
                    Sudah / Ada Hasil Tensi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHasTestedBP(false);
                      if (errors.hasTestedBP) setErrors((p) => ({ ...p, hasTestedBP: '' }));
                    }}
                    className={`py-2.5 px-3 rounded text-sm border text-center transition-colors ${
                      hasTestedBP === false
                        ? 'bg-pantas-soft text-pantas-primary border-pantas-primary font-semibold'
                        : 'border-pantas-border text-pantas-muted hover:border-pantas-dark'
                    }`}
                  >
                    Belum Mengukur Tekanan Darah
                  </button>
                </div>
                {errors.hasTestedBP && (
                  <p className="text-xs text-pantas-red mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.hasTestedBP}</span>
                  </p>
                )}
              </div>

              {hasTestedBP === true && (
                <div className="p-4 bg-pantas-bg rounded-lg border border-pantas-border space-y-4">
                  <p className="text-xs text-pantas-muted leading-relaxed">
                    Masukkan hasil tensimeter dalam dua kolom terpisah: angka atas (sistolik) dan angka bawah (diastolik).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sistolik */}
                    <div>
                      <label htmlFor="input-systolic" className="block text-sm font-semibold text-pantas-dark mb-1">
                        Tekanan Sistolik (Angka Atas) <span className="text-pantas-red">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="input-systolic"
                          type="number"
                          value={systolicStr}
                          onChange={(e) => {
                            setSystolicStr(e.target.value);
                            if (errors.systolic) setErrors((p) => ({ ...p, systolic: '' }));
                          }}
                          placeholder="Contoh: 120"
                          className="w-full px-3.5 py-2.5 border border-pantas-border rounded text-sm text-pantas-dark bg-white focus:border-pantas-primary"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs text-pantas-muted">mmHg</span>
                      </div>
                      {errors.systolic && (
                        <p className="text-xs text-pantas-red mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.systolic}</span>
                        </p>
                      )}
                    </div>

                    {/* Diastolik */}
                    <div>
                      <label htmlFor="input-diastolic" className="block text-sm font-semibold text-pantas-dark mb-1">
                        Tekanan Diastolik (Angka Bawah) <span className="text-pantas-red">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="input-diastolic"
                          type="number"
                          value={diastolicStr}
                          onChange={(e) => {
                            setDiastolicStr(e.target.value);
                            if (errors.diastolic) setErrors((p) => ({ ...p, diastolic: '' }));
                          }}
                          placeholder="Contoh: 80"
                          className="w-full px-3.5 py-2.5 border border-pantas-border rounded text-sm text-pantas-dark bg-white focus:border-pantas-primary"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs text-pantas-muted">mmHg</span>
                      </div>
                      {errors.diastolic && (
                        <p className="text-xs text-pantas-red mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.diastolic}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="input-bp-date" className="block text-sm font-semibold text-pantas-dark mb-1">
                      Tanggal Pengukuran
                    </label>
                    <input
                      id="input-bp-date"
                      type="date"
                      value={bpDate}
                      onChange={(e) => setBpDate(e.target.value)}
                      className="w-full sm:w-1/2 px-3.5 py-2.5 border border-pantas-border rounded text-sm text-pantas-dark bg-white focus:border-pantas-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* STEP 4: RINGKASAN & KONFIRMASI */}
      {currentStep === 4 && (
        <section className="p-6 bg-white border border-pantas-border rounded-lg shadow-sm space-y-6">
          <div className="border-b border-pantas-border pb-3">
            <h2 className="text-xl font-bold text-pantas-dark">Langkah 4: Konfirmasi Isian Anda</h2>
            <p className="text-sm text-pantas-muted mt-1 leading-relaxed">
              Periksa kembali data yang telah Anda masukkan sebelum aplikasi melakukan evaluasi aturan pemeriksaan awal.
            </p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="p-4 bg-pantas-bg rounded border border-pantas-border space-y-2">
              <h3 className="font-bold text-pantas-primary">Profil Tubuh & IMT</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-pantas-muted block">Umur:</span>
                  <span className="font-semibold text-pantas-dark">{ageStr} tahun</span>
                </div>
                <div>
                  <span className="text-pantas-muted block">Jenis Kelamin:</span>
                  <span className="font-semibold text-pantas-dark capitalize">{gender}</span>
                </div>
                <div>
                  <span className="text-pantas-muted block">BB / TB:</span>
                  <span className="font-semibold text-pantas-dark">{weightStr} kg / {heightStr} cm</span>
                </div>
                <div>
                  <span className="text-pantas-muted block">Status IMT:</span>
                  <span className="font-semibold text-pantas-dark">{bmiCalc?.formatted} kg/m² ({bmiCalc?.label})</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-pantas-bg rounded border border-pantas-border space-y-2">
              <h3 className="font-bold text-pantas-primary">Hasil Pengukuran Laboratorium/Tensi</h3>
              {checkupType === 'diabetes' ? (
                hasTestedGlucose ? (
                  <p className="text-xs text-pantas-dark">
                    Jenis: <strong>{testType === 'gdp' ? 'Gula Darah Puasa (GDP)' : 'Gula Darah Sewaktu (GDS)'}</strong> | Nilai: <strong>{glucoseValStr} mg/dL</strong> | Tanggal: {glucoseDate}
                    {testType === 'gdp' && (
                      <span className="block text-pantas-muted mt-0.5">
                        Status Puasa: {fasting8Hours ? 'Terkonfirmasi puasa ≥8 jam' : 'Belum puasa 8 jam'}
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-pantas-muted">Belum ada hasil tes gula darah.</p>
                )
              ) : (
                hasTestedBP ? (
                  <p className="text-xs text-pantas-dark">
                    Tekanan Darah: <strong>{systolicStr} / {diastolicStr} mmHg</strong> | Tanggal: {bpDate}
                  </p>
                ) : (
                  <p className="text-xs text-pantas-muted">Belum ada hasil pengukuran tensi.</p>
                )
              )}
            </div>

            <div className="p-4 bg-pantas-soft rounded border border-pantas-border text-xs text-pantas-dark leading-relaxed">
              <p className="font-semibold text-pantas-primary mb-1">Pemberitahuan:</p>
              Dengan menekan tombol &quot;Lihat Hasil Pemeriksaan&quot;, Anda menyetujui bahwa hasil ini bersifat pemantauan awal mandiri dan bukan merupakan diagnosis medis pengganti konsultasi dokter.
            </div>
          </div>
        </section>
      )}

      {/* Navigation Buttons: Back and Next */}
      <div className="flex items-center justify-between pt-2">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-pantas-border rounded font-medium text-sm text-pantas-dark hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-pantas-primary text-white rounded font-medium text-sm hover:bg-pantas-primary-hover shadow-sm transition-colors ml-auto"
        >
          <span>{currentStep === TOTAL_STEPS ? 'Lihat Hasil Pemeriksaan' : 'Lanjut'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

