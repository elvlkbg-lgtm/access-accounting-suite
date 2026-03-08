import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AccountantReviews from '@/components/AccountantReviews';

export default function AccountantProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestDesc, setRequestDesc] = useState('');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchServices();
    }
  }, [id]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('accountant_profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (data) {
      // Fetch profile info separately (no FK join available)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, email')
        .eq('id', data.user_id)
        .single();
      setProfile({ ...data, profiles: profileData });
    }
    setLoading(false);
  };

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').eq('accountant_id', id!);
    setServices(data || []);
  };

  const handleRequest = async () => {
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    const { error } = await supabase.from('service_requests').insert({
      client_id: user.id,
      accountant_id: id!,
      service_id: selectedService,
      description: requestDesc,
    });
    setSubmitting(false);
    if (error) toast.error('Грешка при изпращане на заявка');
    else { toast.success('Заявката е изпратена!'); setRequestDesc(''); setSelectedService(null); }
  };

  if (loading) return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20 text-muted-foreground">Зареждане...</div></div>;
  if (!profile) return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20">Профилът не е намерен.</div></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div>
                    {profile.profiles?.avatar_url ? (
                      <img src={profile.profiles.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover border" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                        {profile.profiles?.full_name?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{profile.profiles?.full_name || 'Счетоводител'}</h1>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      {profile.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.location}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{profile.experience_years} г. опит</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{Number(profile.rating).toFixed(1)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {profile.specialization?.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
                    </div>
                  </div>
                </div>
                {profile.bio && <p className="mt-6 text-muted-foreground">{profile.bio}</p>}
              </CardContent>
            </Card>

            {services.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Ценоразпис</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {services.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{s.name}</p>
                          {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
                        </div>
                        <span className="font-semibold text-primary">{Number(s.price).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <AccountantReviews accountantId={id!} />
          </div>

          <div>
            <Card>
              <CardHeader><CardTitle>Заявете услуга</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {services.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Изберете услуга (по избор)</p>
                    <div className="space-y-2">
                      {services.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedService(selectedService === s.id ? null : s.id)}
                          className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${selectedService === s.id ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}
                        >
                          {s.name} — {Number(s.price).toFixed(2)} €
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <Textarea
                  placeholder="Опишете какво ви трябва..."
                  value={requestDesc}
                  onChange={(e) => setRequestDesc(e.target.value)}
                  rows={4}
                />
                <Button className="w-full" onClick={handleRequest} disabled={submitting || !requestDesc}>
                  {submitting ? 'Изпращане...' : 'Изпрати заявка'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
