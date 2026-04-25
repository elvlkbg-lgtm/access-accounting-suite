import { Calculator, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
              <Calculator className="h-5 w-5" />
              AccountPro
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Свързваме клиенти с професионални счетоводители за всякакви финансови нужди.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Платформа</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/search" className="hover:text-foreground transition-colors">Търси счетоводител</Link></li>
              <li><Link to="/services" className="hover:text-foreground transition-colors">Услуги и цени</Link></li>
              <li><Link to="/calendar" className="hover:text-foreground transition-colors">Календар</Link></li>
              <li><Link to="/consultations" className="hover:text-foreground transition-colors">Консултации</Link></li>
              <li><Link to="/calculators" className="hover:text-foreground transition-colors">Калкулатори</Link></li>
              <li><Link to="/blog" className="hover:text-foreground transition-colors">Блог</Link></li>
              <li><Link to="/register" className="hover:text-foreground transition-colors">Регистрация</Link></li>
              <li><Link to="/login" className="hover:text-foreground transition-colors">Вход</Link></li>
              <li><Link to="/klienti" className="hover:text-foreground transition-colors">За клиенти</Link></li>
              <li><Link to="/za-schetovoditeli" className="hover:text-foreground transition-colors">За счетоводители</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Услуги</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/services?category=Пълно счетоводство" className="hover:text-foreground transition-colors">Пълно счетоводство</Link></li>
              <li><Link to="/services?category=Данъци" className="hover:text-foreground transition-colors">Данъци</Link></li>
              <li><Link to="/services?category=ТРЗ и Човешки ресурси" className="hover:text-foreground transition-colors">ТРЗ и Човешки ресурси</Link></li>
              <li><Link to="/services?category=Одит" className="hover:text-foreground transition-colors">Одит</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Контакти</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="mailto:info@accountpro.bg" className="hover:text-foreground transition-colors">info@accountpro.bg</a></li>
              <li><a href="tel:+35921234567" className="hover:text-foreground transition-colors">+359 2 123 4567</a></li>
              <li>ул. „Цар Освободител" 15, София</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a
                href="https://www.instagram.com/accountpro.1/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center justify-center p-2 rounded-md transition-transform hover:scale-110 cursor-pointer"
              >
                <Instagram className="h-5 w-5 pointer-events-none" style={{ color: '#E1306C' }} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61588642016359"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex items-center justify-center p-2 rounded-md transition-transform hover:scale-110 cursor-pointer"
              >
                <Facebook className="h-5 w-5 pointer-events-none" style={{ color: '#1877F2' }} />
              </a>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border">
              <iframe
                title="Карта на офиса"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2932.654!2d23.3285!3d42.6934!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40aa856e4a4e8c27%3A0x4a75b43d3e8e3b0!2sSofia%20University%20%22St.%20Kliment%20Ohridski%22!5e0!3m2!1sen!2sbg!4v1700000000000"
                width="100%"
                height="180"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AccountPro. Всички права запазени.
        </div>
      </div>
    </footer>
  );
}
