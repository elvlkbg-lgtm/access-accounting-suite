import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Calculator, User, Briefcase, ArrowLeft, ArrowRight, X, MapPin } from 'lucide-react';

const SPECIALIZATION_OPTIONS = [
  'Пълно счетоводство', 'Данъчно обслужване', 'ДДС', 'ЗДДФЛ', 'ЗКПО',
  'Човешки ресурси', 'Заплати', 'Одит', 'Осигуровки', 'ТРЗ',
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'client' | 'accountant' | null>(null);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1);

  const totalSteps = role === 'accountant' ? 5 : 3;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
          role,
          ...(role === 'accountant' ? { specializations, city: city.trim() || null } : {}),
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // If accountant, also insert into auditor_directory so they appear in search
    // This happens via the handle_new_user trigger for accountant_profiles,
    // but we also need an auditor_directory entry with source='platform'
    // We'll update the profile and directory after signup confirmation.
    // For now, the trigger handles accountant_profiles.

    toast.success('Регистрацията е успешна! Проверете имейла си за потвърждение.');
    navigate('/login');
    setLoading(false);
  };

  const toggleSpec = (s: string) => {
    setSpecializations(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const goNext = () => { setDirection(1); setStep(s => s + 1); };
  const goBack = () => { setDirection(-1); setStep(s => s - 1); };

  const canProceedStep1 = role !== null;
  const canProceedStep2 = firstName.trim().length > 1 && lastName.trim().length > 1;
  const canProceedStep3Acc = specializations.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-20">
        <Card className="w-full max-w-md overflow-hidden">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Регистрация</CardTitle>
            <CardDescription>Стъпка {step} от {totalSteps}</CardDescription>
            <div className="mt-3 flex gap-2">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister}>
              <AnimatePresence mode="wait" custom={direction}>
                {step === 1 && (
                  <motion.div key="step1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
                    <Label className="text-base font-medium">Изберете тип акаунт</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button type="button" onClick={() => setRole('client')}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-6 transition-all ${role === 'client' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                        <User className={`h-8 w-8 ${role === 'client' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-semibold">Клиент</span>
                        <span className="text-xs text-muted-foreground text-center">Търсите счетоводител</span>
                      </button>
                      <button type="button" onClick={() => setRole('accountant')}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-6 transition-all ${role === 'accountant' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                        <Briefcase className={`h-8 w-8 ${role === 'accountant' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-semibold">Счетоводител</span>
                        <span className="text-xs text-muted-foreground text-center">Предлагате услуги</span>
                      </button>
                    </div>
                    <Button type="button" className="w-full" disabled={!canProceedStep1} onClick={goNext}>
                      Продължи <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Име *</Label>
                      <Input id="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Иван" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия *</Label>
                      <Input id="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Иванов" />
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={goBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                      </Button>
                      <Button type="button" className="flex-1" disabled={!canProceedStep2} onClick={goNext}>
                        Продължи <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && role === 'accountant' && (
                  <motion.div key="step3acc" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
                    <Label className="text-base font-medium">Специализация *</Label>
                    <p className="text-xs text-muted-foreground">Изберете поне една специализация</p>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALIZATION_OPTIONS.map((s) => (
                        <Badge
                          key={s}
                          variant={specializations.includes(s) ? 'default' : 'outline'}
                          className="cursor-pointer text-sm px-3 py-1.5 transition-all"
                          onClick={() => toggleSpec(s)}
                        >
                          {s}
                          {specializations.includes(s) && <X className="ml-1 h-3 w-3" />}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={goBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                      </Button>
                      <Button type="button" className="flex-1" disabled={!canProceedStep3Acc} onClick={goNext}>
                        Продължи <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {((step === 3 && role === 'client') || (step === 4 && role === 'accountant')) && (
                  <motion.div key="stepFinal" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Имейл *</Label>
                      <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Парола *</Label>
                      <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} />
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={goBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                      </Button>
                      <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? 'Регистриране...' : 'Регистрация'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Имате акаунт?{' '}
              <Link to="/login" className="text-primary hover:underline">Влезте</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
