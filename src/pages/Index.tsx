import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Shield, FileText, Users, Star, ArrowRight, Euro, MapPin, Filter, BookOpen, Phone, Mail, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AccountantReviews from '@/components/AccountantReviews';

/* ── Services data ── */
const SERVICE_CARDS = [
  {
    icon: Shield,
    title: 'Одит',
    price: '250–300 €',
    description: 'Финансов одит и ревизии',
    details: 'Независима проверка на финансовите отчети съгласно международните стандарти. Вътрешен одит и контрол, ревизии по искане на ръководството, одит за съответствие с нормативната уредба. Резултатите помагат за по-информирани управленски решения.',
    searchQuery: 'Одит',
  },
  {
    icon: Users,
    title: 'Счетоводно обслужване ТРЗ, осигуровки и Човешки ресурси',
    price: '100–150 €',
    description: 'ТРЗ, кадри, осигуровки',
    details: 'Изготвяне на ведомости за заплати, трудови договори, допълнителни споразумения и заповеди за прекратяване. Подаване на осигурителни декларации, болнични листове и документи към НАП и НОИ. Цялостно кадрово обслужване.',
    searchQuery: 'Човешки ресурси',
  },
  {
    icon: FileText,
    title: 'Данъци',
    price: '80–100 €',
    description: 'Данъчни декларации и планиране',
    details: 'Професионално данъчно планиране и оптимизация. Подготовка и подаване на данъчни декларации по ДДС, ЗДДФЛ и ЗКПО. Представителство пред НАП при проверки и ревизии. Минимизиране на данъчната тежест при спазване на закона.',
    searchQuery: 'Данъчно обслужване',
  },
  {
    icon: Star,
    title: 'Пълно счетоводство',
    price: '180–220 €',
    description: 'Цялостно счетоводно обслужване',
    details: 'Текущо осчетоводяване на документи, годишно счетоводно приключване, изготвяне на финансови отчети и справки за управлението. Работим с всички видове предприятия — от еднолични търговци до големи компании.',
    searchQuery: 'Пълно счетоводство',
  },
];

const SPECIALIZATIONS = ['Одит', 'Човешки ресурси', 'Данъчно обслужване', 'Пълно счетоводство', 'ДДС', 'Заплати', 'ЗДДФЛ', 'ЗКПО'];

interface DirectoryEntry {
  id: string;
  full_name: string;
  city: string | null;
  specialization: string[] | null;
  qualification: string | null;
  ides_number: string | null;
  source: string;
  email: string | null;
  phone: string | null;
}

const steps = [
  { step: '01', title: 'Търсете', description: 'Намерете счетоводител по специализация, рейтинг или цена.' },
  { step: '02', title: 'Заявете', description: 'Изпратете заявка за услуга и опишете нуждите си.' },
  { step: '03', title: 'Работете', description: 'Обменяйте документи и съобщения в реално време.' },
];

/* ── Inline Star Rating ── */
function InlineStarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${star <= Math.round(value) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get('service');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [cityFilter, setCityFilter] = useState('all');
  const [specFilter, setSpecFilter] = useState('all');
  const [directory, setDirectory] = useState<DirectoryEntry[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [selectedAccountant, setSelectedAccountant] = useState<DirectoryEntry | null>(null);
  const [reviewCounts, setReviewCounts] = useState<Record<string, { avg: number; count: number }>>({});

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (serviceParam) {
      const match = SERVICE_CARDS.find(s => s.title.includes(serviceParam) || s.searchQuery.includes(serviceParam));
      if (match) {
        setExpandedService(match.title);
        setTimeout(() => {
          document.querySelector('#services-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      }
    }
  }, [serviceParam]);

  const fetchAll = async () => {
    setLoading(true);
    const { data: dirData } = await supabase
      .from('auditor_directory')
      .select('id, full_name, city, specialization, qualification, ides_number, source, email, phone');
    const entries = (dirData as any[]) || [];
    setDirectory(entries);
    const uniqueCities = [...new Set(entries.map((d: any) => d.city).filter(Boolean))] as string[];
    uniqueCities.sort((a, b) => a.localeCompare(b, 'bg'));
    setCities(uniqueCities);

    // Fetch review averages
    const { data: reviews } = await supabase
      .from('accountant_reviews')
      .select('accountant_id, rating');
    if (reviews) {
      const map: Record<string, { total: number; count: number }> = {};
      (reviews as any[]).forEach((r: any) => {
        if (!map[r.accountant_id]) map[r.accountant_id] = { total: 0, count: 0 };
        map[r.accountant_id].total += r.rating;
        map[r.accountant_id].count += 1;
      });
      const result: Record<string, { avg: number; count: number }> = {};
      Object.entries(map).forEach(([id, v]) => { result[id] = { avg: v.total / v.count, count: v.count }; });
      setReviewCounts(result);
    }
    setLoading(false);
  };

  const filterEntries = (source: string) => directory.filter((d) => {
    if (d.source !== source) return false;
    const q = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery || d.full_name.toLowerCase().includes(q) || d.city?.toLowerCase().includes(q) || d.qualification?.toLowerCase().includes(q) || d.specialization?.some(s => s.toLowerCase().includes(q));
    const matchesCity = cityFilter === 'all' || d.city === cityFilter;
    const matchesSpec = specFilter === 'all' || d.specialization?.includes(specFilter);
    return matchesQuery && matchesCity && matchesSpec;
  });

  const filteredPlatform = filterEntries('platform');
  const filteredIdes = filterEntries('ides');

  const clearFilters = () => { setSearchQuery(''); setCityFilter('all'); setSpecFilter('all'); };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); };

  const renderAccountantCard = (d: DirectoryEntry) => {
    const rv = reviewCounts[d.id];
    return (
      <Card
        key={d.id}
        className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
        onClick={() => setSelectedAccountant(d)}
      >
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {d.full_name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">{d.full_name}</h3>
              {d.city && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {d.city}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {d.specialization?.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
            ))}
          </div>
          {d.qualification && <p className="mt-2 text-xs text-muted-foreground line-clamp-1">{d.qualification}</p>}
          {d.ides_number && <p className="text-xs text-muted-foreground">ИДЕС №{d.ides_number}</p>}
          {/* Inline rating */}
          <div className="mt-2 flex items-center gap-2">
            {rv ? (
              <>
                <InlineStarRating value={rv.avg} />
                <span className="text-xs text-muted-foreground">({rv.count})</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Няма оценки</span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 md:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/30">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="container mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-extrabold tracking-tight md:text-6xl"
          >
            Търси <span className="text-primary">счетоводител</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
          >
            Платформа за професионални счетоводни услуги — одит, данъци, ТРЗ и пълно обслужване. Бързо, лесно, сигурно.
          </motion.p>
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            onSubmit={handleSearch}
            className="mx-auto mt-8 flex max-w-xl items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Търсете по име, град, специализация..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.form>
        </div>
      </section>

      {/* Services & Prices */}
      <section id="services-section" className="container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl font-bold"
        >Услуги и цени</motion.h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                          onClick={(e) => { e.stopPropagation(); setSearchQuery(s.searchQuery); }}
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
      </section>

      {/* Search Filters + Results */}
      <section id="search-results" className="bg-muted/30 px-4 py-16">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6">Намерете счетоводител</h2>
          <div className="flex flex-wrap items-end gap-3 mb-8">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Търсене по име, град..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[180px]">
                <MapPin className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Град" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички градове</SelectItem>
                {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={specFilter} onValueChange={setSpecFilter}>
              <SelectTrigger className="w-[220px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Специализация" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички специализации</SelectItem>
                {SPECIALIZATIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {(searchQuery || cityFilter !== 'all' || specFilter !== 'all') && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>Изчисти филтрите</Button>
            )}
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-10">Зареждане...</div>
          ) : (
            <Tabs defaultValue="platform">
              <TabsList>
                <TabsTrigger value="platform" className="gap-2">
                  <Users className="h-4 w-4" /> Платформа ({filteredPlatform.length})
                </TabsTrigger>
                <TabsTrigger value="directory" className="gap-2">
                  <BookOpen className="h-4 w-4" /> Регистър ИДЕС ({filteredIdes.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="platform" className="mt-6">
                {filteredPlatform.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">Няма намерени счетоводители в платформата.</div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredPlatform.map(renderAccountantCard)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="directory" className="mt-6">
                {filteredIdes.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">Няма намерени одитори с тези критерии.</div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredIdes.map(renderAccountantCard)}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl font-bold"
        >Как работи?</motion.h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
      </section>

      {/* CTA */}
      <section className="bg-muted/50 px-4 py-20 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold"
        >Готови ли сте?</motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-2 max-w-lg text-muted-foreground"
        >
          Регистрирайте се безплатно — като клиент или като счетоводител.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <Button size="lg" onClick={() => navigate('/register')}>
            Регистрация <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </section>

      {/* Accountant Detail Dialog */}
      <Dialog open={!!selectedAccountant} onOpenChange={(open) => !open && setSelectedAccountant(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedAccountant && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {selectedAccountant.full_name[0]}
                  </div>
                  <div>
                    <span>{selectedAccountant.full_name}</span>
                    {selectedAccountant.city && (
                      <p className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {selectedAccountant.city}
                      </p>
                    )}
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Contact info */}
                <div className="rounded-lg border p-4 space-y-2">
                  <h4 className="font-semibold text-sm">Контакти</h4>
                  {selectedAccountant.email && (
                    <p className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <a href={`mailto:${selectedAccountant.email}`} className="text-primary hover:underline">{selectedAccountant.email}</a>
                    </p>
                  )}
                  {selectedAccountant.phone && (
                    <p className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      <a href={`tel:${selectedAccountant.phone}`} className="text-primary hover:underline">{selectedAccountant.phone}</a>
                    </p>
                  )}
                  {!selectedAccountant.email && !selectedAccountant.phone && (
                    <p className="text-sm text-muted-foreground">Няма налична информация за контакт.</p>
                  )}
                </div>

                {/* Specializations */}
                {selectedAccountant.specialization && selectedAccountant.specialization.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedAccountant.specialization.map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                )}

                {selectedAccountant.qualification && (
                  <p className="text-sm text-muted-foreground">{selectedAccountant.qualification}</p>
                )}
                {selectedAccountant.ides_number && (
                  <p className="text-sm text-muted-foreground">ИДЕС №{selectedAccountant.ides_number}</p>
                )}

                {/* Actions */}
                {selectedAccountant.source === 'platform' && (
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => { setSelectedAccountant(null); navigate(`/contact-accountant/${selectedAccountant.id}`); }}>
                      Свържи се
                    </Button>
                    <Button variant="outline" onClick={() => { setSelectedAccountant(null); navigate('/consultations'); }}>
                      Консултация
                    </Button>
                  </div>
                )}

                {/* Reviews */}
                <AccountantReviews accountantId={selectedAccountant.id} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
