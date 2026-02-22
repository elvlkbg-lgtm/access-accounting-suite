
-- Create folders table for organizing documents
CREATE TABLE public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  shared_with UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add folder_id to documents
ALTER TABLE public.documents ADD COLUMN folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL;

-- Enable RLS on folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Folder policies
CREATE POLICY "Users view own or shared folders"
ON public.folders FOR SELECT
USING (owner_id = auth.uid() OR auth.uid() = ANY(shared_with) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own folders"
ON public.folders FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users update own folders"
ON public.folders FOR UPDATE
USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users delete own folders"
ON public.folders FOR DELETE
USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on folders
CREATE TRIGGER update_folders_updated_at
BEFORE UPDATE ON public.folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
