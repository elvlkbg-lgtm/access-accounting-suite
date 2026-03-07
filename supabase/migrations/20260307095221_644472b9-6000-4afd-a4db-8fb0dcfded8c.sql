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
  _city text;
  _acc_id uuid;
BEGIN
  _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  _email := NEW.email;
  _city := NEW.raw_user_meta_data->>'city';
  
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, _full_name, _email);
  
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  
  IF _role = 'accountant' THEN
    SELECT COALESCE(
      array_agg(elem::text),
      '{}'::text[]
    ) INTO _specs
    FROM jsonb_array_elements_text(
      COALESCE(NEW.raw_user_meta_data->'specializations', '[]'::jsonb)
    ) AS elem;

    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'accountant');
    
    INSERT INTO public.accountant_profiles (user_id, display_name, specialization, bio, experience_years, is_approved, location)
    VALUES (NEW.id, _full_name, _specs, '', 0, true, _city)
    RETURNING id INTO _acc_id;
    
    INSERT INTO public.auditor_directory (full_name, email, specialization, source, city)
    VALUES (_full_name, _email, _specs, 'platform', _city);
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  END IF;
  
  RETURN NEW;
END;
$function$;