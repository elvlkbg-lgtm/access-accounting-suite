
-- Add source column to auditor_directory to distinguish platform vs IDES entries
ALTER TABLE public.auditor_directory ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'ides';

-- Update existing entries as IDES source
UPDATE public.auditor_directory SET source = 'ides' WHERE source IS NULL OR source = 'ides';
