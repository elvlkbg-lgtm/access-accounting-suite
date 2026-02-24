
-- Fix trigger to handle accountant role from registration metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _role text;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  
  IF _role = 'accountant' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'accountant');
    INSERT INTO public.accountant_profiles (user_id, specialization, bio, experience_years, is_approved)
    VALUES (NEW.id, '{}', '', 0, true);
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add FK from accountant_profiles.user_id to auth.users so join works
ALTER TABLE public.accountant_profiles
  DROP CONSTRAINT IF EXISTS accountant_profiles_user_id_fkey;
ALTER TABLE public.accountant_profiles
  ADD CONSTRAINT accountant_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also add FK from accountant_profiles.user_id to profiles.id for the join
-- We need profiles join to work via user_id
-- The join in SearchAccountants does accountant_profiles -> profiles
-- profiles.id = accountant_profiles.user_id
-- We need a FK relationship for PostgREST to detect

-- Make documents.service_request_id nullable so docs can be uploaded standalone
ALTER TABLE public.documents ALTER COLUMN service_request_id DROP NOT NULL;
