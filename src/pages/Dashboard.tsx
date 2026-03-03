import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import {
  Search, FileText, MessageCircle, ClipboardList, Upload,
  FolderOpen, User, Briefcase, ExternalLink
} from 'lucide-react';

const QUICK_ACTIONS_CLIENT = [
  { icon: Search, label: 'Търси счетоводител', path: '/', color: 'text-primary' },
  { icon: ClipboardList, label: 'Моите заявки', path: '/client?tab=requests', color: 'text-primary' },
  { icon: FolderOpen, label: 'Документи', path: '/client?tab=documents', color: 'text-primary' },
  { icon: MessageCircle, label: 'Съобщения', path: '/client?tab=messages', color: 'text-primary' },
  { icon: Search, label: 'Консултации', path: '/consultations', color: 'text-primary' },
];

const QUICK_ACTIONS_ACCOUNTANT = [
  { icon: ClipboardList, label: 'Заявки от клиенти', path: '/accountant?tab=requests', color: 'text-primary' },
  { icon: User, label: 'Моят профил', path: '/accountant?tab=profile', color: 'text-primary' },
  { icon: FolderOpen, label: 'Документи', path: '/accountant?tab=documents', color: 'text-primary' },
  { icon: MessageCircle, label: 'Съобщения', path: '/accountant?tab=messages', color: 'text-primary' },
  { icon: Briefcase, label: 'Ценоразпис', path: '/accountant?tab=services', color: 'text-primary' },
  { icon: ExternalLink, label: 'НАП / НОИ', path: '/accountant?tab=contacts', color: 'text-primary' },
];

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const isAccountant = hasRole('accountant');
  const actions = isAccountant ? QUICK_ACTIONS_ACCOUNTANT : QUICK_ACTIONS_CLIENT;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Здравейте{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            {isAccountant ? 'Управлявайте вашите клиенти и услуги' : 'Какво желаете да направите?'}
          </p>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
          {actions.map((action) => (
            <Card
              key={action.path}
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 active:scale-95"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="flex flex-col items-center justify-center gap-3 p-6">
                <action.icon className={`h-8 w-8 ${action.color}`} />
                <span className="text-sm font-medium text-center">{action.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
