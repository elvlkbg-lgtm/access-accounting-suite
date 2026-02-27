import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Calculator, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, hasRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getDashboardPath = () => {
    if (window.innerWidth < 768) return '/dashboard';
    if (hasRole('admin')) return '/admin';
    if (hasRole('accountant')) return '/accountant';
    return '/client';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Calculator className="h-6 w-6" />
          <span>AccountPro</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Начало
          </Link>
          <Link to="/services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Услуги и цени
          </Link>
          <Link to="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Търси счетоводител
          </Link>
          <Link to="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Блог
          </Link>
          <Link to="/calculators" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Калкулатори
          </Link>
          <Link to="/calendar" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Календар
          </Link>
          <Link to="/consultations" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Консултации
          </Link>
          {user ? (
            <>
              <Link to={getDashboardPath()} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Табло
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Изход
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Вход
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Регистрация
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card px-4 py-4 md:hidden space-y-3">
          <Link to="/" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>Начало</Link>
          <Link to="/services" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>Услуги и цени</Link>
          <Link to="/search" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>Търси счетоводител</Link>
          <Link to="/blog" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>Блог</Link>
          <Link to="/calculators" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>Калкулатори</Link>
          <Link to="/calendar" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>Календар</Link>
          <Link to="/consultations" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>Консултации</Link>
          {user ? (
            <>
              <Link to={getDashboardPath()} className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>Табло</Link>
              <Button variant="outline" size="sm" className="w-full" onClick={() => { handleSignOut(); setMobileOpen(false); }}>Изход</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Вход</Button>
              <Button size="sm" className="w-full" onClick={() => { navigate('/register'); setMobileOpen(false); }}>Регистрация</Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
