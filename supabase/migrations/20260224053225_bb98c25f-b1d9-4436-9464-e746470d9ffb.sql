
-- Update documents RLS to allow uploads without service_request_id
DROP POLICY IF EXISTS "Participants upload documents" ON public.documents;
CREATE POLICY "Users upload documents"
  ON public.documents FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- Update documents SELECT to also allow owner to see their own docs
DROP POLICY IF EXISTS "Participants view documents" ON public.documents;
CREATE POLICY "Users view documents"
  ON public.documents FOR SELECT
  USING (
    uploaded_by = auth.uid()
    OR (service_request_id IS NOT NULL AND is_request_participant(auth.uid(), service_request_id))
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Update documents UPDATE policy  
DROP POLICY IF EXISTS "Participants update documents" ON public.documents;
CREATE POLICY "Users update documents"
  ON public.documents FOR UPDATE
  USING (
    uploaded_by = auth.uid()
    OR (service_request_id IS NOT NULL AND is_request_participant(auth.uid(), service_request_id))
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Add DELETE policy for documents
CREATE POLICY "Users delete own documents"
  ON public.documents FOR DELETE
  USING (uploaded_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
