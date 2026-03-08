import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Calendar, Clock, ArrowRight, BookOpen, Newspaper, Lightbulb, Scale, ExternalLink, FileText, HelpCircle, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Category = 'all' | 'news' | 'tips' | 'guides';

const FAQ_ITEMS = [
  { q: 'Кога трябва да се регистрирам по ДДС?', a: 'Задължителна регистрация по ЗДДС е необходима при достигане на облагаем оборот от 100 000 лв. за последните 12 последователни месеца. Доброволна регистрация може да се направи по всяко време.' },
  { q: 'Какви документи са нужни за счетоводно обслужване?', a: 'Основните документи включват: фактури (покупки и продажби), банкови извлечения, касови бележки, договори, ведомости за заплати и осигурителни декларации. Счетоводителят ви ще ви предостави пълен списък.' },
  { q: 'Какъв е срокът за подаване на годишна данъчна декларация?', a: 'За юридически лица (ЗКПО) — до 30 юни на следващата година. За физически лица (ЗДДФЛ) — до 30 април. При подаване по електронен път за физически лица срокът е до 30 април с 5% отстъпка.' },
  { q: 'Колко струва счетоводно обслужване?', a: 'Цената зависи от вида дейност, броя документи и служители. Ориентировъчно: от 100 лв./месец за малки фирми до 50 документа, до 300+ лв./месец за по-големи компании с пълно обслужване и ТРЗ.' },
  { q: 'Какви са осигуровките за самоосигуряващи се лица?', a: 'Минималният осигурителен доход за 2026 г. е 933 лв. Общият размер на осигуровките е около 31.3% за всички осигурителни рискове. Минималната месечна вноска е приблизително 292 лв.' },
  { q: 'Трябва ли да имам касов апарат?', a: 'Да, ако извършвате продажби на стоки или услуги на физически лица и плащането е в брой или с карта. Има изключения за някои свободни професии и електронна търговия при определени условия.' },
  { q: 'Какво представлява инвентаризацията и кога се прави?', a: 'Инвентаризацията е проверка на наличните активи и пасиви. Задължително се извършва поне веднъж годишно преди годишното счетоводно приключване.' },
  { q: 'Мога ли да сменя счетоводителя си по средата на годината?', a: 'Да, можете да смените счетоводителя си по всяко време. Важно е да получите всички счетоводни документи и бази данни от предишния счетоводител и да уведомите НАП за новия упълномощен представител.' },
  { q: 'Какви глоби грозят при неподадена данъчна декларация?', a: 'За физически лица — от 500 до 3000 лв. за всеки отделен случай. За юридически лица — от 500 до 5000 лв. При повторно нарушение глобите се удвояват.' },
  { q: 'Какви са предимствата на електронното счетоводство?', a: 'Електронното счетоводство осигурява бърз достъп до документи, автоматизация на процесите, по-малко грешки, спестено време и възможност за работа от разстояние. Също така улеснява комуникацията с НАП.' },
];

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  source_name: string | null;
  source_url: string | null;
  published_at: string;
}

// Fallback static articles
const STATIC_ARTICLES: Article[] = [
  { id: '1', title: 'Промени в ЗДДС за 2026 г. — какво трябва да знаете', excerpt: 'Новите изменения в Закона за данък добавена стойност влизат в сила от 1 юли 2026 г.', content: null, category: 'news', source_name: null, source_url: null, published_at: '2026-02-20' },
  { id: '2', title: '10 съвета за оптимизиране на данъците на вашата фирма', excerpt: 'Законни начини да намалите данъчната тежест и да увеличите печалбата си.', content: null, category: 'tips', source_name: null, source_url: null, published_at: '2026-02-18' },
  { id: '3', title: 'Как да изберете правилния счетоводител за вашия бизнес', excerpt: 'Пълно ръководство за избор на счетоводител — на какво да обърнете внимание.', content: null, category: 'guides', source_name: null, source_url: null, published_at: '2026-02-15' },
  { id: '4', title: 'Нови правила за касовите апарати от март 2026', excerpt: 'НАП въвежда нови изисквания за фискалните устройства.', content: null, category: 'news', source_name: null, source_url: null, published_at: '2026-02-12' },
  { id: '5', title: 'Осигуровки за самоосигуряващи се лица — пълен гайд', excerpt: 'Всичко за осигурителните вноски — минимални и максимални прагове, срокове.', content: null, category: 'guides', source_name: null, source_url: null, published_at: '2026-02-10' },
  { id: '6', title: '5 грешки в счетоводството, които струват скъпо', excerpt: 'Често допускани счетоводни грешки, които водят до глоби от НАП.', content: null, category: 'tips', source_name: null, source_url: null, published_at: '2026-02-08' },
];

const CATEGORY_ICONS = { news: Newspaper, tips: Lightbulb, guides: BookOpen };
const CATEGORY_LABELS: Record<string, string> = { news: 'Новини', tips: 'Съвети', guides: 'Ръководства' };

/* ── Laws & normative documents ── */
interface LawEntry {
  id: string;
  title: string;
  shortName?: string;
  category: 'law' | 'standard' | 'international';
  sourceUrl: string;
  source: string;
  summary: string;
}

const LAWS: LawEntry[] = [
  { id: 'zs', title: 'Закон за счетоводството', shortName: 'ЗСч', category: 'law', sourceUrl: 'https://lex.bg/bg/laws/ldoc/2136697598', source: 'lex.bg', summary: 'Урежда изискванията към счетоводното отчитане, счетоводните стандарти, финансовите отчети и тяхната публичност.' },
  { id: 'zdds', title: 'Закон за данък върху добавената стойност', shortName: 'ЗДДС', category: 'law', sourceUrl: 'https://nra.bg/wps/portal/nra/zakonodatelstvo/zakonodatelstvo_priority/11e9f37c-163e-4951-a43b-6018591e6fa7', source: 'nra.bg', summary: 'Регламентира облагането с ДДС — регистрация, ставки, приспадане на данъчен кредит, освободени доставки.' },
  { id: 'zkpo', title: 'Закон за корпоративното подоходно облагане', shortName: 'ЗКПО', category: 'law', sourceUrl: 'https://lex.bg/laws/ldoc/2135540562', source: 'lex.bg', summary: 'Определя облагането на печалбите на юридическите лица — корпоративен данък 10%, данък при източника.' },
  { id: 'zddfl', title: 'Закон за данъците върху доходите на физическите лица', shortName: 'ЗДДФЛ', category: 'law', sourceUrl: 'https://www.lex.bg/laws/ldoc/2135538631', source: 'lex.bg', summary: 'Регулира облагането на доходите на физическите лица. Плоска ставка от 10%.' },
  { id: 'kso', title: 'Кодекс за социално осигуряване', shortName: 'КСО', category: 'law', sourceUrl: 'https://www.lex.bg/laws/ldoc/1597824512', source: 'lex.bg', summary: 'Урежда държавното обществено осигуряване — пенсии, болнични, майчинство, безработица.' },
  { id: 'tz', title: 'Търговски закон', shortName: 'ТЗ', category: 'law', sourceUrl: 'https://lex.bg/laws/ldoc/-14917630', source: 'lex.bg', summary: 'Основният закон, уреждащ търговската дейност — видове търговски дружества, учредяване, управление.' },
  { id: 'nss', title: 'Национални счетоводни стандарти (НСС)', category: 'standard', sourceUrl: 'https://kik-info.com/normativna-baza/nss/', source: 'kik-info.com', summary: 'Комплект от стандарти, приложими за предприятия, които не прилагат МСФО.' },
  { id: 'ifrs', title: 'Международни стандарти за финансово отчитане (МСФО)', category: 'international', sourceUrl: 'https://eur-lex.europa.eu/BG/legal-content/summary/international-financial-reporting-standards-ifrs-adopted-by-the-european-union.html', source: 'eur-lex.europa.eu', summary: 'МСФО, приети от ЕС — задължителни за публични дружества и консолидирани отчети.' },
];

const CATEGORY_LAW_LABELS: Record<string, string> = { law: 'Закон', standard: 'Стандарт', international: 'Международен' };

const NRA_NEWS = [
  { title: 'Данъчно-осигурителен календар 2026', url: 'https://nra.bg/wps/portal/nra/nachalo', description: 'Актуален календар с крайни срокове за деклариране и плащане на данъци и осигуровки.' },
  { title: 'Актуални новини от НАП', url: 'https://nra.bg/wps/portal/nra/nachalo', description: 'Последни съобщения, промени в законодателството и указания от НАП.' },
];

export default function Blog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [activeTab, setActiveTab] = useState<'articles' | 'laws' | 'faq'>('articles');
  const [lawFilter, setLawFilter] = useState<'all' | 'law' | 'standard' | 'international'>('all');
  const [articles, setArticles] = useState<Article[]>(STATIC_ARTICLES);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('blog_articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50);

    if (data && data.length > 0) {
      setArticles([...data as Article[], ...STATIC_ARTICLES]);
    }
  };

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || (a.excerpt || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || a.category === category;
    return matchSearch && matchCat;
  });

  const filteredLaws = LAWS.filter((l) => lawFilter === 'all' || l.category === lawFilter);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('bg-BG');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Блог</h1>
          <p className="mt-2 text-muted-foreground">Статии, новини, съвети и нормативни документи</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-8">
          <TabsList className="mx-auto flex w-fit">
            <TabsTrigger value="articles" className="gap-1"><Newspaper className="h-4 w-4" /> Статии</TabsTrigger>
            <TabsTrigger value="laws" className="gap-1"><Scale className="h-4 w-4" /> Закони</TabsTrigger>
            <TabsTrigger value="faq" className="gap-1"><HelpCircle className="h-4 w-4" /> ЧЗВ</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'articles' && (
          <>
            <div className="mx-auto mb-6 flex max-w-xl items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Търси статия..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
            </div>

            <Tabs value={category} onValueChange={(v) => setCategory(v as Category)} className="mb-8">
              <TabsList className="mx-auto flex w-fit">
                <TabsTrigger value="all">Всички</TabsTrigger>
                <TabsTrigger value="news">Новини</TabsTrigger>
                <TabsTrigger value="tips">Съвети</TabsTrigger>
                <TabsTrigger value="guides">Ръководства</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((article) => {
                const Icon = CATEGORY_ICONS[article.category as keyof typeof CATEGORY_ICONS];
                return (
                  <Card key={article.id} className="flex flex-col transition-all hover:shadow-lg hover:border-primary/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {Icon && <Icon className="h-3 w-3" />}
                          {CATEGORY_LABELS[article.category] || article.category}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(article.published_at)}
                        </span>
                      </div>
                      <CardTitle className="mt-3 text-lg leading-tight">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-between">
                      <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                      <div className="mt-4 flex items-center justify-between">
                        {article.source_name && (
                          <span className="text-xs text-muted-foreground">Източник: {article.source_name}</span>
                        )}
                        {article.content && (
                          <Button variant="ghost" size="sm" className="text-primary" onClick={() => setSelectedArticle(article)}>
                            Прочети <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">Няма намерени статии.</p>
            )}

            {/* Article detail dialog */}
            {selectedArticle && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedArticle(null)}>
                <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                  <Badge variant="secondary" className="mb-3">
                    {CATEGORY_LABELS[selectedArticle.category] || selectedArticle.category}
                  </Badge>
                  <h2 className="text-2xl font-bold mb-2">{selectedArticle.title}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{formatDate(selectedArticle.published_at)}{selectedArticle.source_name && ` • ${selectedArticle.source_name}`}</p>
                  <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
                    {selectedArticle.content}
                  </div>
                  <Button className="mt-6" variant="outline" onClick={() => setSelectedArticle(null)}>Затвори</Button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'laws' && (
          <div className="mx-auto max-w-4xl space-y-8">
            <Tabs value={lawFilter} onValueChange={(v) => setLawFilter(v as any)}>
              <TabsList className="mx-auto flex w-fit">
                <TabsTrigger value="all">Всички</TabsTrigger>
                <TabsTrigger value="law">Закони</TabsTrigger>
                <TabsTrigger value="standard">Стандарти</TabsTrigger>
                <TabsTrigger value="international">Международни</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid gap-4 sm:grid-cols-2">
              {filteredLaws.map((law) => (
                <Card key={law.id} className="transition-all hover:shadow-lg hover:border-primary/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={law.category === 'law' ? 'default' : law.category === 'standard' ? 'secondary' : 'outline'}>
                        {CATEGORY_LAW_LABELS[law.category]}
                      </Badge>
                      {law.shortName && <span className="text-xs font-mono text-muted-foreground">{law.shortName}</span>}
                    </div>
                    <CardTitle className="mt-2 text-base leading-tight">{law.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{law.summary}</p>
                    <a href={law.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" /> Пълен текст на {law.source}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredLaws.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">Няма намерени документи.</p>
            )}

            <div className="pt-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> НАП — Новини и календар
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {NRA_NEWS.map((item, i) => (
                  <Card key={i} className="transition-all hover:shadow-lg hover:border-primary/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" /> Отвори в nra.bg
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 text-center">
              <HelpCircle className="mx-auto h-10 w-10 text-primary mb-3" />
              <h2 className="text-2xl font-bold">Често задавани въпроси</h2>
              <p className="mt-1 text-muted-foreground">Отговори на най-честите въпроси за счетоводните услуги</p>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="rounded-lg border bg-card px-4">
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
