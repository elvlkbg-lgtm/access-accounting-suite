-- Add columns to client_leads for routing requests to a specific accountant
ALTER TABLE public.client_leads
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS accountant_id uuid REFERENCES public.accountant_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

-- Allow accountants to view leads addressed to them (so they can see requests in their dashboard)
CREATE POLICY "Accountants view own leads"
ON public.client_leads
FOR SELECT
TO authenticated
USING (
  accountant_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.accountant_profiles ap
    WHERE ap.id = client_leads.accountant_id AND ap.user_id = auth.uid()
  )
);