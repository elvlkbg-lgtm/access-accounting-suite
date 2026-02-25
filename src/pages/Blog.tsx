import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Calendar, Clock, ArrowRight, BookOpen, Newspaper, Lightbulb } from 'lucide-react';
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
  image?: string;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Промени в ЗДДС за 2026 г. — какво трябва да знаете',
    excerpt: 'Новите изменения в Закона за данък добавена стойност влизат в сила от 1 юли 2026 г. Ето най-важните моменти, които засягат бизнеса ви.',
    category: 'news',
    date: '2026-02-20',
    readTime: '5 мин',
  },
  {
    id: '2',
    title: '10 съвета за оптимизиране на данъците на вашата фирма',
    excerpt: 'Законни начини да намалите данъчната тежест и да увеличите печалбата си. Практични съвети от водещи счетоводители.',
    category: 'tips',
    date: '2026-02-18',
    readTime: '8 мин',
  },
  {
    id: '3',
    title: 'Как да изберете правилния счетоводител за вашия бизнес',
    excerpt: 'Пълно ръководство за избор на счетоводител — на какво да обърнете внимание, какви въпроси да зададете и какви грешки да избягвате.',
    category: 'guides',
    date: '2026-02-15',
    readTime: '10 мин',
  },
  {
    id: '4',
    title: 'Нови правила за касовите апарати от март 2026',
    excerpt: 'НАП въвежда нови изисквания за фискалните устройства. Кои търговци са засегнати и какви са сроковете за привеждане в съответствие.',
    category: 'news',
    date: '2026-02-12',
    readTime: '4 мин',
  },
  {
    id: '5',
    title: 'Осигуровки за самоосигуряващи се лица — пълен гайд',
    excerpt: 'Всичко, което трябва да знаете за осигурителните вноски — минимални и максимални прагове, срокове за плащане и чести грешки.',
    category: 'guides',
    date: '2026-02-10',
    readTime: '12 мин',
  },
  {
    id: '6',
    title: '5 грешки в счетоводството, които струват скъпо',
    excerpt: 'Често допускани счетоводни грешки, които водят до глоби от НАП. Научете как да ги избегнете.',
    category: 'tips',
    date: '2026-02-08',
    readTime: '6 мин',
  },
  {
    id: '7',
    title: 'Годишно приключване 2025 — стъпка по стъпка',
    excerpt: 'Подробно ръководство за годишното счетоводно приключване — документи, срокове, декларации и практически съвети.',
    category: 'guides',
    date: '2026-02-05',
    readTime: '15 мин',
  },
  {
    id: '8',
    title: 'Дигитализация на счетоводството — тенденции за 2026',
    excerpt: 'Как технологиите променят счетоводната професия и какви инструменти да внедрите в практиката си.',
    category: 'news',
    date: '2026-02-01',
    readTime: '7 мин',
  },
  {
    id: '9',
    title: 'Как да спестите от данъци като фрийлансър',
    excerpt: 'Специфични данъчни стратегии за свободни професии — от избор на форма на облагане до приспадане на разходи.',
    category: 'tips',
    date: '2026-01-28',
    readTime: '9 мин',
  },
];

const CATEGORY_ICONS = {
  news: Newspaper,
  tips: Lightbulb,
  guides: BookOpen,
};

const CATEGORY_LABELS: Record<string, string> = {
  news: 'Новини',
  tips: 'Съвети',
  guides: 'Ръководства',
};

export default function Blog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('all');

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
          <p className="mt-2 text-muted-foreground">Статии, новини и полезни съвети от света на счетоводството</p>
        </div>

        <div className="mx-auto mb-8 flex max-w-xl items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Търси статия..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
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
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.date).toLocaleDateString('bg-BG')}
                    </div>
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
      </main>
      <Footer />
    </div>
  );
}
