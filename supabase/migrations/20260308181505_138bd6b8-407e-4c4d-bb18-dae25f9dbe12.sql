
CREATE TABLE public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  source_url text DEFAULT 'https://portal.nra.bg/details/questions-and-answers',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view FAQ items" ON public.faq_items
  FOR SELECT USING (true);

CREATE POLICY "Only service role inserts FAQ" ON public.faq_items
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only service role updates FAQ" ON public.faq_items
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only service role deletes FAQ" ON public.faq_items
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
