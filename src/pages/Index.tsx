import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Shield, FileText, MessageCircle, Users, Star, ArrowRight, Euro } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState } from 'react';

const specializations = [
  { icon: Shield, title: 'Одит', description: 'Финансов одит и ревизии', details: 'Независима проверка на финансовите отчети, вътрешен одит и контрол, ревизии по искане на ръководството и одит за съответствие с нормативната уредба.' },
  { icon: Users, title: 'Човешки ресурси', details: 'Изготвяне на ведомости за заплати, трудови договори, осигурителни декларации, болнични листове и цялостно кадрово обслужване.', description: 'ТРЗ, кадри, осигуровки' },
  { icon: FileText, title: 'Данъци', details: 'Подготовка и подаване на данъчни декларации (ДДС, ЗДДФЛ, ЗКПО), данъчно планиране и оптимизация, представителство пред НАП.', description: 'Данъчни декларации и планиране' },
  { icon: Star, title: 'Пълно счетоводство', details: 'Текущо осчетоводяване на документи, годишно счетоводно приключване, изготвяне на финансови отчети и справки за управлението.', description: 'Цялостно счетоводно обслужване' },
  { icon: Euro, title: 'Цени', details: 'Разгледайте нашите абонаментни пакети — Старт, Стандарт и Премиум — с прозрачни цени и ясно описани услуги.', description: 'Абонаментни пакети от 100€/мес.' },
];

const steps = [
  { step: '01', title: 'Търсете', description: 'Намерете счетоводител по специализация, рейтинг или цена.' },
  { step: '02', title: 'Заявете', description: 'Изпратете заявка за услуга и опишете нуждите си.' },
  { step: '03', title: 'Работете', description: 'Обменяйте документи и съобщения в реално време.' },
];

export default function Index() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 md:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/30">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-accent/20 blur-2xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="container mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-4xl font-extrabold tracking-tight md:text-6xl"
          >
            Намерете вашия <span className="text-primary">счетоводител</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
          >
            Платформа за професионални счетоводни услуги — одит, данъци, ТРЗ и пълно обслужване. Бързо, лесно, сигурно.
          </motion.p>
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
            onSubmit={handleSearch}
            className="mx-auto mt-8 flex max-w-xl items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Търсете по специализация..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-12">
              Търси
            </Button>
          </motion.form>
        </div>
      </section>

      {/* Specializations */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl font-bold"
        >Услуги и цени</motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-2 max-w-xl text-center text-muted-foreground"
        >
          Изберете категория и намерете подходящия професионалист за вашите нужди.
        </motion.p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {specializations.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/40"
                onClick={() => navigate(s.title === 'Цени' ? '/services#pricing' : `/search?q=${encodeURIComponent(s.title)}`)}>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="rounded-xl bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                    <s.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground/80 leading-relaxed">{s.details}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 px-4 py-20">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="text-center text-3xl font-bold"
          >Как работи?</motion.h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {s.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Accountants */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl font-bold"
        >Топ счетоводители</motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-2 max-w-xl text-center text-muted-foreground"
        >
          Най-високо оценените професионалисти на платформата.
        </motion.p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Мария Иванова', spec: 'Данъци', rating: 4.9, location: 'София', years: 12 },
            { name: 'Георги Петров', spec: 'Пълно счетоводство', rating: 4.8, location: 'Пловдив', years: 8 },
            { name: 'Елена Димитрова', spec: 'ТРЗ и кадри', rating: 4.7, location: 'Варна', years: 15 },
          ].map((acc, i) => (
            <motion.div
              key={acc.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="transition-all hover:shadow-lg hover:border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                      {acc.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold">{acc.name}</h3>
                      <p className="text-xs text-muted-foreground">{acc.location} • {acc.years} г. опит</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">{acc.spec}</Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {acc.rating}
                    </div>
                  </div>
                  <Button className="mt-4 w-full" size="sm" variant="outline" onClick={() => navigate('/search')}>
                    Виж профил
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/50 px-4 py-20">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="text-center text-3xl font-bold"
          >Какво казват клиентите</motion.h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Петър К.', text: 'Намерих перфектния счетоводител за фирмата ми за по-малко от ден. Препоръчвам!' },
              { name: 'Анна С.', text: 'Много удобна платформа. Комуникацията с моя счетоводител е бърза и лесна.' },
              { name: 'Димитър В.', text: 'Прозрачни цени и професионално обслужване. Спестих време и нерви.' },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <Card className="h-full">
                  <CardContent className="flex flex-col p-6">
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="flex-1 text-sm text-muted-foreground italic">"{t.text}"</p>
                    <p className="mt-4 font-semibold text-sm">— {t.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold"
        >Готови ли сте?</motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-2 max-w-lg text-muted-foreground"
        >
          Регистрирайте се безплатно — като клиент или като счетоводител.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <Button size="lg" onClick={() => navigate('/register')}>
            Регистрация <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/search')}>
            <Search className="mr-2 h-4 w-4" /> Разгледайте счетоводители
          </Button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
