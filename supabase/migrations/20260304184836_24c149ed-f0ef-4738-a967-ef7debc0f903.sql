
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _role text;
  _specs text[];
  _full_name text;
  _email text;
  _acc_id uuid;
BEGIN
  _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  _email := NEW.email;
  
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, _full_name, _email);
  
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  
  IF _role = 'accountant' THEN
    -- Parse specializations from metadata
    SELECT COALESCE(
      array_agg(elem::text),
      '{}'::text[]
    ) INTO _specs
    FROM jsonb_array_elements_text(
      COALESCE(NEW.raw_user_meta_data->'specializations', '[]'::jsonb)
    ) AS elem;

    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'accountant');
    
    INSERT INTO public.accountant_profiles (user_id, display_name, specialization, bio, experience_years, is_approved)
    VALUES (NEW.id, _full_name, _specs, '', 0, true)
    RETURNING id INTO _acc_id;
    
    -- Also insert into auditor_directory so they appear in search
    INSERT INTO public.auditor_directory (full_name, email, specialization, source, city)
    VALUES (_full_name, _email, _specs, 'platform', NULL);
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  END IF;
  
  RETURN NEW;
END;
$function$;
