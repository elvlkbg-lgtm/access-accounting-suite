
CREATE TABLE public.accountant_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  accountant_id uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.accountant_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews" ON public.accountant_reviews
  FOR SELECT USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Users create reviews" ON public.accountant_reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Users can update their own reviews
CREATE POLICY "Users update own reviews" ON public.accountant_reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

-- Users can delete their own reviews
CREATE POLICY "Users delete own reviews" ON public.accountant_reviews
  FOR DELETE USING (reviewer_id = auth.uid());
