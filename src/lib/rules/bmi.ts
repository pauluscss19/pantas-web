import { BMICategory, BMIResult } from '../types';

/**
 * Parses user input that might contain Indonesian comma decimal (e.g. "65,5") or standard dot.
 */
export function parseIndonesianNumber(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  const clean = value.trim().replace(/\s+/g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

/**
 * Calculates Body Mass Index (IMT) according to Indonesian Ministry of Health (Kemenkes) standards:
 * - Kurus: < 18,5
 * - Normal: 18,5 sampai < 25,0
 * - Berat badan berlebih: 25,0 sampai < 27,0
 * - Obesitas: ≥ 27,0
 *
 * Note: Category uses raw unrounded value; formatted text displays 1 decimal.
 */
export function calculateBMI(weightKg: number, heightCm: number): BMIResult | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const rawBmi = weightKg / (heightM * heightM);

  if (!isFinite(rawBmi) || isNaN(rawBmi)) {
    return null;
  }

  let category: BMICategory;
  let label: string;
  let description: string;

  if (rawBmi < 18.5) {
    category = 'kurus';
    label = 'Kurus (<18,5)';
    description = 'Berat badan Anda di bawah rentang ideal untuk tinggi badan Anda. Perlu asupan gizi seimbang.';
  } else if (rawBmi < 25.0) {
    category = 'normal';
    label = 'Normal (18,5 - <25)';
    description = 'Berat badan Anda berada dalam rentang sehat dan seimbang.';
  } else if (rawBmi < 27.0) {
    category = 'berat-berlebih';
    label = 'Berat Badan Berlebih (25 - <27)';
    description = 'Berat badan berada di atas rentang ideal. Disarankan menjaga pola makan dan aktif bergerak.';
  } else {
    category = 'obesitas';
    label = 'Obesitas (≥27)';
    description = 'Indeks massa tubuh tergolong obesitas. Merupakan salah satu faktor risiko utama diabetes dan hipertensi.';
  }

  return {
    value: rawBmi,
    formatted: rawBmi.toFixed(1).replace('.', ','),
    category,
    label,
    description,
  };
}

