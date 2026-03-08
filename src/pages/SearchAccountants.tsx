import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Filter, Users, BookOpen, ArrowUpDown, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

type SortOption = 'name-asc' | 'name-desc' | 'rating-desc' | 'rating-asc';

interface DirectoryEntry {
  id: string;
  full_name: string;
  city: string | null;
  specialization: string[] | null;
  qualification: string | null;
  ides_number: string | null;
  source: string;
  email: string | null;
  rating?: number | null;
}

const sortEntries = (entries: DirectoryEntry[], sort: SortOption): DirectoryEntry[] => {
  return [...entries].sort((a, b) => {
    switch (sort) {
      case 'name-asc': return a.full_name.localeCompare(b.full_name, 'bg');
      case 'name-desc': return b.full_name.localeCompare(a.full_name, 'bg');
      case 'rating-desc': return (b.rating || 0) - (a.rating || 0);
      case 'rating-asc': return (a.rating || 0) - (b.rating || 0);
      default: return 0;
    }
  });
};

const SPECIALIZATIONS = ['Одит', 'Човешки ресурси', 'Данъчно обслужване', 'Пълно счетоводство', 'ДДС', 'Заплати', 'ЗДДФЛ', 'ЗКПО'];

export default function SearchAccountants() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [cityFilter, setCityFilter] = useState('all');
  const [specFilter, setSpecFilter] = useState('all');
  const [directory, setDirectory] = useState<DirectoryEntry[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [nameToAccProfileId, setNameToAccProfileId] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  useEffect(() => {
    fetchAll();
    if (user) fetchFavorites();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: dirData }, { data: accData }, { data: reviewData }] = await Promise.all([
      supabase.from('auditor_directory').select('id, full_name, city, specialization, qualification, ides_number, source, email'),
      supabase.from('accountant_profiles').select('id, display_name, user_id, rating').eq('is_approved', true),
      supabase.from('accountant_reviews').select('accountant_id, rating'),
    ]);

    // Build average rating per accountant_profile id from reviews
    const ratingMap: Record<string, number> = {};
    if (reviewData && reviewData.length > 0) {
      const sums: Record<string, { total: number; count: number }> = {};
      reviewData.forEach((r: any) => {
        if (!sums[r.accountant_id]) sums[r.accountant_id] = { total: 0, count: 0 };
        sums[r.accountant_id].total += r.rating;
        sums[r.accountant_id].count += 1;
      });
      Object.entries(sums).forEach(([id, { total, count }]) => {
        ratingMap[id] = total / count;
      });
    }

    // Map display_name -> accountant_profiles id & rating
    const mapping: Record<string, string> = {};
    const nameToRating: Record<string, number> = {};
    (accData || []).forEach((ap: any) => {
      if (ap.display_name) {
        mapping[ap.display_name] = ap.id;
        // Use review average if available, otherwise profile rating
        nameToRating[ap.display_name] = ratingMap[ap.id] ?? (ap.rating || 0);
      }
    });

    // Attach rating to directory entries
    const entries = ((dirData as any[]) || []).map((d: any) => ({
      ...d,
      rating: nameToRating[d.full_name] ?? 0,
    }));

    setDirectory(entries);
    setNameToAccProfileId(mapping);
    const uniqueCities = [...new Set(entries.map((d: any) => d.city).filter(Boolean))] as string[];
    uniqueCities.sort((a, b) => a.localeCompare(b, 'bg'));
    setCities(uniqueCities);
    setLoading(false);
  };

  const fetchFavorites = async () => {
    const { data } = await supabase.from('favorite_accountants').select('accountant_id').eq('user_id', user!.id);
    if (data) setFavoriteIds(new Set(data.map(f => f.accountant_id)));
  };

  const toggleFavorite = async (accountantId: string) => {
    if (!user) { navigate('/login'); return; }
    if (favoriteIds.has(accountantId)) {
      await supabase.from('favorite_accountants').delete().eq('user_id', user.id).eq('accountant_id', accountantId);
      setFavoriteIds(prev => { const n = new Set(prev); n.delete(accountantId); return n; });
      toast.success('Премахнат от предпочитани');
    } else {
      await supabase.from('favorite_accountants').insert({ user_id: user.id, accountant_id: accountantId });
      setFavoriteIds(prev => new Set(prev).add(accountantId));
      toast.success('Добавен в предпочитани');
    }
  };

  const filteredIdes = directory.filter((d) => {
    if (d.source !== 'ides') return false;
    const q = query.toLowerCase();
    const matchesQuery = !query || d.full_name.toLowerCase().includes(q) || d.city?.toLowerCase().includes(q) || d.qualification?.toLowerCase().includes(q) || d.specialization?.some(s => s.toLowerCase().includes(q));
    const matchesCity = cityFilter === 'all' || d.city === cityFilter;
    const matchesSpec = specFilter === 'all' || d.specialization?.includes(specFilter);
    return matchesQuery && matchesCity && matchesSpec;
  });

  const filteredPlatform = directory.filter((d) => {
    if (d.source !== 'platform') return false;
    const q = query.toLowerCase();
    const matchesQuery = !query || d.full_name.toLowerCase().includes(q) || d.city?.toLowerCase().includes(q) || d.qualification?.toLowerCase().includes(q) || d.specialization?.some(s => s.toLowerCase().includes(q));
    const matchesCity = cityFilter === 'all' || d.city === cityFilter;
    const matchesSpec = specFilter === 'all' || d.specialization?.includes(specFilter);
    return matchesQuery && matchesCity && matchesSpec;
  });

  const clearFilters = () => {
    setQuery('');
    setCityFilter('all');
    setSpecFilter('all');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-10">
        <h1 className="text-3xl font-bold">Намерете счетоводител</h1>
        <p className="mt-2 text-muted-foreground">Търсете сред регистрирани специалисти и дипломирани експерт-счетоводители от ИДЕС</p>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-end gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Търсене по име, град..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[200px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Сортиране" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Име (А-Я)</SelectItem>
              <SelectItem value="name-desc">Име (Я-А)</SelectItem>
              <SelectItem value="rating-desc">Рейтинг (най-висок)</SelectItem>
              <SelectItem value="rating-asc">Рейтинг (най-нисък)</SelectItem>
            </SelectContent>
          </Select>
          {(query || cityFilter !== 'all' || specFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>Изчисти филтрите</Button>
          )}
        </div>

        {loading ? (
          <div className="mt-10 text-center text-muted-foreground">Зареждане...</div>
        ) : (
          <Tabs defaultValue="platform" className="mt-8">
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
                  {sortEntries(filteredPlatform, sortBy).map((d) => (
                    <Card key={d.id} className="transition-all hover:shadow-lg hover:border-primary/30">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {d.full_name[0]}
                          </div>
                          <div className="min-w-0">
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
                        {d.qualification && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{d.qualification}</p>}
                        <div className="mt-4 flex gap-2">
                          <Button className="flex-1" size="sm" onClick={() => navigate(`/contact-accountant/${d.id}`)}>
                            Свържи се
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => navigate('/consultations')}>
                            Консултация
                          </Button>
                          {nameToAccProfileId[d.full_name] && (
                            <Button size="sm" variant={favoriteIds.has(nameToAccProfileId[d.full_name]) ? 'destructive' : 'outline'}
                              onClick={() => toggleFavorite(nameToAccProfileId[d.full_name])}
                              className="gap-1">
                              <Heart className={`h-4 w-4 ${favoriteIds.has(nameToAccProfileId[d.full_name]) ? 'fill-current' : ''}`} />
                              {favoriteIds.has(nameToAccProfileId[d.full_name]) ? '' : ''}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="directory" className="mt-6">
              {filteredIdes.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">Няма намерени одитори с тези критерии.</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sortEntries(filteredIdes, sortBy).map((d) => (
                    <Card key={d.id} className="transition-all hover:shadow-lg hover:border-primary/30">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {d.full_name[0]}
                          </div>
                          <div className="min-w-0">
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
                        <p className="mt-2 text-xs text-muted-foreground">{d.qualification}</p>
                        {d.ides_number && <p className="text-xs text-muted-foreground">ИДЕС №{d.ides_number}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
      <Footer />
    </div>
  );
}
