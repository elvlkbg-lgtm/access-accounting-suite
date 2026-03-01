import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Calendar, Clock, ArrowRight, BookOpen, Newspaper, Lightbulb, Scale, ChevronDown, ChevronUp } from 'lucide-react';
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

/* ── Laws section ── */
const LAWS = [
  {
    id: 'zs',
    title: 'Закон за счетоводството',
    source: 'accreg.org',
    sourceUrl: 'https://www.accreg.org/bg/pages/view/6/zakon-za-schetovodstvoto.html',
    summary: 'Обн. ДВ. бр. 95 от 8.12.2015 г., последно изм. и доп. ДВ. бр. 26 от 22.03.2020 г.',
    chapters: [
      { title: 'Глава 1 — Общи положения', content: 'Чл. 1. Този закон урежда: 1. изискванията към текущото счетоводно отчитане и счетоводните системи в предприятията; 2. приложимите счетоводни стандарти; 3. съдържанието и съставянето на финансовите отчети; 4. изискванията към лицата, които съставят финансовите отчети; 5. публичността на финансовите отчети; 6. годишните доклади.\n\nЧл. 2. (1) Предприятия по смисъла на този закон са: търговци по смисъла на Търговския закон; юридически лица, които не са търговци; бюджетни предприятия; неперсонифицирани дружества; търговски представителства; чуждестранни лица, осъществяващи стопанска дейност в страната.\n\n(2) За предприятия се смятат и осигурителни каси по КСО, както и търговски представителства.' },
      { title: 'Глава 2 — Счетоводни системи', content: 'Чл. 11. (1) Предприятията осъществяват счетоводството на основата на документалната обоснованост на стопанските операции и факти.\n\nЧл. 12. Счетоводните документи са: първични, вторични и регистри.\n\nЧл. 13. Първичният счетоводен документ съдържа: наименование и номер; дата; наименования на участниците; предмет, натурално и стойностно изражение; име и подпис на съставителя.' },
      { title: 'Глава 3 — Категории предприятия и групи', content: 'Чл. 19. Микропредприятия — предприятия, които към 31 декември на текущия отчетен период не надвишават най-малко два от: балансова стойност на активите — 700 000 лв.; нетни приходи от продажби — 1 400 000 лв.; средна численост на персонала — 10 души.\n\nЧл. 20. Малки предприятия — не надвишават два от: активи 8 000 000 лв.; приходи 16 000 000 лв.; персонал 50 души.\n\nЧл. 21. Средни предприятия — не надвишават два от: активи 38 000 000 лв.; приходи 76 000 000 лв.; персонал 250 души.' },
      { title: 'Глава 4 — Финансови отчети', content: 'Чл. 24. Финансовите отчети на предприятията дават вярна и честна представа за имущественото и финансовото състояние, отчетения финансов резултат, промените в паричните потоци и в собствения капитал.\n\nЧл. 25. Годишният финансов отчет включва: счетоводен баланс, отчет за приходите и разходите, отчет за паричните потоци, отчет за собствения капитал и приложение.' },
      { title: 'Глава 5 — Публичност на отчетите', content: 'Чл. 38. (1) Предприятията публикуват годишния финансов отчет и консолидирания финансов отчет, годишния доклад за дейността и годишния консолидиран доклад за дейността.\n\n(2) Търговците публикуват в Търговския регистър.\n\n(9) Годишните финансови отчети се публикуват до 30 юни на следващата година.' },
    ],
  },
];

export default function Blog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [activeTab, setActiveTab] = useState<'articles' | 'laws'>('articles');
  const [expandedLaw, setExpandedLaw] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const filtered = ARTICLES.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || a.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Блог</h1>
          <p className="mt-2 text-muted-foreground">Статии, новини, съвети и нормативни документи</p>
        </div>

        {/* Main tabs: Articles / Laws */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-8">
          <TabsList className="mx-auto flex w-fit">
            <TabsTrigger value="articles" className="gap-1"><Newspaper className="h-4 w-4" /> Статии</TabsTrigger>
            <TabsTrigger value="laws" className="gap-1"><Scale className="h-4 w-4" /> Закони</TabsTrigger>
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
          <div className="mx-auto max-w-3xl space-y-6">
            {LAWS.map((law) => (
              <Card key={law.id}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedLaw(expandedLaw === law.id ? null : law.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Scale className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{law.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{law.summary}</p>
                      </div>
                    </div>
                    {expandedLaw === law.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>
                {expandedLaw === law.id && (
                  <CardContent className="space-y-3">
                    <a href={law.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      Пълен текст на {law.source} →
                    </a>
                    {law.chapters.map((ch, i) => (
                      <div key={i} className="rounded-lg border">
                        <button
                          className="w-full flex items-center justify-between p-3 text-sm font-medium text-left hover:bg-muted/50 transition-colors"
                          onClick={() => setExpandedChapter(expandedChapter === `${law.id}-${i}` ? null : `${law.id}-${i}`)}
                        >
                          {ch.title}
                          {expandedChapter === `${law.id}-${i}` ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {expandedChapter === `${law.id}-${i}` && (
                          <div className="px-3 pb-3">
                            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{ch.content}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
