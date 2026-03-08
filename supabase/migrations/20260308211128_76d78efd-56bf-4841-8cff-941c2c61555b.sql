
-- Drop the restrictive "Accountants can view their clients profiles" policy 
-- and recreate as permissive so it doesn't block other profile views
DROP POLICY IF EXISTS "Accountants can view their clients profiles" ON public.profiles;

-- Make "Users can view profiles" permissive (drop restrictive, create permissive)
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

CREATE POLICY "Users can view profiles" ON public.profiles
FOR SELECT
USING (
  (auth.uid() = id)
  OR (EXISTS (
    SELECT 1 FROM accountant_profiles ap
    WHERE ap.user_id = profiles.id AND ap.is_approved = true
  ))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Re-add accountants viewing clients as a separate permissive policy
CREATE POLICY "Accountants can view their clients profiles" ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM consultations c
    JOIN accountant_profiles ap ON ap.id = c.accountant_id
    WHERE c.client_id = profiles.id AND ap.user_id = auth.uid()
  )
);
