
CREATE TABLE public.favorite_accountants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  accountant_id uuid NOT NULL REFERENCES public.accountant_profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, accountant_id)
);

ALTER TABLE public.favorite_accountants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own favorites" ON public.favorite_accountants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users add favorites" ON public.favorite_accountants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users remove favorites" ON public.favorite_accountants
  FOR DELETE USING (user_id = auth.uid());
