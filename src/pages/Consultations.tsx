import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, Calendar, Clock, User, CheckCircle, MessageSquare, Check, X, ChevronsUpDown, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

interface PlatformAccountant {
  id: string;
  display_name: string | null;
  user_id: string;
  location: string | null;
}

export default function Consultations() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [accountants, setAccountants] = useState<PlatformAccountant[]>([]);
  const [selectedAccountant, setSelectedAccountant] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myConsultations, setMyConsultations] = useState<any[]>([]);
  const [clientNames, setClientNames] = useState<Record<string, string>>({});
  const [booked, setBooked] = useState(false);
  const [accQuery, setAccQuery] = useState('');
  const [accFocused, setAccFocused] = useState(false);

  const isAccountant = hasRole('accountant');

  useEffect(() => {
    fetchAccountants();
    if (user) fetchMyConsultations();
  }, [user]);

  const fetchAccountants = async () => {
    // Fetch from accountant_profiles (platform accountants) since consultations FK references this table
    const { data } = await supabase
      .from('accountant_profiles')
      .select('id, display_name, user_id, location')
      .eq('is_approved', true)
      .order('display_name');
    setAccountants(data || []);
  };

  const fetchMyConsultations = async () => {
    let consultations: any[] = [];
    
    if (isAccountant) {
      const { data: profile } = await supabase
        .from('accountant_profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();
      if (profile) {
        const { data } = await supabase
          .from('consultations')
          .select('*')
          .eq('accountant_id', profile.id)
          .order('scheduled_at', { ascending: false });
        consultations = data || [];
      }
    } else {
      const { data } = await supabase
        .from('consultations')
        .select('*')
        .eq('client_id', user!.id)
        .order('scheduled_at', { ascending: false });
      consultations = data || [];
    }

    setMyConsultations(consultations);

    // Fetch client names for accountant view
    if (isAccountant && consultations.length > 0) {
      const clientIds = [...new Set(consultations.map(c => c.client_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', clientIds);
      if (profiles) {
        const names: Record<string, string> = {};
        profiles.forEach(p => {
          names[p.id] = p.full_name || p.email || 'Клиент';
        });
        setClientNames(names);
      }
    }
  };

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedAccountant || !dateFrom || !time) {
      toast.error('Моля, попълнете всички задължителни полета');
      return;
    }
    setSubmitting(true);
    const scheduledAt = new Date(`${dateFrom}T${time}`).toISOString();

    const { error } = await supabase.from('consultations').insert({
      accountant_id: selectedAccountant,
      client_id: user.id,
      scheduled_at: scheduledAt,
      duration_minutes: parseInt(duration),
      notes: notes || null,
      status: 'pending',
    });

    if (error) {
      toast.error('Грешка при запазване на консултация');
      setSubmitting(false);
      return;
    }

    // Send message to the accountant's user_id (not the profile id)
    const acc = accountants.find(a => a.id === selectedAccountant);
    if (acc) {
      const dateRange = dateTo ? `от ${dateFrom} до ${dateTo}` : `на ${dateFrom}`;
      const msgContent = `Заявка за консултация ${dateRange} в ${time}ч, ${duration} мин. ${notes ? `Тема: ${notes}` : ''} Моля, потвърдете кога можете.`;

      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: acc.user_id,
        content: msgContent,
      });
    }

    setSubmitting(false);
    toast.success('Заявката е изпратена! Счетоводителят ще я прегледа.');
    setBooked(true);
    setNotes('');
    setDateFrom('');
    setDateTo('');
    setTime('');
    fetchMyConsultations();
  };

  const handleApprove = async (consultationId: string, clientId: string) => {
    await supabase.from('consultations').update({ status: 'scheduled' }).eq('id', consultationId);
    await supabase.from('messages').insert({
      sender_id: user!.id,
      receiver_id: clientId,
      content: 'Вашата заявка за консултация е одобрена! Ще се свържем с вас в уговореното време.',
    });
    toast.success('Консултацията е одобрена');
    fetchMyConsultations();
  };

  const handleReject = async (consultationId: string, clientId: string) => {
    await supabase.from('consultations').update({ status: 'cancelled' }).eq('id', consultationId);
    await supabase.from('messages').insert({
      sender_id: user!.id,
      receiver_id: clientId,
      content: 'За съжаление, не мога да приема заявката за консултация в предложеното време. Моля, предложете друга дата.',
    });
    toast.success('Консултацията е отказана');
    fetchMyConsultations();
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Чакаща одобрение', variant: 'outline' },
      scheduled: { label: 'Одобрена', variant: 'default' },
      completed: { label: 'Завършена', variant: 'secondary' },
      cancelled: { label: 'Отказана', variant: 'destructive' },
    };
    return map[status] || { label: status, variant: 'outline' as const };
  };

  const getAccountantName = (accountantId: string) => {
    const acc = accountants.find(a => a.id === accountantId);
    return acc?.display_name || 'Счетоводител';
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Онлайн консултации</h1>
          <p className="mt-2 text-muted-foreground">
            {isAccountant 
              ? 'Преглед и управление на заявки за консултации от клиенти'
              : 'Запазете час за консултация с професионален счетоводител от платформата'}
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
          {!isAccountant && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Изпрати заявка за консултация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booked ? (
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <CheckCircle className="h-12 w-12 text-primary" />
                    <h3 className="text-lg font-semibold">Заявката е изпратена!</h3>
                    <p className="text-sm text-muted-foreground">Счетоводителят ще прегледа заявката и ще ви отговори.</p>
                    <Button onClick={() => setBooked(false)}>Нова заявка</Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Счетоводител ({accountants.length} налични)</Label>
                      <div className="relative">
                        <Input
                          placeholder="Започнете да пишете име или град..."
                          value={accQuery}
                          onChange={(e) => {
                            setAccQuery(e.target.value);
                            if (selectedAccountant) setSelectedAccountant('');
                          }}
                          onFocus={() => setAccFocused(true)}
                          onBlur={() => setTimeout(() => setAccFocused(false), 150)}
                        />
                        {accFocused && accQuery.trim().length > 0 && !selectedAccountant && (() => {
                          const q = accQuery.trim().toLowerCase();
                          const matches = accountants.filter(a =>
                            (a.display_name || '').toLowerCase().includes(q) ||
                            (a.location || '').toLowerCase().includes(q)
                          );
                          return (
                            <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-md">
                              {matches.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">Няма съвпадения.</div>
                              ) : (
                                matches.map(a => (
                                  <button
                                    type="button"
                                    key={a.id}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                      setSelectedAccountant(a.id);
                                      setAccQuery((a.display_name || 'Счетоводител') + (a.location ? ` — ${a.location}` : ''));
                                      setAccFocused(false);
                                    }}
                                    className="block w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                  >
                                    {a.display_name || 'Счетоводител'}{a.location ? ` — ${a.location}` : ''}
                                  </button>
                                ))
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>От дата *</Label>
                        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} min={today} />
                      </div>
                      <div className="space-y-2">
                        <Label>До дата (по избор)</Label>
                        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} min={dateFrom || today} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Предпочитан час *</Label>
                        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Продължителност</Label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 минути</SelectItem>
                            <SelectItem value="60">60 минути</SelectItem>
                            <SelectItem value="90">90 минути</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Тема / бележки</Label>
                      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Опишете темата на консултацията..." rows={3} />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Счетоводителят ще получи заявката и ще одобри или предложи друго време
                    </p>
                    <Button className="w-full" onClick={handleBook} disabled={submitting}>
                      {submitting ? 'Изпращане...' : 'Изпрати заявка'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <Card className={isAccountant ? 'lg:col-span-2' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {isAccountant ? 'Заявки за консултации' : 'Моите консултации'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!user ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Влезте в акаунта си, за да видите консултациите.</p>
                  <Button className="mt-4" onClick={() => navigate('/login')}>Вход</Button>
                </div>
              ) : myConsultations.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  {isAccountant ? 'Нямате заявки за консултации.' : 'Нямате насрочени консултации.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {myConsultations.map((c) => {
                    const status = getStatusLabel(c.status);
                    return (
                      <div key={c.id} className="rounded-lg border p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {isAccountant ? (clientNames[c.client_id] || 'Клиент') : getAccountantName(c.accountant_id)}
                          </span>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(c.scheduled_at).toLocaleDateString('bg-BG')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(c.scheduled_at).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>{c.duration_minutes} мин.</span>
                        </div>
                        {c.notes && <p className="text-xs text-muted-foreground">{c.notes}</p>}
                        
                        {isAccountant && c.status === 'pending' && (
                          <div className="flex gap-2 pt-1">
                            <Button size="sm" onClick={() => handleApprove(c.id, c.client_id)}>
                              <Check className="mr-1 h-3 w-3" /> Одобри
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(c.id, c.client_id)}>
                              <X className="mr-1 h-3 w-3" /> Откажи
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
