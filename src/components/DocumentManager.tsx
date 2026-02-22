import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FolderPlus, Folder, FileText, Upload, Download, ArrowLeft, Trash2,
  Share2, MoreHorizontal, FolderOpen
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface FolderItem {
  id: string;
  name: string;
  parent_id: string | null;
  owner_id: string;
  shared_with: string[];
  created_at: string;
}

interface DocumentItem {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  status: string;
  folder_id: string | null;
  service_request_id: string;
  created_at: string;
  uploaded_by: string;
}

export default function DocumentManager() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'Начало' },
  ]);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharingFolder, setSharingFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [selectedRequestForUpload, setSelectedRequestForUpload] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user, currentFolder]);

  const fetchAll = async () => {
    await Promise.all([fetchFolders(), fetchDocuments(), fetchServiceRequests()]);
    setLoading(false);
  };

  const fetchFolders = async () => {
    const { data } = await supabase
      .from('folders')
      .select('*')
      .eq('parent_id', currentFolder as any)
      .order('name');
    setFolders((data as any[]) || []);
  };

  const fetchDocuments = async () => {
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (currentFolder) {
      query = query.eq('folder_id', currentFolder);
    } else {
      query = query.is('folder_id', null);
    }

    const { data } = await query;
    setDocuments((data as any[]) || []);
  };

  const fetchServiceRequests = async () => {
    const { data } = await supabase
      .from('service_requests')
      .select('id, description, status')
      .or(`client_id.eq.${user!.id},accountant_id.in.(select id from accountant_profiles where user_id = '${user!.id}')`)
      .order('created_at', { ascending: false });
    setServiceRequests(data || []);
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    const { error } = await supabase.from('folders').insert({
      name: newFolderName,
      parent_id: currentFolder,
      owner_id: user!.id,
    } as any);
    if (error) toast.error('Грешка при създаване на папка');
    else {
      toast.success('Папката е създадена');
      setNewFolderName('');
      setNewFolderOpen(false);
      fetchFolders();
    }
  };

  const deleteFolder = async (id: string) => {
    const { error } = await supabase.from('folders').delete().eq('id', id);
    if (error) toast.error('Грешка при изтриване');
    else { toast.success('Папката е изтрита'); fetchFolders(); }
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolder(folderId);
    setFolderPath(prev => [...prev, { id: folderId, name: folderName }]);
  };

  const navigateUp = (index: number) => {
    const targetFolder = folderPath[index];
    setCurrentFolder(targetFolder.id);
    setFolderPath(prev => prev.slice(0, index + 1));
  };

  const uploadDocument = async (file: File) => {
    if (!selectedRequestForUpload) {
      toast.error('Моля изберете заявка за документа');
      return;
    }
    const path = `${user!.id}/${currentFolder || 'root'}/${file.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file);
    if (uploadError) { toast.error('Грешка при качване'); return; }
    const insertData: any = {
      service_request_id: selectedRequestForUpload,
      uploaded_by: user!.id,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
      folder_id: currentFolder,
    };
    await supabase.from('documents').insert(insertData);
    toast.success('Документът е качен');
    fetchDocuments();
  };

  const downloadDocument = async (doc: DocumentItem) => {
    const { data } = await supabase.storage.from('documents').download(doc.file_path);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const shareFolder = async (folderId: string) => {
    if (!shareEmail.trim()) return;
    // Find user by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', shareEmail)
      .single();
    if (!profile) { toast.error('Потребителят не е намерен'); return; }

    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const newShared = [...(folder.shared_with || []), profile.id];
    const { error } = await supabase
      .from('folders')
      .update({ shared_with: newShared } as any)
      .eq('id', folderId);
    if (error) toast.error('Грешка при споделяне');
    else {
      toast.success('Папката е споделена');
      setShareEmail('');
      setSharingFolder(null);
      fetchFolders();
    }
  };

  const moveDocumentToFolder = async (docId: string, folderId: string | null) => {
    await supabase.from('documents').update({ folder_id: folderId } as any).eq('id', docId);
    toast.success('Документът е преместен');
    fetchDocuments();
  };

  const statusLabels: Record<string, string> = {
    uploaded: 'Качен', in_review: 'В преглед', processed: 'Обработен', returned: 'Върнат',
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) return <div className="flex items-center justify-center py-12 text-muted-foreground">Зареждане...</div>;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Документи
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <FolderPlus className="mr-2 h-4 w-4" /> Нова папка
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Създаване на папка</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Име на папката"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createFolder()}
                  />
                  <Button onClick={createFolder} className="w-full">Създай</Button>
                </div>
              </DialogContent>
            </Dialog>
            <div>
              <Select value={selectedRequestForUpload} onValueChange={setSelectedRequestForUpload}>
                <SelectTrigger className="w-[180px] h-9 text-xs">
                  <SelectValue placeholder="Избери заявка" />
                </SelectTrigger>
                <SelectContent>
                  {serviceRequests.map(sr => (
                    <SelectItem key={sr.id} value={sr.id}>
                      {sr.description?.slice(0, 30) || sr.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="cursor-pointer">
              <Button size="sm" asChild>
                <span><Upload className="mr-2 h-4 w-4" /> Качи файл</span>
              </Button>
              <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadDocument(e.target.files[0])} />
            </label>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mt-3 flex items-center gap-1 text-sm">
          {folderPath.map((fp, idx) => (
            <span key={idx} className="flex items-center gap-1">
              {idx > 0 && <span className="text-muted-foreground">/</span>}
              <button
                onClick={() => navigateUp(idx)}
                className={`hover:text-primary transition-colors ${idx === folderPath.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
              >
                {fp.name}
              </button>
            </span>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-2 p-3">
        {/* Folders */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50 cursor-pointer"
            onClick={() => navigateToFolder(folder.id, folder.name)}
          >
            <div className="flex items-center gap-3">
              <Folder className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{folder.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(folder.created_at).toLocaleDateString('bg-BG')}
                  {folder.shared_with?.length > 0 && (
                    <span className="ml-2">
                      <Share2 className="inline h-3 w-3 mr-0.5" />
                      Споделена
                    </span>
                  )}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSharingFolder(folder.id); }}>
                  <Share2 className="mr-2 h-4 w-4" /> Сподели
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Изтрий
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {/* Documents */}
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{doc.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(doc.created_at).toLocaleDateString('bg-BG')}
                  {doc.file_size && <span className="ml-2">{formatSize(doc.file_size)}</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">{statusLabels[doc.status] || doc.status}</Badge>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => downloadDocument(doc)}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {folders.length === 0 && documents.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Тази папка е празна. Създайте папка или качете документ.
          </p>
        )}

        {/* Share dialog */}
        <Dialog open={!!sharingFolder} onOpenChange={(open) => !open && setSharingFolder(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Сподели папка</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Имейл на потребителя"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
              <Button onClick={() => sharingFolder && shareFolder(sharingFolder)} className="w-full">
                Сподели
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
