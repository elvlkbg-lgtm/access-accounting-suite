import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, Wallet, MessagesSquare, ShoppingBag, Cpu, Factory, Truck, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ZaSchetovoditeli() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firm_name: '',
    city: '',
    experience_years: '',
    email: '',
  });

  const scrollToForm = () =>
    document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firm_name || !form.email) {
      toast.error('Моля, попълнете име и имейл');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('accountant_leads').insert([form]);
    setLoading(false);
    if (error) {
      toast.error('Възникна грешка. Моля, опитайте отново.');
      return;
    }
    toast.success('Благодарим Ви! Ще се свържем с Вас скоро.');
    setForm({ firm_name: '', city: '', experience_years: '', email: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — navy */}
      <section className="bg-[hsl(220,45%,15%)] px-4 py-20 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full bg-emerald-500/15 px-4 py-1 text-sm font-medium text-emerald-300">
            За счетоводители
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
            Разширете счетоводната си практика с нови клиенти
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80 md:text-xl">
            Ние Ви осигуряваме постоянен поток от запитвания. Вие избирате с кого да работите и при
            какви условия.
          </p>
          <Button
            size="lg"
            onClick={scrollToForm}
            className="bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600"
          >
            Станете наш партньор
          </Button>
        </div>
      </section>

      {/* Why Join */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">Защо да се присъедините?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Eye, title: 'Повече видимост', desc: 'Вашият профил пред хиляди бизнеси' },
              { icon: Wallet, title: 'Без разходи за маркетинг', desc: 'Ние рекламираме вместо Вас' },
              { icon: MessagesSquare, title: 'Директна комуникация', desc: 'Свързвате се директно с потенциалните клиенти' },
            ].map((b) => (
              <Card key={b.title} className="border-0 shadow-md transition-transform hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                    <b.icon className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{b.title}</h3>
                  <p className="text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience — navy */}
      <section className="bg-[hsl(220,45%,15%)] px-4 py-16 text-white">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Търсим експерти в областите:</h2>
          <p className="mb-10 text-white/70">Търговия, ИТ, Производство, Транспорт, Електронна търговия</p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            {[
              { icon: ShoppingBag, label: 'Търговия' },
              { icon: Cpu, label: 'ИТ' },
              { icon: Factory, label: 'Производство' },
              { icon: Truck, label: 'Транспорт' },
              { icon: Globe, label: 'Е-търговия' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-white/10 bg-white/5 p-6 text-center backdrop-blur"
              >
                <s.icon className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
                <p className="font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-3xl">
          <Card className="border-0 bg-gradient-to-br from-emerald-50 to-white shadow-lg">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center md:flex-row md:text-left">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                <ShieldCheck className="h-9 w-9 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[hsl(220,45%,15%)]">
                  Вече над 50 счетоводни кантори
                </p>
                <p className="text-muted-foreground">се довериха на нашата платформа.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Registration Form */}
      <section id="partner-form" className="bg-muted/30 px-4 py-16">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 md:p-10">
              <h2 className="mb-2 text-center text-3xl font-bold">Заявете интерес за участие</h2>
              <p className="mb-8 text-center text-muted-foreground">
                Попълнете формата и нашият екип ще се свърже с Вас
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="firm_name">Име на кантора / Счетоводител *</Label>
                  <Input
                    id="firm_name"
                    value={form.firm_name}
                    onChange={(e) => setForm({ ...form, firm_name: e.target.value })}
                    placeholder="Име"
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">Град</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="напр. София"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Години опит</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min="0"
                      value={form.experience_years}
                      onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                      placeholder="напр. 5"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Имейл за връзка *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@domain.bg"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                  disabled={loading}
                >
                  {loading ? 'Изпращане...' : 'Изпрати заявка'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="bg-[hsl(220,45%,15%)] px-4 py-6 text-center text-sm text-white/60">
        © {new Date().getFullYear()} AccountPro — Партньорска програма
      </footer>
    </div>
  );
}
