
-- Drop restrictive SELECT policies on profiles and recreate as permissive
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Accountants can view their clients profiles" ON public.profiles;

-- Allow anyone (including anon) to view profiles of approved accountants
CREATE POLICY "Anyone can view accountant profiles" ON public.profiles
FOR SELECT TO public
USING (
  EXISTS (
    SELECT 1 FROM public.accountant_profiles ap
    WHERE ap.user_id = profiles.id AND ap.is_approved = true
  )
);

-- Authenticated users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Accountants can view their clients profiles
CREATE POLICY "Accountants can view clients" ON public.profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM consultations c
    JOIN accountant_profiles ap ON ap.id = c.accountant_id
    WHERE c.client_id = profiles.id AND ap.user_id = auth.uid()
  )
);

-- Admins can view all
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));
