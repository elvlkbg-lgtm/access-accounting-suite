
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'accountant', 'client');

-- 2. Create request status enum
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'rejected');

-- 3. Create document status enum
CREATE TYPE public.document_status AS ENUM ('uploaded', 'in_review', 'processed', 'returned');

-- 4. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 6. Accountant profiles table
CREATE TABLE public.accountant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  specialization TEXT[] DEFAULT '{}',
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  location TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Services (price list per accountant)
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_id UUID NOT NULL REFERENCES public.accountant_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Service requests
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accountant_id UUID NOT NULL REFERENCES public.accountant_profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  status request_status NOT NULL DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  status document_status NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Consultations
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_id UUID NOT NULL REFERENCES public.accountant_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accountant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- 13. Security definer helper: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 14. Helper: is user involved in service request
CREATE OR REPLACE FUNCTION public.is_request_participant(_user_id UUID, _request_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.service_requests sr
    WHERE sr.id = _request_id
    AND (
      sr.client_id = _user_id
      OR EXISTS (
        SELECT 1 FROM public.accountant_profiles ap
        WHERE ap.id = sr.accountant_id AND ap.user_id = _user_id
      )
    )
  )
$$;

-- 15. Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  -- Default role is client
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 16. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_accountant_profiles_updated_at BEFORE UPDATE ON public.accountant_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 17. RLS Policies

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System inserts profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins manage roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Accountant profiles - public read for search
CREATE POLICY "Anyone can view approved accountants" ON public.accountant_profiles FOR SELECT USING (is_approved = true OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Accountants can create own profile" ON public.accountant_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Accountants can update own profile" ON public.accountant_profiles FOR UPDATE USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins delete accountant profiles" ON public.accountant_profiles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Services - public read
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Accountants manage own services" ON public.services FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.accountant_profiles ap WHERE ap.id = accountant_id AND ap.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Accountants update own services" ON public.services FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.accountant_profiles ap WHERE ap.id = accountant_id AND ap.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Accountants delete own services" ON public.services FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.accountant_profiles ap WHERE ap.id = accountant_id AND ap.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Service requests
CREATE POLICY "Participants can view requests" ON public.service_requests FOR SELECT USING (
  public.is_request_participant(auth.uid(), id) OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Clients create requests" ON public.service_requests FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Participants update requests" ON public.service_requests FOR UPDATE USING (
  public.is_request_participant(auth.uid(), id) OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Clients or admins delete requests" ON public.service_requests FOR DELETE USING (
  client_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);

-- Messages
CREATE POLICY "Users see own messages" ON public.messages FOR SELECT USING (
  sender_id = auth.uid() OR receiver_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users send messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users update own messages" ON public.messages FOR UPDATE USING (
  receiver_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);

-- Documents
CREATE POLICY "Participants view documents" ON public.documents FOR SELECT USING (
  public.is_request_participant(auth.uid(), service_request_id) OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Participants upload documents" ON public.documents FOR INSERT WITH CHECK (
  uploaded_by = auth.uid() AND public.is_request_participant(auth.uid(), service_request_id)
);
CREATE POLICY "Participants update documents" ON public.documents FOR UPDATE USING (
  public.is_request_participant(auth.uid(), service_request_id) OR public.has_role(auth.uid(), 'admin')
);

-- Consultations
CREATE POLICY "Participants view consultations" ON public.consultations FOR SELECT USING (
  client_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.accountant_profiles ap WHERE ap.id = accountant_id AND ap.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Accountants create consultations" ON public.consultations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.accountant_profiles ap WHERE ap.id = accountant_id AND ap.user_id = auth.uid())
);
CREATE POLICY "Participants update consultations" ON public.consultations FOR UPDATE USING (
  client_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.accountant_profiles ap WHERE ap.id = accountant_id AND ap.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 18. Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Users upload own documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users view own documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'documents' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- 19. Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
