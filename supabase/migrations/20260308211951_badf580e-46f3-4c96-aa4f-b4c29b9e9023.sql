
-- Fix accountant_reviews policies: drop RESTRICTIVE, recreate as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.accountant_reviews;
DROP POLICY IF EXISTS "Users create reviews" ON public.accountant_reviews;
DROP POLICY IF EXISTS "Users delete own reviews" ON public.accountant_reviews;
DROP POLICY IF EXISTS "Users update own reviews" ON public.accountant_reviews;

CREATE POLICY "Anyone can view reviews" ON public.accountant_reviews
FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users create reviews" ON public.accountant_reviews
FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users delete own reviews" ON public.accountant_reviews
FOR DELETE TO authenticated USING (reviewer_id = auth.uid());

CREATE POLICY "Users update own reviews" ON public.accountant_reviews
FOR UPDATE TO authenticated USING (reviewer_id = auth.uid());
