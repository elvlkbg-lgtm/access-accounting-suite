import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, ClipboardList, FileText, Shield, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [accountants, setAccountants] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchUsers(), fetchPendingAccountants(), fetchAllRequests()]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: rolesData } = await supabase.from('user_roles').select('*');
    setUsers(profilesData || []);
    setRoles(rolesData || []);
  };

  const fetchPendingAccountants = async () => {
    const { data } = await supabase.from('accountant_profiles').select('*, profiles(full_name, email)').eq('is_approved', false);
    setAccountants(data || []);
  };

  const fetchAllRequests = async () => {
    const { data } = await supabase
      .from('service_requests')
      .select('*, profiles!service_requests_client_id_fkey(full_name), accountant_profiles(profiles(full_name))')
      .order('created_at', { ascending: false })
      .limit(100);
    setRequests(data || []);
  };

  const approveAccountant = async (id: string, userId: string) => {
    await supabase.from('accountant_profiles').update({ is_approved: true }).eq('id', id);
    // Add accountant role
    await supabase.from('user_roles').insert({ user_id: userId, role: 'accountant' as any });
    toast.success('Счетоводителят е одобрен');
    fetchPendingAccountants();
    fetchUsers();
  };

  const toggleUserActive = async (userId: string, currentActive: boolean) => {
    await supabase.from('profiles').update({ is_active: !currentActive }).eq('id', userId);
    toast.success(currentActive ? 'Потребителят е деактивиран' : 'Потребителят е активиран');
    fetchUsers();
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    // Remove existing non-admin roles, add new one
    await supabase.from('user_roles').delete().eq('user_id', userId).neq('role', 'admin' as any);
    await supabase.from('user_roles').insert({ user_id: userId, role: newRole as any });
    toast.success('Ролята е променена');
    fetchUsers();
  };

  const getUserRoles = (userId: string) => roles.filter((r) => r.user_id === userId).map((r) => r.role);

  if (loading) return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20 text-muted-foreground">Зареждане...</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Администраторски панел</h1>
          <p className="text-muted-foreground">Управлявайте потребителите и платформата.</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card><CardContent className="flex items-center gap-4 p-6"><Users className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{users.length}</p><p className="text-sm text-muted-foreground">Потребители</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><Shield className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{accountants.length}</p><p className="text-sm text-muted-foreground">Чакащи одобрение</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><ClipboardList className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{requests.length}</p><p className="text-sm text-muted-foreground">Общо заявки</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><BarChart3 className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{requests.filter(r => r.status === 'completed').length}</p><p className="text-sm text-muted-foreground">Завършени</p></div></CardContent></Card>
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Потребители</TabsTrigger>
            <TabsTrigger value="approvals">Одобрения</TabsTrigger>
            <TabsTrigger value="requests">Заявки</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4 space-y-3">
            {users.map((u) => (
              <Card key={u.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold">{u.full_name || 'Без име'}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <div className="mt-1 flex gap-1">
                      {getUserRoles(u.id).map((r: string) => <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select onValueChange={(val) => changeUserRole(u.id, val)}>
                      <SelectTrigger className="w-36"><SelectValue placeholder="Смени роля" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Клиент</SelectItem>
                        <SelectItem value="accountant">Счетоводител</SelectItem>
                        <SelectItem value="admin">Администратор</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant={u.is_active ? 'destructive' : 'default'} onClick={() => toggleUserActive(u.id, u.is_active)}>
                      {u.is_active ? 'Деактивирай' : 'Активирай'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="approvals" className="mt-4 space-y-3">
            {accountants.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Няма чакащи одобрение.</p>
            ) : accountants.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold">{(a.profiles as any)?.full_name || 'Без име'}</p>
                    <p className="text-sm text-muted-foreground">{(a.profiles as any)?.email}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {a.specialization?.map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                  <Button onClick={() => approveAccountant(a.id, a.user_id)}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Одобри
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="requests" className="mt-4 space-y-3">
            {requests.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Клиент: {(r.profiles as any)?.full_name || '—'}</p>
                      <p className="text-sm text-muted-foreground">Счетоводител: {(r.accountant_profiles as any)?.profiles?.full_name || '—'}</p>
                      {r.description && <p className="mt-1 text-sm">{r.description}</p>}
                    </div>
                    <Badge>{r.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
