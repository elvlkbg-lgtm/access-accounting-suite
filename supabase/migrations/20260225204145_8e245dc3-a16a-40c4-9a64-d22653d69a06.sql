
-- Add display_name to accountant_profiles for cases without auth user
ALTER TABLE public.accountant_profiles ADD COLUMN IF NOT EXISTS display_name text;
