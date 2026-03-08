import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageCircle, ClipboardList, Users, Send, Upload, Plus, Trash2, ExternalLink, Calendar, BarChart3, Camera, Phone, User } from 'lucide-react';
import OnlineStatusSelector from '@/components/OnlineStatusSelector';
import Navbar from '@/components/Navbar';
import MessagingPanel from '@/components/MessagingPanel';
import DocumentManager from '@/components/DocumentManager';
import { toast } from 'sonner';

const SPECIALIZATIONS = ['Одит', 'Човешки ресурси', 'Данъци', 'Пълно счетоводство'];
const EXTERNAL_LINKS = [
  { name: 'НАП (Национална агенция за приходите)', url: 'https://www.nap.bg' },
  { name: 'НОИ (Национален осигурителен институт)', url: 'https://www.noi.bg' },
  { name: 'Инспекция по труда', url: 'https://www.gli.government.bg' },
];

export default function AccountantDashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'requests';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [accountantProfile, setAccountantProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineStatus, setOnlineStatus] = useState('offline');
  const [loading, setLoading] = useState(true);

  // Profile form
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [specialization, setSpecialization] = useState<string[]>([]);
  const [experience, setExperience] = useState(0);
  const [location, setLocation] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  // New service form
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  // Message
  const [newMessage, setNewMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    await fetchProfile();
    await fetchUnread();
    await fetchOnlineStatus();
    setLoading(false);
  };

  const fetchOnlineStatus = async () => {
    const { data } = await supabase.from('profiles').select('online_status').eq('id', user!.id).single();
    if (data) setOnlineStatus((data as any).online_status || 'offline');
  };

  const fetchUnread = async () => {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user!.id)
      .eq('is_read', false);
    setUnreadCount(count || 0);
  };

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('accountant_profiles')
      .select('*')
      .eq('user_id', user!.id)
      .single();
    if (data) {
      setAccountantProfile(data);
      setBio(data.bio || '');
      setDisplayName(data.display_name || '');
      setSpecialization(data.specialization || []);
      setExperience(data.experience_years || 0);
      setLocation(data.location || '');
      // Fetch phone and avatar from profiles table
      const { data: profileData } = await supabase.from('profiles').select('phone, avatar_url').eq('id', user!.id).single();
      if (profileData) {
        setPhone(profileData.phone || '');
        setAvatarUrl(profileData.avatar_url || '');
      }
      await Promise.all([
        fetchRequests(data.id),
        fetchServices(data.id),
        fetchConsultations(data.id),
      ]);
    }
  };

  const fetchRequests = async (apId: string) => {
    const { data } = await supabase
      .from('service_requests')
      .select('*, profiles!service_requests_client_id_fkey(full_name), services(name)')
      .eq('accountant_id', apId)
      .order('created_at', { ascending: false });
    setRequests(data || []);
  };

  const fetchServices = async (apId: string) => {
    const { data } = await supabase.from('services').select('*').eq('accountant_id', apId);
    setServices(data || []);
  };

  const fetchConsultations = async (apId: string) => {
    const { data } = await supabase
      .from('consultations')
      .select('*, profiles!consultations_client_id_fkey(full_name)')
      .eq('accountant_id', apId)
      .order('scheduled_at', { ascending: true });
    setConsultations(data || []);
  };

  const updateProfile = async () => {
    const { error: accError } = await supabase.from('accountant_profiles').update({
      bio, specialization, experience_years: experience, location, display_name: displayName,
    }).eq('id', accountantProfile.id);
    
    const { error: profError } = await supabase.from('profiles').update({
      full_name: displayName, phone, avatar_url: avatarUrl || null,
    }).eq('id', user!.id);

    if (accError || profError) toast.error('Грешка при запис');
    else toast.success('Профилът е обновен');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Файлът е твърде голям (макс. 2MB)'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Моля, изберете изображение'); return; }
    
    setUploadingAvatar(true);
    const ext = file.name.split('.').pop();
    const path = `${user!.id}/avatar.${ext}`;
    
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) { toast.error('Грешка при качване'); setUploadingAvatar(false); return; }
    
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    setAvatarUrl(urlData.publicUrl + '?t=' + Date.now());
    setUploadingAvatar(false);
    toast.success('Снимката е качена');
  };

  const addService = async () => {
    if (!newServiceName || !newServicePrice) return;
    const { error } = await supabase.from('services').insert({
      accountant_id: accountantProfile.id,
      name: newServiceName,
      description: newServiceDesc,
      price: parseFloat(newServicePrice),
    });
    if (error) toast.error('Грешка');
    else { toast.success('Услугата е добавена'); setNewServiceName(''); setNewServiceDesc(''); setNewServicePrice(''); fetchServices(accountantProfile.id); }
  };

  const deleteService = async (id: string) => {
    await supabase.from('services').delete().eq('id', id);
    fetchServices(accountantProfile.id);
  };

  const updateRequestStatus = async (requestId: string, status: "pending" | "accepted" | "in_progress" | "completed" | "rejected") => {
    await supabase.from('service_requests').update({ status }).eq('id', requestId);
    fetchRequests(accountantProfile.id);
    toast.success('Статусът е обновен');
  };

  const sendMessage = async (receiverId: string, requestId: string) => {
    if (!newMessage.trim()) return;
    await supabase.from('messages').insert({
      sender_id: user!.id, receiver_id: receiverId, service_request_id: requestId, content: newMessage,
    });
    setNewMessage('');
    toast.success('Изпратено');
  };

  const statusLabels: Record<string, string> = {
    pending: 'Чакаща', accepted: 'Приета', in_progress: 'В процес', completed: 'Завършена', rejected: 'Отказана',
  };

  if (loading) return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20 text-muted-foreground">Зареждане...</div></div>;
  if (!accountantProfile) return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20">Моля, създайте счетоводен профил.</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Табло на счетоводителя</h1>
            <p className="text-muted-foreground">Управлявайте профила, заявките и документите си.</p>
            {!accountantProfile.is_approved && (
              <Badge variant="secondary" className="mt-2">Очаква одобрение от администратор</Badge>
            )}
          </div>
          <OnlineStatusSelector currentStatus={onlineStatus} onStatusChange={setOnlineStatus} />
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card><CardContent className="flex items-center gap-4 p-6"><Users className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{new Set(requests.map(r => r.client_id)).size}</p><p className="text-sm text-muted-foreground">Клиенти</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><ClipboardList className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{requests.filter(r => r.status !== 'completed' && r.status !== 'rejected').length}</p><p className="text-sm text-muted-foreground">Активни заявки</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><BarChart3 className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{requests.filter(r => r.status === 'completed').length}</p><p className="text-sm text-muted-foreground">Завършени</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><MessageCircle className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{unreadCount}</p><p className="text-sm text-muted-foreground">Нови съобщения</p></div></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="requests">Заявки</TabsTrigger>
            <TabsTrigger value="profile">Профил</TabsTrigger>
            <TabsTrigger value="services">Ценоразпис</TabsTrigger>
            <TabsTrigger value="messages">Съобщения</TabsTrigger>
            <TabsTrigger value="documents">Документи</TabsTrigger>
            <TabsTrigger value="consultations">Консултации</TabsTrigger>
            <TabsTrigger value="contacts">Контакти</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-4 space-y-4">
            {requests.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{(r.profiles as any)?.full_name || 'Клиент'}</p>
                      <p className="text-sm text-muted-foreground">{r.services?.name || 'Обща услуга'}</p>
                      {r.description && <p className="mt-1 text-sm">{r.description}</p>}
                    </div>
                    <Badge>{statusLabels[r.status]}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.status === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => updateRequestStatus(r.id, 'accepted')}>Приеми</Button>
                        <Button size="sm" variant="destructive" onClick={() => updateRequestStatus(r.id, 'rejected')}>Откажи</Button>
                      </>
                    )}
                    {r.status === 'accepted' && <Button size="sm" onClick={() => updateRequestStatus(r.id, 'in_progress')}>Започни работа</Button>}
                    {r.status === 'in_progress' && <Button size="sm" onClick={() => updateRequestStatus(r.id, 'completed')}>Завърши</Button>}
                    <Button size="sm" variant="outline" onClick={() => setSelectedRequest(selectedRequest?.id === r.id ? null : r)}>
                      <MessageCircle className="mr-1 h-3 w-3" /> Съобщение
                    </Button>
                  </div>
                  {selectedRequest?.id === r.id && (
                    <div className="mt-3 flex gap-2">
                      <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Съобщение..." className="flex-1" rows={2} />
                      <Button onClick={() => sendMessage(r.client_id, r.id)} size="icon"><Send className="h-4 w-4" /></Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {requests.length === 0 && <p className="text-center text-muted-foreground py-8">Няма заявки.</p>}
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Редактиране на профил</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Профилна снимка" className="h-20 w-20 rounded-full object-cover border-2 border-primary/20" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                      <Camera className="h-3.5 w-3.5" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                    </label>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Профилна снимка</p>
                    <p className="text-xs text-muted-foreground">JPEG или PNG, макс. 2MB</p>
                  </div>
                </div>

                {/* Display name & phone */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Име за показване</Label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Вашето име" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Телефон</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+359 ..." />
                  </div>
                </div>

                {/* Specializations */}
                <div className="space-y-2">
                  <Label>Специализации</Label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map((s) => (
                      <Button key={s} size="sm" variant={specialization.includes(s) ? 'default' : 'outline'}
                        onClick={() => setSpecialization(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}>
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2"><Label>Описание</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} /></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>Години опит</Label><Input type="number" value={experience} onChange={(e) => setExperience(parseInt(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>Град</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
                </div>
                <Button onClick={updateProfile}>Запази промените</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="mt-4 space-y-4">
            <Card>
              <CardHeader><CardTitle>Добави услуга</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Име на услугата" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} />
                <Input placeholder="Описание" value={newServiceDesc} onChange={(e) => setNewServiceDesc(e.target.value)} />
                <Input placeholder="Цена (€)" type="number" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} />
                <Button onClick={addService}><Plus className="mr-2 h-4 w-4" />Добави</Button>
              </CardContent>
            </Card>
            {services.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-primary">{Number(s.price).toFixed(2)} €</span>
                    <Button size="icon" variant="ghost" onClick={() => deleteService(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            <MessagingPanel />
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <DocumentManager />
          </TabsContent>

          <TabsContent value="consultations" className="mt-4 space-y-4">
            <Card>
              <CardHeader><CardTitle>Планирани консултации</CardTitle></CardHeader>
              <CardContent>
                {consultations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Няма планирани консултации.</p>
                ) : (
                  <div className="space-y-3">
                    {consultations.map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{(c.profiles as any)?.full_name || 'Клиент'}</p>
                          <p className="text-sm text-muted-foreground"><Calendar className="mr-1 inline h-3 w-3" />{new Date(c.scheduled_at).toLocaleString('bg-BG')}</p>
                        </div>
                        <Badge>{c.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Външни контакти</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {EXTERNAL_LINKS.map((link) => (
                  <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent">
                    <span className="font-medium">{link.name}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
