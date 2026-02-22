import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, FileText, Star, Check, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const services = [
  {
    icon: Shield,
    title: 'Одит',
    description:
      'Независимата проверка на финансовите отчети е ключов елемент за доверието към вашия бизнес. Нашият екип извършва пълен финансов одит съгласно международните стандарти. Предлагаме вътрешен одит и контрол, ревизии по искане на ръководството, както и одит за съответствие с нормативната уредба. Резултатите от одита ви помагат да вземате по-информирани управленски решения.',
  },
  {
    icon: Users,
    title: 'Човешки ресурси',
    description:
      'Поемаме цялостното администриране на трудовите правоотношения във вашата фирма. Изготвяме ведомости за заплати, трудови договори, допълнителни споразумения и заповеди за прекратяване. Подаваме осигурителни декларации, болнични листове и всички необходими документи към НАП и НОИ. Така вие се фокусирате върху бизнеса, а ние се грижим за кадровата документация.',
  },
  {
    icon: FileText,
    title: 'Данъчно обслужване',
    description:
      'Предлагаме професионално данъчно планиране и оптимизация, съобразени с актуалното законодателство. Подготвяме и подаваме данъчни декларации по ДДС, ЗДДФЛ и ЗКПО в срок и без грешки. Осигуряваме представителство пред НАП при проверки и ревизии. Нашата цел е да минимизираме данъчната ви тежест при пълно спазване на закона.',
  },
  {
    icon: Star,
    title: 'Пълно счетоводство',
    description:
      'Цялостното счетоводно обслужване включва текущо осчетоводяване на всички документи и операции. Извършваме годишно счетоводно приключване и изготвяме финансови отчети, готови за подаване. Предоставяме регулярни справки за управлението, за да имате ясна картина за финансовото състояние на бизнеса. Работим с всички видове предприятия — от еднолични търговци до големи компании.',
  },
];

const pricingPlans = [
  {
    name: 'Старт',
    price: 100,
    badge: null,
    features: [
      'Текущо осчетоводяване до 50 документа',
      'Месечна ДДС декларация',
      'Годишно счетоводно приключване',
      'Годишна данъчна декларация',
      'Консултация по имейл',
    ],
  },
  {
    name: 'Стандарт',
    price: 120,
    badge: 'Популярен',
    features: [
      'Текущо осчетоводяване до 100 документа',
      'Месечна ДДС декларация',
      'Годишно счетоводно приключване',
      'Годишна данъчна декларация',
      'ТРЗ и кадри до 5 служители',
      'Данъчни консултации по телефон и имейл',
      'Справки за управлението',
    ],
  },
  {
    name: 'Премиум',
    price: 150,
    badge: 'Най-пълен',
    features: [
      'Текущо осчетоводяване — неограничен брой документи',
      'Месечна ДДС декларация',
      'Годишно счетоводно приключване',
      'Годишна данъчна декларация',
      'ТРЗ и кадри до 15 служители',
      'Данъчно планиране и оптимизация',
      'Справки и анализи за управлението',
      'Представителство пред НАП',
      'Онлайн връзка — неограничено',
      'Приоритетна поддръжка',
    ],
  },
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/30 px-4 py-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold tracking-tight md:text-5xl"
        >
          Услуги и <span className="text-primary">цени</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-3 max-w-2xl text-muted-foreground"
        >
          Разгледайте нашите професионални счетоводни услуги и изберете пакета, който отговаря на вашите нужди.
        </motion.p>
      </section>

      {/* Services */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/30">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="rounded-xl bg-primary/10 p-3">
                      <s.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">{s.title}</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{s.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center text-muted-foreground"
        >
          При желание за допълнителна информация,{' '}
          <button onClick={() => { const el = document.getElementById('footer'); el?.scrollIntoView({ behavior: 'smooth' }); }} className="text-primary font-semibold underline underline-offset-4 hover:text-primary/80 transition-colors">
            свържете се с нас
          </button>.
        </motion.p>
      </section>

      {/* Pricing */}
      <section className="bg-muted/50 px-4 py-16">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="text-center text-3xl font-bold"
          >
            Абонаментни пакети
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-2 max-w-xl text-center text-muted-foreground"
          >
            Месечни абонаменти за счетоводно обслужване на вашия бизнес.
          </motion.p>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <Card className={`h-full flex flex-col transition-all hover:shadow-lg ${plan.badge === 'Най-пълен' ? 'border-primary shadow-md' : 'hover:border-primary/30'}`}>
                  <CardHeader className="text-center pb-2">
                    {plan.badge && (
                      <Badge className="mx-auto mb-2 w-fit">{plan.badge}</Badge>
                    )}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-4xl font-extrabold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">€ / месец</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pt-4">
                    <ul className="space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-6 w-full" variant={plan.badge === 'Най-пълен' ? 'default' : 'outline'} onClick={() => navigate('/register')}>
                      Започнете сега <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
