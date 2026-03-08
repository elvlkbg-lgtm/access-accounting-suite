
-- Fix accountant_profiles SELECT policy to be PERMISSIVE for public access
DROP POLICY IF EXISTS "Anyone can view approved accountants" ON public.accountant_profiles;

CREATE POLICY "Anyone can view approved accountants" ON public.accountant_profiles
FOR SELECT TO public
USING (is_approved = true);

-- Keep authenticated users seeing their own profiles
CREATE POLICY "Users view own accountant profile" ON public.accountant_profiles
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));
