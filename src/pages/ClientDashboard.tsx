import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { FileText, MessageCircle, ClipboardList, Search, Send, Upload, Heart, MapPin, Phone, Mail, Star, Trash2 } from 'lucide-react';
import OnlineStatusSelector from '@/components/OnlineStatusSelector';
import Navbar from '@/components/Navbar';
import MessagingPanel from '@/components/MessagingPanel';
import DocumentManager from '@/components/DocumentManager';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [onlineStatus, setOnlineStatus] = useState('offline');
  const [newMessage, setNewMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    await Promise.all([fetchRequests(), fetchUnread(), fetchDocCount(), fetchOnlineStatus(), fetchFavorites()]);
    setLoading(false);
  };

  const fetchOnlineStatus = async () => {
    const { data } = await supabase.from('profiles').select('online_status').eq('id', user!.id).single();
    if (data) setOnlineStatus((data as any).online_status || 'offline');
  };

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('service_requests')
      .select('*, accountant_profiles(*, profiles(full_name)), services(name)')
      .eq('client_id', user!.id)
      .order('created_at', { ascending: false });
    setRequests(data || []);
  };

  const fetchUnread = async () => {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user!.id)
      .eq('is_read', false);
    setUnreadCount(count || 0);
  };

  const fetchDocCount = async () => {
    const { count } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('uploaded_by', user!.id);
    setDocCount(count || 0);
  };

  const fetchFavorites = async () => {
    const { data } = await supabase
      .from('favorite_accountants')
      .select('id, accountant_id, created_at')
      .eq('user_id', user!.id);
    
    if (!data || data.length === 0) { setFavorites([]); return; }
    
    const accIds = data.map(f => f.accountant_id);
    const { data: profiles } = await supabase
      .from('accountant_profiles')
      .select('id, display_name, location, specialization, rating, user_id')
      .in('id', accIds);
    
    // Fetch phone/email from profiles table
    const userIds = (profiles || []).map(p => p.user_id);
    const { data: userProfiles } = await supabase
      .from('profiles')
      .select('id, phone, email, avatar_url')
      .in('id', userIds);
    
    const userMap = new Map((userProfiles || []).map(u => [u.id, u]));
    
    const merged = (profiles || []).map(p => ({
      ...p,
      phone: userMap.get(p.user_id)?.phone || null,
      email: userMap.get(p.user_id)?.email || null,
      avatar_url: userMap.get(p.user_id)?.avatar_url || null,
      favorite_id: data.find(f => f.accountant_id === p.id)?.id,
    }));
    
    setFavorites(merged);
  };

  const removeFavorite = async (favoriteId: string) => {
    await supabase.from('favorite_accountants').delete().eq('id', favoriteId);
    toast.success('Премахнат от предпочитани');
    fetchFavorites();
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
    else { setNewMessage(''); toast.success('Съобщението е изпратено'); }
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Клиентско табло</h1>
            <p className="text-muted-foreground">Управлявайте вашите заявки, документи и комуникация.</p>
          </div>
          <OnlineStatusSelector currentStatus={onlineStatus} onStatusChange={setOnlineStatus} />
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card><CardContent className="flex items-center gap-4 p-6">
            <ClipboardList className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{requests.length}</p><p className="text-sm text-muted-foreground">Заявки</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6">
            <MessageCircle className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{unreadCount}</p><p className="text-sm text-muted-foreground">Нови съобщения</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6">
            <FileText className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{docCount}</p><p className="text-sm text-muted-foreground">Документи</p></div>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="requests">
          <TabsList className="flex-wrap">
            <TabsTrigger value="requests">Заявки</TabsTrigger>
            <TabsTrigger value="favorites" className="gap-1"><Heart className="h-4 w-4" /> Предпочитани ({favorites.length})</TabsTrigger>
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
                    <Button size="sm" variant="outline" onClick={() => setSelectedRequest(selectedRequest?.id === r.id ? null : r)}>
                      <MessageCircle className="mr-1 h-3 w-3" /> Съобщение
                    </Button>
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

          <TabsContent value="messages" className="mt-4">
            <MessagingPanel />
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <DocumentManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
