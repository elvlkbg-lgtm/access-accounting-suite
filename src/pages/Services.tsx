import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, FileText, Users, Shield, Euro, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SERVICE_CARDS = [
  {
    icon: Star,
    title: 'Пълно счетоводство',
    price: '180–220 €',
    description: 'Цялостно счетоводно обслужване',
    details: 'Текущо осчетоводяване на документи, годишно счетоводно приключване, изготвяне на финансови отчети и справки за управлението. Работим с всички видове предприятия — от еднолични търговци до големи компании.',
    searchQuery: 'Пълно счетоводство',
  },
  {
    icon: FileText,
    title: 'Счетоводни услуги Данъци',
    price: '80–100 €',
    description: 'Данъчни декларации и планиране',
    details: 'Професионално данъчно планиране и оптимизация. Подготовка и подаване на данъчни декларации по ДДС, ЗДДФЛ и ЗКПО. Представителство пред НАП при проверки и ревизии. Минимизиране на данъчната тежест при спазване на закона.',
    searchQuery: 'Данъчно обслужване',
  },
  {
    icon: Users,
    title: 'Счетоводни услуги ТРЗ и Човешки ресурси',
    price: '100–150 €',
    description: 'ТРЗ, кадри, осигуровки',
    details: 'Изготвяне на ведомости за заплати, трудови договори, допълнителни споразумения и заповеди за прекратяване. Подаване на осигурителни декларации, болнични листове и документи към НАП и НОИ. Цялостно кадрово обслужване.',
    searchQuery: 'Човешки ресурси',
  },
  {
    icon: Shield,
    title: 'Счетоводни услуги Одит',
    price: '250–300 €',
    description: 'Финансов одит и ревизии',
    details: 'Независима проверка на финансовите отчети съгласно международните стандарти. Вътрешен одит и контрол, ревизии по искане на ръководството, одит за съответствие с нормативната уредба. Резултатите помагат за по-информирани управленски решения.',
    searchQuery: 'Одит',
  },
];

export default function Services() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get('service');
  const [expandedService, setExpandedService] = useState<string | null>(null);

  useEffect(() => {
    if (serviceParam) {
      const match = SERVICE_CARDS.find(s => s.title.includes(serviceParam) || s.searchQuery.includes(serviceParam));
      if (match) setExpandedService(match.title);
    }
  }, [serviceParam]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl font-bold md:text-4xl"
        >
          Услуги и цени
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-3 max-w-xl text-center text-muted-foreground"
        >
          Разгледайте нашите счетоводни услуги и намерете подходящия специалист за вашия бизнес.
        </motion.p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_CARDS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card
                className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/40 h-full"
                onClick={() => setExpandedService(expandedService === s.title ? null : s.title)}
              >
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="rounded-xl bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                    <s.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold leading-tight">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                  <Badge className="mt-2" variant="outline">
                    <Euro className="mr-1 h-3 w-3" /> {s.price}
                  </Badge>
                  <AnimatePresence>
                    {expandedService === s.title && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-4 text-xs text-muted-foreground/80 leading-relaxed text-left">{s.details}</p>
                        <Button
                          size="sm"
                          className="mt-3 w-full"
                          onClick={(e) => { e.stopPropagation(); navigate(`/search?q=${encodeURIComponent(s.searchQuery)}`); }}
                        >
                          Намери специалист <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
