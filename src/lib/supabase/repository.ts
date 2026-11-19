import { EvaluationResult } from '../types';
import { createClient } from './client';

export interface SupabaseCheckupRow {
  id: string;
  user_id: string;
  checkup_type: string;
  created_at: string;
  age: number;
  gender: string;
  weight_kg: number;
  height_cm: number;
  bmi: number;
  bmi_category: string;
  bmi_formatted: string;
  red_flags: any;
  measurement: any;
  risk_factors: any;
  next_steps: any;
  education_ids: any;
  raw_input?: any;
  disclaimer: string;
}

export function mapResultToRow(result: EvaluationResult, userId: string): SupabaseCheckupRow {
  return {
    id: result.id,
    user_id: userId,
    checkup_type: result.checkupType,
    created_at: result.createdAt,
    age: result.profile.age,
    gender: result.profile.gender,
    weight_kg: result.profile.weight,
    height_cm: result.profile.height,
    bmi: result.profile.bmi,
    bmi_category: result.profile.bmiCategory,
    bmi_formatted: result.profile.bmiFormatted,
    red_flags: result.redFlags,
    measurement: result.measurement,
    risk_factors: result.riskFactors,
    next_steps: result.nextSteps,
    education_ids: result.educationIds,
    raw_input: result.rawInput || null,
    disclaimer: result.disclaimer,
  };
}

export function mapRowToResult(row: SupabaseCheckupRow): EvaluationResult {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    checkupType: row.checkup_type as 'diabetes' | 'hipertensi',
    profile: {
      age: row.age,
      gender: row.gender as any,
      weight: Number(row.weight_kg),
      height: Number(row.height_cm),
      bmi: Number(row.bmi),
      bmiFormatted: row.bmi_formatted,
      bmiCategory: row.bmi_category as any,
      bmiCategoryLabel: getBmiLabel(row.bmi_category),
    },
    redFlags: row.red_flags,
    measurement: row.measurement,
    riskFactors: row.risk_factors || [],
    nextSteps: row.next_steps || [],
    educationIds: row.education_ids || [],
    disclaimer: row.disclaimer,
    rawInput: row.raw_input,
  };
}

function getBmiLabel(category: string): string {
  switch (category) {
    case 'kurus':
      return 'Kurus (<18,5)';
    case 'normal':
      return 'Normal (18,5 - <25)';
    case 'berat-berlebih':
      return 'Berat Badan Berlebih (25 - <27)';
    case 'obesitas':
      return 'Obesitas (≥27)';
    default:
      return category;
  }
}

export async function saveRemoteCheckup(result: EvaluationResult, userId: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const row = mapResultToRow(result, userId);
  const { error } = await supabase.from('checkups').upsert(row, { onConflict: 'id' });

  if (error) {
    console.error('Failed to save checkup to Supabase:', error.message);
    throw new Error(error.message);
  }
  return true;
}

export async function getRemoteCheckups(userId: string): Promise<EvaluationResult[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('checkups')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch checkups from Supabase:', error.message);
    throw new Error(error.message);
  }

  return (data || []).map((row) => mapRowToResult(row as SupabaseCheckupRow));
}

export async function deleteRemoteCheckup(id: string, userId: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from('checkups')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to delete checkup from Supabase:', error.message);
    throw new Error(error.message);
  }
  return true;
}

export async function clearAllRemoteCheckups(userId: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from('checkups')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to clear checkups from Supabase:', error.message);
    throw new Error(error.message);
  }
  return true;
}

