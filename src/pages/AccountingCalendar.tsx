import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, AlertTriangle, Clock, FileText, Search, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface TaxDeadline {
  day: number;
  month: number | 'monthly';
  title: string;
  description: string;
  category: 'ДДС' | 'Осигуровки' | 'Декларации' | 'Данъци' | 'Друго';
  specialistSearch: string; // search query to find relevant accountants
  specialistLabel: string; // label for the button
}

const DEADLINES: TaxDeadline[] = [
  // Monthly
  { day: 14, month: 'monthly', title: 'Справка-декларация по ЗДДС', description: 'Подаване на справка-декларация по ЗДДС, дневник за покупки и продажби за предходния месец', category: 'ДДС', specialistSearch: 'Пълно счетоводство', specialistLabel: 'Специалист ДДС' },
  { day: 14, month: 'monthly', title: 'VIES-декларация', description: 'Подаване на VIES-декларация от регистрирано лице за вътреобщностни доставки, доставки като посредник в тристранна операция или доставки на услуги по чл. 21, ал. 2 от ЗДДС', category: 'ДДС', specialistSearch: 'ДДС', specialistLabel: 'Специалист ДДС' },
  { day: 25, month: 'monthly', title: 'Декларация обр. 1 и обр. 6', description: 'Подаване на декларации образец 1 и образец 6 за осигурителни вноски за предходния месец', category: 'Осигуровки', specialistSearch: 'Човешки ресурси', specialistLabel: 'Специалист ТРЗ' },
  { day: 25, month: 'monthly', title: 'Плащане на осигурителни вноски', description: 'Внасяне на осигурителни вноски (ДОО, ДЗПО, ЗО) за предходния месец. Включва вноски за лицата по чл. 4, ал. 1 от КСО', category: 'Осигуровки', specialistSearch: 'Заплати', specialistLabel: 'Специалист ТРЗ' },
  { day: 25, month: 'monthly', title: 'Авансов данък по чл. 42 ЗДДФЛ', description: 'Внасяне на авансов данък върху доходите от трудови правоотношения за предходния месец', category: 'Данъци', specialistSearch: 'ЗДДФЛ', specialistLabel: 'Данъчен специалист' },
  // NRA Calendar March 2026 specific
  { day: 9, month: 3, title: 'Данък хазартни игри', description: 'Деклариране на направените залози и данъка от организатори на хазартни игри чрез цената на телефонна или друга електронна съобщителна услуга', category: 'Данъци', specialistSearch: 'Данъчно обслужване', specialistLabel: 'Данъчен специалист' },
  { day: 13, month: 3, title: 'Интрастат декларации', description: 'Подаване на Интрастат декларации за вътресъюзен внос/износ, съгласно чл. 11, ал. 1 от ЗСВТС за референтен период месец февруари', category: 'ДДС', specialistSearch: 'ДДС', specialistLabel: 'Специалист ДДС' },
  { day: 14, month: 3, title: 'Одиторски файл е-магазини', description: 'Подаване към НАП на стандартизиран одиторски файл за направените в електронния магазин поръчки през предходния месец', category: 'Друго', specialistSearch: 'Пълно счетоводство', specialistLabel: 'Счетоводител' },
  { day: 19, month: 3, title: 'Декларация образец №3', description: 'Подаване на декларация образец №3 за лицата, които са здравно осигурени за сметка на държавния бюджет', category: 'Осигуровки', specialistSearch: 'Осигуровки', specialistLabel: 'Специалист ТРЗ' },
  { day: 24, month: 3, title: 'Осигурителни вноски допълнителни доходи', description: 'Внасяне на осигурителни вноски за ДОО и ДЗПО за лицата по чл. 4, ал. 1 от КСО, върху допълнителни доходи от трудова дейност', category: 'Осигуровки', specialistSearch: 'Човешки ресурси', specialistLabel: 'Специалист ТРЗ' },
  // Annual deadlines
  { day: 28, month: 2, title: 'Годишна декларация обр. 73', description: 'Подаване на годишна данъчна декларация по чл. 73 от ЗДДФЛ — справка за изплатени доходи на физически лица', category: 'Декларации', specialistSearch: 'ЗДДФЛ', specialistLabel: 'Данъчен специалист' },
  { day: 31, month: 3, title: 'ГДД юридически лица (чл. 92 ЗКПО)', description: 'Подаване на годишна данъчна декларация по чл. 92 от ЗКПО и плащане на корпоративен данък', category: 'Данъци', specialistSearch: 'ЗКПО', specialistLabel: 'Данъчен специалист' },
  { day: 30, month: 4, title: 'ГДД физически лица (чл. 50 ЗДДФЛ)', description: 'Подаване на годишна данъчна декларация по чл. 50 от ЗДДФЛ и плащане на данък', category: 'Данъци', specialistSearch: 'ЗДДФЛ', specialistLabel: 'Данъчен специалист' },
  { day: 30, month: 4, title: 'Годишни финансови отчети', description: 'Публикуване на ГФО в Търговския регистър', category: 'Декларации', specialistSearch: 'Пълно счетоводство', specialistLabel: 'Счетоводител' },
  { day: 30, month: 6, title: 'Годишен отчет за дейността (НСИ)', description: 'Подаване на годишен отчет за дейността в НСИ', category: 'Декларации', specialistSearch: 'Пълно счетоводство', specialistLabel: 'Счетоводител' },
  { day: 30, month: 9, title: 'Авансови вноски Q3 (ЗКПО)', description: 'Внасяне на тримесечни авансови вноски по ЗКПО за Q3', category: 'Данъци', specialistSearch: 'ЗКПО', specialistLabel: 'Данъчен специалист' },
  { day: 15, month: 4, title: 'Интрастат декларация (тримесечна)', description: 'Подаване на Интрастат декларации за вътреобщностни доставки/придобивания', category: 'Друго', specialistSearch: 'ДДС', specialistLabel: 'Специалист ДДС' },
  { day: 15, month: 12, title: 'Корекция авансови вноски (ЗКПО)', description: 'Подаване на декларация за промяна на авансовите вноски по ЗКПО', category: 'Данъци', specialistSearch: 'ЗКПО', specialistLabel: 'Данъчен специалист' },
];

const MONTHS = [
  'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
  'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
];

const CATEGORY_COLORS: Record<string, string> = {
  'ДДС': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Осигуровки': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Декларации': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'Данъци': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Друго': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export default function AccountingCalendar() {
  const now = new Date();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<string>(String(now.getMonth() + 1));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const monthNum = parseInt(selectedMonth);

  const getDeadlinesForMonth = (month: number) => {
    return DEADLINES
      .filter(d => d.month === 'monthly' || d.month === month)
      .filter(d => selectedCategory === 'all' || d.category === selectedCategory)
      .sort((a, b) => a.day - b.day);
  };

  const deadlines = getDeadlinesForMonth(monthNum);

  const isUpcoming = (day: number, month: number) => {
    const currentMonth = now.getMonth() + 1;
    if (month !== currentMonth) return false;
    const diff = day - now.getDate();
    return diff >= 0 && diff <= 5;
  };

  const isPast = (day: number, month: number) => {
    const currentMonth = now.getMonth() + 1;
    if (month < currentMonth) return true;
    if (month === currentMonth && day < now.getDate()) return true;
    return false;
  };

  const handleFindSpecialist = (searchQuery: string) => {
    navigate(`/?q=${encodeURIComponent(searchQuery)}#search-results`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Данъчно-осигурителен календар</h1>
          <p className="mt-2 text-muted-foreground">Важни срокове за подаване на декларации и плащане на данъци и осигуровки</p>
          <a href="https://nra.bg/wps/portal/nra/calendar/calendar" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline">
            <ExternalLink className="h-3 w-3" /> Източник: НАП — Данъчно-осигурителен календар
          </a>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <CalendarDays className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <FileText className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички категории</SelectItem>
                {Object.keys(CATEGORY_COLORS).map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{deadlines.length} срока за {MONTHS[monthNum - 1]}</p>
          </div>

          <div className="space-y-4">
            {deadlines.map((d, i) => {
              const upcoming = isUpcoming(d.day, monthNum);
              const past = isPast(d.day, monthNum);
              return (
                <Card key={i} className={`transition-all ${upcoming ? 'border-destructive/50 shadow-md' : ''} ${past ? 'opacity-60' : ''}`}>
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className={`flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-lg ${upcoming ? 'bg-destructive text-destructive-foreground' : 'bg-muted'}`}>
                      <span className="text-lg font-bold">{d.day}</span>
                      <span className="text-[10px] uppercase">{d.month === 'monthly' ? 'мес.' : MONTHS[monthNum - 1].slice(0, 3)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{d.title}</h3>
                        {upcoming && (
                          <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                            <AlertTriangle className="h-3 w-3" /> Наближава!
                          </span>
                        )}
                        {past && (
                          <span className="text-xs text-muted-foreground">Изтекъл</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{d.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2 items-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[d.category]}`}>
                          {d.category}
                        </span>
                        {d.month === 'monthly' && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" /> Ежемесечно
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-auto text-xs h-7"
                          onClick={() => handleFindSpecialist(d.specialistSearch)}
                        >
                          <Search className="mr-1 h-3 w-3" /> {d.specialistLabel}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Legend */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" /> Категории
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CATEGORY_COLORS).map(([cat, cls]) => (
                  <span
                    key={cat}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all hover:ring-2 ring-primary/30 ${cls}`}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
