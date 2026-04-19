CREATE TABLE public.accountant_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  firm_name TEXT NOT NULL,
  city TEXT,
  experience_years TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.accountant_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert accountant leads"
ON public.accountant_leads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view accountant leads"
ON public.accountant_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));