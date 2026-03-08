
-- Allow reviewer_id to be nullable for anonymous reviews
ALTER TABLE public.accountant_reviews ALTER COLUMN reviewer_id DROP NOT NULL;

-- Drop existing insert policy and recreate for public (including anon)
DROP POLICY IF EXISTS "Authenticated users create reviews" ON public.accountant_reviews;

CREATE POLICY "Anyone can create reviews" ON public.accountant_reviews
FOR INSERT TO public WITH CHECK (true);
