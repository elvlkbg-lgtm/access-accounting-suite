
-- Create auditor directory table for external registry data (IDES)
CREATE TABLE public.auditor_directory (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  city text,
  specialization text[] DEFAULT '{}'::text[],
  qualification text DEFAULT 'Дипломиран експерт-счетоводител',
  phone text,
  email text,
  ides_number text,
  source_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auditor_directory ENABLE ROW LEVEL SECURITY;

-- Public read access (this is a public registry)
CREATE POLICY "Anyone can view auditor directory"
  ON public.auditor_directory FOR SELECT
  USING (true);

-- Only admins can manage directory
CREATE POLICY "Only admins manage directory"
  ON public.auditor_directory FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins update directory"
  ON public.auditor_directory FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins delete directory"
  ON public.auditor_directory FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Index for search
CREATE INDEX idx_auditor_directory_city ON public.auditor_directory(city);
CREATE INDEX idx_auditor_directory_specialization ON public.auditor_directory USING GIN(specialization);
CREATE INDEX idx_auditor_directory_full_name ON public.auditor_directory USING GIN(to_tsvector('simple', full_name));
