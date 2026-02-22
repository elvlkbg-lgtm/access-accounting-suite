import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileText, MessageCircle, ClipboardList, Search, Send, Upload, Download } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
      // Realtime messages
      const channel = supabase
        .channel('client-messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => fetchMessages())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const fetchData = async () => {
    await Promise.all([fetchRequests(), fetchMessages(), fetchDocuments()]);
    setLoading(false);
  };

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('service_requests')
      .select('*, accountant_profiles(*, profiles(full_name)), services(name)')
      .eq('client_id', user!.id)
      .order('created_at', { ascending: false });
    setRequests(data || []);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(full_name)')
      .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
      .order('created_at', { ascending: false })
      .limit(50);
    setMessages(data || []);
  };

  const fetchDocuments = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*, service_requests(accountant_profiles(profiles(full_name)))')
      .eq('service_requests.client_id', user!.id)
      .order('created_at', { ascending: false });
    setDocuments(data || []);
  };

  const sendMessage = async (receiverId: string, requestId: string) => {
    if (!newMessage.trim()) return;
    const { error } = await supabase.from('messages').insert({
      sender_id: user!.id,
      receiver_id: receiverId,
      service_request_id: requestId,
      content: newMessage,
    });
    if (error) toast.error('Грешка при изпращане');
    else { setNewMessage(''); fetchMessages(); toast.success('Съобщението е изпратено'); }
  };

  const uploadDocument = async (requestId: string, file: File) => {
    const path = `${user!.id}/${requestId}/${file.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file);
    if (uploadError) { toast.error('Грешка при качване'); return; }
    await supabase.from('documents').insert({
      service_request_id: requestId,
      uploaded_by: user!.id,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
    });
    toast.success('Документът е качен');
    fetchDocuments();
  };

  const statusLabels: Record<string, string> = {
    pending: 'Чакаща', accepted: 'Приета', in_progress: 'В процес', completed: 'Завършена', rejected: 'Отказана',
  };
  const statusColors: Record<string, string> = {
    pending: 'secondary', accepted: 'default', in_progress: 'default', completed: 'default', rejected: 'destructive',
  };

  if (loading) return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20 text-muted-foreground">Зареждане...</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Клиентско табло</h1>
          <p className="text-muted-foreground">Управлявайте вашите заявки, документи и комуникация.</p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card><CardContent className="flex items-center gap-4 p-6">
            <ClipboardList className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{requests.length}</p><p className="text-sm text-muted-foreground">Заявки</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6">
            <MessageCircle className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{messages.filter(m => !m.is_read && m.receiver_id === user!.id).length}</p><p className="text-sm text-muted-foreground">Нови съобщения</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6">
            <FileText className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{documents.length}</p><p className="text-sm text-muted-foreground">Документи</p></div>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="requests">
          <TabsList>
            <TabsTrigger value="requests">Заявки</TabsTrigger>
            <TabsTrigger value="messages">Съобщения</TabsTrigger>
            <TabsTrigger value="documents">Документи</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-4 space-y-4">
            <Button onClick={() => navigate('/search')} size="sm"><Search className="mr-2 h-4 w-4" />Нова заявка</Button>
            {requests.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{r.accountant_profiles?.profiles?.full_name || 'Счетоводител'}</p>
                      <p className="text-sm text-muted-foreground">{r.services?.name || 'Обща услуга'}</p>
                      {r.description && <p className="mt-1 text-sm">{r.description}</p>}
                    </div>
                    <Badge variant={statusColors[r.status] as any}>{statusLabels[r.status]}</Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedRequest(r)}>
                      <MessageCircle className="mr-1 h-3 w-3" /> Съобщение
                    </Button>
                    <label className="cursor-pointer">
                      <Button size="sm" variant="outline" asChild>
                        <span><Upload className="mr-1 h-3 w-3" /> Качи документ</span>
                      </Button>
                      <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadDocument(r.id, e.target.files[0])} />
                    </label>
                  </div>
                  {selectedRequest?.id === r.id && (
                    <div className="mt-3 flex gap-2">
                      <Textarea
                        placeholder="Напишете съобщение..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                        rows={2}
                      />
                      <Button onClick={() => sendMessage(r.accountant_profiles?.user_id, r.id)} size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {requests.length === 0 && <p className="text-center text-muted-foreground py-8">Нямате заявки все още.</p>}
          </TabsContent>

          <TabsContent value="messages" className="mt-4 space-y-3">
            {messages.map((m) => (
              <Card key={m.id} className={m.sender_id === user!.id ? 'border-primary/20' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{(m.sender as any)?.full_name || 'Потребител'}</p>
                    <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString('bg-BG')}</span>
                  </div>
                  <p className="mt-1 text-sm">{m.content}</p>
                </CardContent>
              </Card>
            ))}
            {messages.length === 0 && <p className="text-center text-muted-foreground py-8">Няма съобщения.</p>}
          </TabsContent>

          <TabsContent value="documents" className="mt-4 space-y-3">
            {documents.map((d) => (
              <Card key={d.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{d.file_name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString('bg-BG')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{d.status}</Badge>
                    <Button size="icon" variant="ghost" onClick={async () => {
                      const { data } = await supabase.storage.from('documents').download(d.file_path);
                      if (data) {
                        const url = URL.createObjectURL(data);
                        const a = document.createElement('a');
                        a.href = url; a.download = d.file_name; a.click();
                      }
                    }}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {documents.length === 0 && <p className="text-center text-muted-foreground py-8">Няма документи.</p>}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
