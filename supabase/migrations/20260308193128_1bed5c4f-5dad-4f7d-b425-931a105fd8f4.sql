CREATE POLICY "Accountants can view their clients profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.consultations c
    JOIN public.accountant_profiles ap ON ap.id = c.accountant_id
    WHERE c.client_id = profiles.id
    AND ap.user_id = auth.uid()
  )
);