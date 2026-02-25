
-- Allow anyone to view profiles of approved accountants (needed for search display)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.accountant_profiles ap
      WHERE ap.user_id = profiles.id AND ap.is_approved = true
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );
