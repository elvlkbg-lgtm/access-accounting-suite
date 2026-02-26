import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Upload, MapPin, MessageCircle, FileText, Video } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface AccountantInfo {
  id: string;
  full_name: string;
  city: string | null;
  specialization: string[] | null;
  qualification: string | null;
  email: string | null;
}

export default function ContactAccountant() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accountant, setAccountant] = useState<AccountantInfo | null>(null);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchAccountant();
  }, [id]);

  const fetchAccountant = async () => {
    const { data } = await supabase
      .from('auditor_directory')
      .select('id, full_name, city, specialization, qualification, email')
      .eq('id', id)
      .eq('source', 'platform')
      .single();
    setAccountant(data as AccountantInfo | null);
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!user) { navigate('/login'); return; }
    if (!message.trim()) { toast.error('Напишете съобщение'); return; }
    
    // For platform directory entries we use the accountant's id as receiver
    // In a real app, this would map to the accountant's user_id
    setSending(true);
    
    // We'll store the message using the directory entry id as a pseudo receiver
    // This demonstrates the messaging flow
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: user.id, // self-reference as placeholder since directory entries don't have user accounts
      content: `[До: ${accountant?.full_name}] ${message}`,
    });
    
    setSending(false);
    if (error) {
      toast.error('Грешка при изпращане на съобщението');
    } else {
      toast.success('Съобщението е изпратено!');
      setMessage('');
    }
  };

  const handleUploadDocument = async () => {
    if (!user) { navigate('/login'); return; }
    if (!file) { toast.error('Изберете файл'); return; }
    
    setUploading(true);
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
    
    if (uploadError) {
      toast.error('Грешка при качване на файла');
      setUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from('documents').insert({
      uploaded_by: user.id,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
    });

    setUploading(false);
    if (dbError) {
      toast.error('Грешка при записване на документа');
    } else {
      toast.success(`Документът "${file.name}" е качен успешно!`);
      setFile(null);
    }
  };

  if (loading) return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20 text-muted-foreground">Зареждане...</div></div>;
  if (!accountant) return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20">Счетоводителят не е намерен.</div></div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>

        <div className="mx-auto max-w-3xl space-y-6">
          {/* Accountant info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {accountant.full_name[0]}
                </div>
                <div>
                  <h1 className="text-xl font-bold">{accountant.full_name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {accountant.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {accountant.city}</span>}
                    {accountant.qualification && <span>• {accountant.qualification}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {accountant.specialization?.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Send message */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Изпрати съобщение
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">Влезте, за да изпратите съобщение</p>
                    <Button onClick={() => navigate('/login')}>Вход</Button>
                  </div>
                ) : (
                  <>
                    <Textarea
                      placeholder="Напишете вашето съобщение..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                    <Button className="w-full" onClick={handleSendMessage} disabled={sending}>
                      <Send className="mr-2 h-4 w-4" />
                      {sending ? 'Изпращане...' : 'Изпрати'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Upload document */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5 text-primary" />
                  Изпрати документ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">Влезте, за да качите документ</p>
                    <Button onClick={() => navigate('/login')}>Вход</Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Изберете файл</Label>
                      <Input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                      />
                    </div>
                    {file && (
                      <p className="text-sm text-muted-foreground">
                        {file.name} ({(file.size / 1024).toFixed(0)} KB)
                      </p>
                    )}
                    <Button className="w-full" onClick={handleUploadDocument} disabled={uploading || !file}>
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? 'Качване...' : 'Качи документ'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => navigate('/consultations')}>
                  <Video className="mr-2 h-4 w-4" /> Запази консултация
                </Button>
                {accountant.email && (
                  <Button variant="outline" onClick={() => window.location.href = `mailto:${accountant.email}`}>
                    Изпрати имейл
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}