import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Calculator, Menu, X } from 'lucide-react';
import { Instagram, Facebook } from 'lucide-react';
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

  const navLinks = user ? [
    { to: '/search', label: 'Търси счетоводител' },
    { to: '/services', label: 'Услуги и цени' },
    { to: '/calendar', label: 'Календар' },
    { to: '/consultations', label: 'Консултации' },
    { to: '/calculators', label: 'Калкулатори' },
    { to: '/blog', label: 'Блог' },
  ] : [
    { to: '/search', label: 'Търси счетоводител' },
    { to: '/services', label: 'Услуги и цени' },
    { to: '/calendar', label: 'Календар' },
    { to: '/consultations', label: 'Консултации' },
    { to: '/calculators', label: 'Калкулатори' },
    { to: '/blog', label: 'Блог' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Calculator className="h-6 w-6" />
          <span>AccountPro</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to={getDashboardPath()} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Табло
              </Link>
              <div className="flex items-center gap-2">
              <a href="https://www.instagram.com/accountpro.1/?hl=bg" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                  <Instagram className="h-5 w-5" style={{ color: '#E1306C' }} />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61588642016359" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                  <Facebook className="h-5 w-5" style={{ color: '#1877F2' }} />
                </a>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>Изход</Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
              <a href="https://www.instagram.com/accountpro.1/?hl=bg" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                  <Instagram className="h-5 w-5" style={{ color: '#E1306C' }} />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61588642016359" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                  <Facebook className="h-5 w-5" style={{ color: '#1877F2' }} />
                </a>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Вход</Button>
              <Button size="sm" onClick={() => navigate('/register')}>Регистрация</Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-card px-4 py-4 md:hidden space-y-3">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>{l.label}</Link>
          ))}
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
