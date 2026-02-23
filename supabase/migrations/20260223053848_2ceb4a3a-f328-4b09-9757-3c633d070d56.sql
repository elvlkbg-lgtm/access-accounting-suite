-- Add unique constraint on ides_number for upsert support
CREATE UNIQUE INDEX IF NOT EXISTS auditor_directory_ides_number_key ON public.auditor_directory(ides_number) WHERE ides_number IS NOT NULL;
