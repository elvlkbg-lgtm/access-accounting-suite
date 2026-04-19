
CREATE TABLE public.client_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  business_type text,
  documents_per_month text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads"
ON public.client_leads
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can view leads"
ON public.client_leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
