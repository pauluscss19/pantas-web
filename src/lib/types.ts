export type CheckupType = 'diabetes' | 'hipertensi';

export type Gender = 'laki-laki' | 'perempuan';

export type BMICategory = 'kurus' | 'normal' | 'berat-berlebih' | 'obesitas';

export interface BMIResult {
  value: number;
  formatted: string;
  category: BMICategory;
  label: string;
  description: string;
}

export type Frequency = 'sering' | 'kadang' | 'jarang';
export type FamilyHistory = 'ya' | 'tidak' | 'tidak_tahu';
export type SmokingStatus = 'merokok' | 'pernah_merokok' | 'tidak_pernah';

export interface DiabetesSymptoms {
  seringHaus: boolean;
  seringKencing: boolean;
  turunBBDini: boolean;
  lemasMudahLelah: boolean;
  lukaSulitSembuh: boolean;
  kesemutan: boolean;
  keringatDinginGemetar: boolean;
  mualMuntahNapasCepat: boolean;
}

export interface HipertensiComplaints {
  sakitKepalaHebat: boolean;
  pusingBerputar: boolean;
  tengkukTegang: boolean;
  nyeriDada: boolean;
  sesakNapas: boolean;
  pandanganKabur: boolean;
}

export interface ProfileInput {
  age: number | '';
  gender: Gender;
  weight: number | '';
  height: number | '';
}

export interface DiabetesFormInput extends ProfileInput {
  familyHistory: FamilyHistory;
  sweetIntake: Frequency;
  physicalActivity150Min: boolean | null;
  hasTestedGlucose: boolean | null;
  testType: 'gdp' | 'gds' | '';
  glucoseValue: number | '';
  testDate: string;
  fasting8Hours: boolean | null;
  symptoms: DiabetesSymptoms;
}

export interface HipertensiFormInput extends ProfileInput {
  familyHistory: FamilyHistory;
  saltyFoodHabit: Frequency;
  physicalActivity150Min: boolean | null;
  smokingStatus: SmokingStatus;
  hasTestedBP: boolean | null;
  systolic: number | '';
  diastolic: number | '';
  testDate: string;
  complaints: HipertensiComplaints;
}

export type StatusLevel = 'normal' | 'perhatian' | 'tinggi' | 'rendah' | 'belum_ada';

export interface RedFlagAlert {
  isTriggered: boolean;
  title: string;
  message: string;
  action: string;
  urgency: 'segera_ke_fasilitas_kesehatan' | 'waspada';
  symptoms: string[];
}

export interface MeasurementEvaluation {
  hasMeasurement: boolean;
  primaryValue: string;
  unit: string;
  interpretation: string;
  reason: string;
  statusLevel: StatusLevel;
  clinicalNote?: string;
}

export interface RiskFactorItem {
  id: string;
  title: string;
  explanation: string;
  category: 'riwayat' | 'gaya_hidup' | 'fisik' | 'gejala';
}

export interface EvaluationResult {
  id: string;
  userId?: string | null;
  createdAt: string;
  checkupType: CheckupType;
  profile: {
    age: number;
    gender: Gender;
    weight: number;
    height: number;
    bmi: number;
    bmiFormatted: string;
    bmiCategory: BMICategory;
    bmiCategoryLabel: string;
  };
  redFlags: RedFlagAlert;
  measurement: MeasurementEvaluation;
  riskFactors: RiskFactorItem[];
  nextSteps: string[];
  educationIds: string[];
  disclaimer: string;
  rawInput?: any;
}

export interface EducationArticle {
  id: string;
  title: string;
  category: 'diabetes' | 'hipertensi' | 'umum';
  readTimeMinutes: number;
  summary: string;
  sections: {
    heading?: string;
    content: string[];
    tips?: string[];
  }[];
  sources: {
    institution: string;
    documentTitle: string;
    reviewDate: string;
  }[];
}

