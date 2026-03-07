
-- Create avatars storage bucket (public for viewing)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users upload own avatar" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow anyone to view avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to update/delete their own avatars
CREATE POLICY "Users manage own avatar" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own avatar" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Update handle_new_user trigger to save phone and avatar_url
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
  _phone text;
  _avatar_url text;
  _acc_id uuid;
BEGIN
  _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  _email := NEW.email;
  _city := NEW.raw_user_meta_data->>'city';
  _phone := NEW.raw_user_meta_data->>'phone';
  _avatar_url := NEW.raw_user_meta_data->>'avatar_url';
  
  INSERT INTO public.profiles (id, full_name, email, phone, avatar_url)
  VALUES (NEW.id, _full_name, _email, _phone, _avatar_url);
  
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
    
    INSERT INTO public.auditor_directory (full_name, email, specialization, source, city, phone)
    VALUES (_full_name, _email, _specs, 'platform', _city, _phone);
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create blog_articles table for auto-generated content
CREATE TABLE public.blog_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'news',
  source_url TEXT,
  source_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog articles" ON public.blog_articles
FOR SELECT USING (true);

CREATE POLICY "Only admins manage blog articles" ON public.blog_articles
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins update blog articles" ON public.blog_articles
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins delete blog articles" ON public.blog_articles
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
