import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Zap, ShieldCheck, Gift, ClipboardList, Mail, Handshake, Quote, CheckCircle2 } from 'lucide-react';

export default function Klienti() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    business_type: '',
    documents_per_month: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error('Моля, попълнете име и телефон');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('client_leads').insert([form]);
    setLoading(false);
    if (error) {
      toast.error('Възникна грешка. Моля, опитайте отново.');
      return;
    }
    setSubmitted(true);
    setForm({ name: '', phone: '', business_type: '', documents_per_month: '' });
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
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Изпращане...' : 'Изпрати запитване'}
                </Button>
              </form>
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
