import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Zap, ShieldCheck, Gift, ClipboardList, Mail, Handshake, Quote, CheckCircle2, AlertCircle } from 'lucide-react';

type AccountantOption = {
  id: string;
  display_name: string | null;
  location: string | null;
  user_id: string;
};

export default function Klienti() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [accountants, setAccountants] = useState<AccountantOption[]>([]);
  const [accQuery, setAccQuery] = useState('');
  const [accFocused, setAccFocused] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState<AccountantOption | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    business_type: '',
    documents_per_month: '',
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('accountant_profiles')
        .select('id, display_name, location, user_id')
        .eq('is_approved', true)
        .order('display_name', { ascending: true });
      setAccountants((data || []) as AccountantOption[]);
    })();
  }, []);

  const matches = useMemo(() => {
    const q = accQuery.trim().toLowerCase();
    if (!q) return accountants.slice(0, 8);
    return accountants
      .filter(
        (a) =>
          (a.display_name || '').toLowerCase().includes(q) ||
          (a.location || '').toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [accountants, accQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      toast.error('Моля, попълнете име, телефон и имейл');
      return;
    }
    if (accQuery.trim() && !selectedAcc) {
      toast.error('Този профил не е регистриран като реален потребител на платформата.');
      return;
    }
    setLoading(true);
    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      message: form.message || null,
      business_type: form.business_type || null,
      documents_per_month: form.documents_per_month || null,
      accountant_id: selectedAcc?.id ?? null,
    };
    const { error } = await supabase.from('client_leads').insert([payload as never]);
    setLoading(false);
    if (error) {
      toast.error('Възникна грешка. Моля, опитайте отново.');
      return;
    }
    if (selectedAcc) {
      toast.success(`Запитването е изпратено към ${selectedAcc.display_name}.`);
    }
    setSubmitted(true);
    setForm({ name: '', phone: '', email: '', message: '', business_type: '', documents_per_month: '' });
    setSelectedAcc(null);
    setAccQuery('');
  };

  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary/80 px-4 py-20 text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
            Намерете Вашия идеален счетоводител днес
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/90 md:text-xl">
            Спестете време и си гарантирайте спокойствие с проверени професионалисти. Получете
            индивидуални оферти, адаптирани за Вашия бизнес.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/search')}
            className="text-base font-semibold"
          >
            Намери счетоводител сега
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted/30 px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Zap, title: 'Бързо и лесно', desc: 'Свързваме Ви с експерти до 24 часа' },
              { icon: ShieldCheck, title: 'Проверени експерти', desc: 'Всички счетоводители преминават през проверка' },
              { icon: Gift, title: 'Безплатно за Вас', desc: 'Услугата за търсене е напълно безплатна за бизнеса' },
            ].map((b) => (
              <Card key={b.title} className="border-0 shadow-md">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <b.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{b.title}</h3>
                  <p className="text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">Как работи?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { num: '1', icon: ClipboardList, title: 'Опишете нуждите си' },
              { num: '2', icon: Mail, title: 'Получете оферти' },
              { num: '3', icon: Handshake, title: 'Изберете най-добрия партньор' },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                    {s.num}
                  </div>
                  <s.icon className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background p-1.5 text-primary shadow" />
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-muted/30 px-4 py-16">
        <div className="container mx-auto max-w-3xl">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 md:p-12">
              <Quote className="mb-4 h-10 w-10 text-primary/40" />
              <p className="mb-4 text-lg italic md:text-xl">
                „Благодарение на платформата открихме счетоводител, който разбира спецификата на
                нашия онлайн магазин!"
              </p>
              <p className="font-semibold text-muted-foreground">— Доволен клиент</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Lead Form */}
      <section id="lead-form" className="px-4 py-16">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 md:p-10">
              {submitted ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-primary" />
                  <h2 className="mb-2 text-3xl font-bold">Благодарим Ви!</h2>
                  <p className="mb-6 text-muted-foreground">
                    Получихме Вашето запитване. Нашият екип ще се свърже с Вас в най-кратки срокове.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>
                    Изпрати ново запитване
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="mb-2 text-center text-3xl font-bold">Започнете своето запитване</h2>
                  <p className="mb-8 text-center text-muted-foreground">
                    Попълнете формата и ще се свържем с Вас в най-кратки срокове
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Име *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Вашето име"
                        required
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+359 ..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Имейл *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="email@domain.bg"
                        required
                      />
                    </div>
                    </div>
                    <div className="space-y-2 relative">
                      <Label htmlFor="accountant">Изберете счетоводител (по име или град)</Label>
                      <Input
                        id="accountant"
                        value={accQuery}
                        onFocus={() => setAccFocused(true)}
                        onBlur={() => setTimeout(() => setAccFocused(false), 150)}
                        onChange={(e) => {
                          setAccQuery(e.target.value);
                          setSelectedAcc(null);
                        }}
                        placeholder="напр. Иван Петров или София"
                      />
                      {accFocused && accQuery.trim() && matches.length > 0 && !selectedAcc && (
                        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-lg">
                          {matches.map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSelectedAcc(a);
                                setAccQuery(`${a.display_name}${a.location ? ' — ' + a.location : ''}`);
                                setAccFocused(false);
                              }}
                              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent"
                            >
                              <span className="font-medium">{a.display_name || 'Без име'}</span>
                              {a.location && (
                                <span className="text-xs text-muted-foreground">{a.location}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      {accFocused && accQuery.trim() && matches.length === 0 && (
                        <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-3 text-sm text-muted-foreground shadow-lg">
                          Няма съвпадения между регистрираните счетоводители.
                        </div>
                      )}
                      {accQuery.trim() && !selectedAcc && !accFocused && (
                        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>Този профил не е регистриран като реален потребител на платформата. Моля, изберете от списъка или оставете полето празно.</span>
                        </div>
                      )}
                      {selectedAcc && (
                        <p className="text-xs text-muted-foreground">
                          ✓ Запитването ще бъде изпратено директно към <strong>{selectedAcc.display_name}</strong>.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Тип бизнес</Label>
                      <Select
                        value={form.business_type}
                        onValueChange={(v) => setForm({ ...form, business_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Изберете тип" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EOOD">ЕООД</SelectItem>
                          <SelectItem value="Freelancer">Свободна професия</SelectItem>
                          <SelectItem value="Other">Друго</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Приблизителен брой документи месечно</Label>
                      <Select
                        value={form.documents_per_month}
                        onValueChange={(v) => setForm({ ...form, documents_per_month: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Изберете обем" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-20">До 20</SelectItem>
                          <SelectItem value="20-50">20 - 50</SelectItem>
                          <SelectItem value="50-100">50 - 100</SelectItem>
                          <SelectItem value="100+">Над 100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Кратко описание (по желание)</Label>
                      <Textarea
                        id="message"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Опишете накратко нуждите си..."
                        rows={3}
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                      {loading ? 'Изпращане...' : 'Изпрати запитване'}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AccountPro
      </footer>
    </div>
  );
}
