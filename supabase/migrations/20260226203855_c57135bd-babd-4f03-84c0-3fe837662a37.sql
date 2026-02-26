
-- Allow clients to book consultations (currently only accountants can insert)
DROP POLICY IF EXISTS "Accountants create consultations" ON public.consultations;
CREATE POLICY "Anyone authenticated creates consultations" ON public.consultations
  FOR INSERT WITH CHECK (client_id = auth.uid());
