import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Calendar, Clock, ArrowRight, BookOpen, Newspaper, Lightbulb, Scale, ChevronDown, ChevronUp, ExternalLink, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Category = 'all' | 'news' | 'tips' | 'guides';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: Category;
  date: string;
  readTime: string;
}

const ARTICLES: Article[] = [
  { id: '1', title: 'Промени в ЗДДС за 2026 г. — какво трябва да знаете', excerpt: 'Новите изменения в Закона за данък добавена стойност влизат в сила от 1 юли 2026 г.', category: 'news', date: '2026-02-20', readTime: '5 мин' },
  { id: '2', title: '10 съвета за оптимизиране на данъците на вашата фирма', excerpt: 'Законни начини да намалите данъчната тежест и да увеличите печалбата си.', category: 'tips', date: '2026-02-18', readTime: '8 мин' },
  { id: '3', title: 'Как да изберете правилния счетоводител за вашия бизнес', excerpt: 'Пълно ръководство за избор на счетоводител — на какво да обърнете внимание.', category: 'guides', date: '2026-02-15', readTime: '10 мин' },
  { id: '4', title: 'Нови правила за касовите апарати от март 2026', excerpt: 'НАП въвежда нови изисквания за фискалните устройства.', category: 'news', date: '2026-02-12', readTime: '4 мин' },
  { id: '5', title: 'Осигуровки за самоосигуряващи се лица — пълен гайд', excerpt: 'Всичко за осигурителните вноски — минимални и максимални прагове, срокове.', category: 'guides', date: '2026-02-10', readTime: '12 мин' },
  { id: '6', title: '5 грешки в счетоводството, които струват скъпо', excerpt: 'Често допускани счетоводни грешки, които водят до глоби от НАП.', category: 'tips', date: '2026-02-08', readTime: '6 мин' },
  { id: '7', title: 'Годишно приключване 2025 — стъпка по стъпка', excerpt: 'Подробно ръководство за годишното счетоводно приключване.', category: 'guides', date: '2026-02-05', readTime: '15 мин' },
  { id: '8', title: 'Дигитализация на счетоводството — тенденции за 2026', excerpt: 'Как технологиите променят счетоводната професия.', category: 'news', date: '2026-02-01', readTime: '7 мин' },
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
  {
    id: 'zs',
    title: 'Закон за счетоводството',
    shortName: 'ЗСч',
    category: 'law',
    sourceUrl: 'https://lex.bg/bg/laws/ldoc/2136697598',
    source: 'lex.bg',
    summary: 'Урежда изискванията към счетоводното отчитане, счетоводните стандарти, финансовите отчети и тяхната публичност. Определя категориите предприятия и приложимите стандарти.',
  },
  {
    id: 'zdds',
    title: 'Закон за данък върху добавената стойност',
    shortName: 'ЗДДС',
    category: 'law',
    sourceUrl: 'https://nra.bg/wps/portal/nra/zakonodatelstvo/zakonodatelstvo_priority/11e9f37c-163e-4951-a43b-6018591e6fa7',
    source: 'nra.bg',
    summary: 'Регламентира облагането с ДДС — регистрация, ставки, приспадане на данъчен кредит, освободени доставки, вътреобщностни придобивания и доставки.',
  },
  {
    id: 'zkpo',
    title: 'Закон за корпоративното подоходно облагане',
    shortName: 'ЗКПО',
    category: 'law',
    sourceUrl: 'https://lex.bg/laws/ldoc/2135540562',
    source: 'lex.bg',
    summary: 'Определя облагането на печалбите на юридическите лица — корпоративен данък 10%, данък при източника, преобразувания на финансовия резултат, данъчни амортизации.',
  },
  {
    id: 'zddfl',
    title: 'Закон за данъците върху доходите на физическите лица',
    shortName: 'ЗДДФЛ',
    category: 'law',
    sourceUrl: 'https://www.lex.bg/laws/ldoc/2135538631',
    source: 'lex.bg',
    summary: 'Регулира облагането на доходите на физическите лица — трудови, от стопанска дейност, наеми, дивиденти. Плоска ставка от 10%.',
  },
  {
    id: 'kso',
    title: 'Кодекс за социално осигуряване',
    shortName: 'КСО',
    category: 'law',
    sourceUrl: 'https://www.lex.bg/laws/ldoc/1597824512',
    source: 'lex.bg',
    summary: 'Урежда държавното обществено осигуряване — пенсии, болнични, майчинство, безработица, трудови злополуки. Определя осигурителни вноски и прагове.',
  },
  {
    id: 'tz',
    title: 'Търговски закон',
    shortName: 'ТЗ',
    category: 'law',
    sourceUrl: 'https://lex.bg/laws/ldoc/-14917630',
    source: 'lex.bg',
    summary: 'Основният закон, уреждащ търговската дейност — видове търговски дружества (ЕТ, ООД, АД), учредяване, управление, преобразуване и ликвидация.',
  },
  {
    id: 'nss',
    title: 'Национални счетоводни стандарти (НСС)',
    category: 'standard',
    sourceUrl: 'https://kik-info.com/normativna-baza/nss/',
    source: 'kik-info.com',
    summary: 'Комплект от стандарти, приложими за предприятия, които не прилагат МСФО. Включват НСС 1-42 — отчитане на приходи, разходи, ДМА, НМА, лизинг, провизии и др.',
  },
  {
    id: 'ifrs',
    title: 'Международни стандарти за финансово отчитане (МСФО)',
    category: 'international',
    sourceUrl: 'https://eur-lex.europa.eu/BG/legal-content/summary/international-financial-reporting-standards-ifrs-adopted-by-the-european-union.html',
    source: 'eur-lex.europa.eu',
    summary: 'МСФО, приети от ЕС — задължителни за публични дружества и консолидирани отчети. Включват МСФО 1-17 и МСС 1-41. Осигуряват единна рамка за финансово отчитане в ЕС.',
  },
];

const CATEGORY_LAW_LABELS: Record<string, string> = {
  law: 'Закон',
  standard: 'Стандарт',
  international: 'Международен',
};

const NRA_NEWS = [
  { title: 'Данъчно-осигурителен календар 2026', url: 'https://nra.bg/wps/portal/nra/nachalo', description: 'Актуален календар с крайни срокове за деклариране и плащане на данъци и осигуровки.' },
  { title: 'Актуални новини от НАП', url: 'https://nra.bg/wps/portal/nra/nachalo', description: 'Последни съобщения, промени в законодателството и указания от Националната агенция за приходите.' },
];

export default function Blog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [activeTab, setActiveTab] = useState<'articles' | 'laws'>('articles');
  const [lawFilter, setLawFilter] = useState<'all' | 'law' | 'standard' | 'international'>('all');

  const filtered = ARTICLES.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || a.category === category;
    return matchSearch && matchCat;
  });

  const filteredLaws = LAWS.filter((l) => lawFilter === 'all' || l.category === lawFilter);

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
            <TabsTrigger value="laws" className="gap-1"><Scale className="h-4 w-4" /> Закони и нормативи</TabsTrigger>
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
                          {CATEGORY_LABELS[article.category]}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.date).toLocaleDateString('bg-BG')}
                        </span>
                      </div>
                      <CardTitle className="mt-3 text-lg leading-tight">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-between">
                      <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {article.readTime}
                        </span>
                        <Button variant="ghost" size="sm" className="text-primary">
                          Прочети <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">Няма намерени статии.</p>
            )}
          </>
        )}

        {activeTab === 'laws' && (
          <div className="mx-auto max-w-4xl space-y-8">
            {/* Filter tabs */}
            <Tabs value={lawFilter} onValueChange={(v) => setLawFilter(v as any)}>
              <TabsList className="mx-auto flex w-fit">
                <TabsTrigger value="all">Всички</TabsTrigger>
                <TabsTrigger value="law">Закони</TabsTrigger>
                <TabsTrigger value="standard">Стандарти</TabsTrigger>
                <TabsTrigger value="international">Международни</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Laws grid */}
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
                    <a
                      href={law.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Пълен текст на {law.source}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredLaws.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">Няма намерени документи.</p>
            )}

            {/* NRA section */}
            <div className="pt-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                НАП — Новини и календар
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {NRA_NEWS.map((item, i) => (
                  <Card key={i} className="transition-all hover:shadow-lg hover:border-primary/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Отвори в nra.bg
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
