import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Star, MapPin, Filter, Users, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface AccountantProfile {
  id: string;
  user_id: string;
  specialization: string[];
  bio: string | null;
  experience_years: number;
  location: string | null;
  rating: number;
  full_name?: string;
}

interface DirectoryEntry {
  id: string;
  full_name: string;
  city: string | null;
  specialization: string[] | null;
  qualification: string | null;
  ides_number: string | null;
}

const SPECIALIZATIONS = ['Одит', 'Човешки ресурси', 'Данъчно обслужване', 'Пълно счетоводство'];

export default function SearchAccountants() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [cityFilter, setCityFilter] = useState('all');
  const [specFilter, setSpecFilter] = useState('all');
  const [accountants, setAccountants] = useState<AccountantProfile[]>([]);
  const [directory, setDirectory] = useState<DirectoryEntry[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [accRes, dirRes] = await Promise.all([
      supabase.from('accountant_profiles').select('id, user_id, specialization, bio, experience_years, location, rating, is_approved').eq('is_approved', true),
      supabase.from('auditor_directory').select('id, full_name, city, specialization, qualification, ides_number'),
    ]);
    const accData = (accRes.data as any[]) || [];
    // Fetch profile names for accountants
    if (accData.length > 0) {
      const userIds = accData.map((a: any) => a.user_id);
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
      const nameMap = new Map((profiles || []).map((p: any) => [p.id, p.full_name]));
      accData.forEach((a: any) => { a.full_name = nameMap.get(a.user_id) || 'Счетоводител'; });
    }
    setAccountants(accData);
    const dirData = (dirRes.data as any) || [];
    setDirectory(dirData);
    // Extract unique cities
    const uniqueCities = [...new Set(dirData.map((d: any) => d.city).filter(Boolean))] as string[];
    uniqueCities.sort((a, b) => a.localeCompare(b, 'bg'));
    setCities(uniqueCities);
    setLoading(false);
  };

  const filteredAccountants = accountants.filter((a) => {
    const q = query.toLowerCase();
    const matchesQuery = !query || 
      a.specialization?.some((s) => s.toLowerCase().includes(q)) ||
      a.bio?.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q) ||
      a.full_name?.toLowerCase().includes(q);
    const matchesCity = cityFilter === 'all' || a.location?.includes(cityFilter);
    const matchesSpec = specFilter === 'all' || a.specialization?.includes(specFilter);
    return matchesQuery && matchesCity && matchesSpec;
  });

  const filteredDirectory = directory.filter((d) => {
    const q = query.toLowerCase();
    const matchesQuery = !query || d.full_name.toLowerCase().includes(q) || d.city?.toLowerCase().includes(q);
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
          {(query || cityFilter !== 'all' || specFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>Изчисти филтрите</Button>
          )}
        </div>

        {loading ? (
          <div className="mt-10 text-center text-muted-foreground">Зареждане...</div>
        ) : (
          <Tabs defaultValue="directory" className="mt-8">
            <TabsList>
              <TabsTrigger value="directory" className="gap-2">
                <BookOpen className="h-4 w-4" /> Регистър ИДЕС ({filteredDirectory.length})
              </TabsTrigger>
              <TabsTrigger value="platform" className="gap-2">
                <Users className="h-4 w-4" /> Платформа ({filteredAccountants.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="directory" className="mt-6">
              {filteredDirectory.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">Няма намерени одитори с тези критерии.</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDirectory.map((d) => (
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

            <TabsContent value="platform" className="mt-6">
              {filteredAccountants.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">Няма намерени счетоводители в платформата.</div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredAccountants.map((a) => (
                    <Card key={a.id} className="transition-all hover:shadow-lg hover:border-primary/30">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                              {a.full_name?.[0] || '?'}
                            </div>
                            <div>
                              <h3 className="font-semibold">{a.full_name || 'Счетоводител'}</h3>
                              {a.location && (
                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" /> {a.location}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {Number(a.rating).toFixed(1)}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {a.specialization?.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                        {a.bio && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{a.bio}</p>}
                        <p className="mt-2 text-xs text-muted-foreground">{a.experience_years} г. опит</p>
                        <Button className="mt-4 w-full" size="sm" onClick={() => navigate(`/accountant-profile/${a.id}`)}>
                          Преглед на профила
                        </Button>
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
