-- ==============================================================================
-- PANTAS — Pemantauan Hipertensi dan Diabetes
-- Database Schema & Row Level Security (RLS) Policies
-- Target: Supabase PostgreSQL
-- ==============================================================================

-- 1. Create table for checkups
CREATE TABLE IF NOT EXISTS public.checkups (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    checkup_type TEXT NOT NULL CHECK (checkup_type IN ('diabetes', 'hipertensi')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 150),
    gender TEXT NOT NULL CHECK (gender IN ('laki-laki', 'perempuan')),
    weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 0),
    height_cm NUMERIC(5, 2) NOT NULL CHECK (height_cm > 0),
    bmi NUMERIC(5, 2) NOT NULL,
    bmi_category TEXT NOT NULL CHECK (bmi_category IN ('kurus', 'normal', 'berat-berlebih', 'obesitas')),
    bmi_formatted TEXT NOT NULL,
    red_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
    measurement JSONB NOT NULL DEFAULT '{}'::jsonb,
    risk_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    next_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    education_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_input JSONB,
    disclaimer TEXT NOT NULL
);

-- 2. Create indices for performance
CREATE INDEX IF NOT EXISTS idx_checkups_user_id ON public.checkups(user_id);
CREATE INDEX IF NOT EXISTS idx_checkups_created_at ON public.checkups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkups_user_type ON public.checkups(user_id, checkup_type);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.checkups ENABLE ROW LEVEL SECURITY;

-- 4. Grant table privileges to authenticated and service_role
-- (Wajib agar role pengguna 'authenticated' diizinkan mengakses tabel, 
-- sedangkan baris mana yang bisa diakses tetap dibatasi ketat oleh RLS di bawah ini)
GRANT ALL ON TABLE public.checkups TO authenticated;
GRANT ALL ON TABLE public.checkups TO service_role;

-- 5. Drop existing policies if re-running script (mencegah error "policy already exists")
DROP POLICY IF EXISTS "Users can only view their own checkups" ON public.checkups;
DROP POLICY IF EXISTS "Users and admins can view checkups" ON public.checkups;
DROP POLICY IF EXISTS "Users can only insert their own checkups" ON public.checkups;
DROP POLICY IF EXISTS "Users can only update their own checkups" ON public.checkups;
DROP POLICY IF EXISTS "Users can only delete their own checkups" ON public.checkups;

-- 6. RLS Policy: Users can view their own checkups, and Admins can view all patient checkups
CREATE POLICY "Users and admins can view checkups"
ON public.checkups
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'email') IN ('paulussaputraa19@gmail.com', 'admin@pantas.id', 'admin@puskesmas.id', 'admin@karangawen.id')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 7. RLS Policy: Users can only INSERT (create) checkup records for themselves
CREATE POLICY "Users can only insert their own checkups"
ON public.checkups
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 8. RLS Policy: Users can only UPDATE their own checkup records
CREATE POLICY "Users can only update their own checkups"
ON public.checkups
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 9. RLS Policy: Users can only DELETE their own checkup records
CREATE POLICY "Users can only delete their own checkups"
ON public.checkups
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==============================================================================
-- PANDUAN PENGUJIAN AKSES DUA AKUN (ROW LEVEL SECURITY TEST)
-- ==============================================================================
-- Uji isolasi data dapat dilakukan langsung di Supabase SQL Editor atau melalui script test:
--
-- 1. Buat dua pengguna di Supabase Auth:
--    User A: a@pantas.id (ID: '11111111-1111-1111-1111-111111111111')
--    User B: b@pantas.id (ID: '22222222-2222-2222-2222-222222222222')
--
-- 2. Saat User A login (auth.uid() = User A):
--    SELECT * FROM checkups; -> HANYA mengembalikan data milik User A.
--    INSERT INTO checkups (user_id, ...) VALUES (User B ID, ...); -> DITOLAK (RLS violation).
--    DELETE FROM checkups WHERE user_id = User B ID; -> Tidak mempengaruhi baris User B (0 rows affected).
-- ==============================================================================
