import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/stores/store';
import { useLogout } from '@/app/modules/auth/api/auth.api';
import { Button } from '@/components/ui/button';
import { Coffee, Store, Ticket, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/restaurants', labelKey: 'nav.restaurants', icon: Store },
  { to: '/bookings', labelKey: 'nav.myBookings', icon: Ticket },
];

export function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const { mutate: logout, isPending: loggingOut } = useLogout();

  return (
    <header className="relative z-40 h-16 shrink-0 border-b border-border/70 bg-white/90 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/restaurants" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Coffee className="h-5 w-5 text-primary" />
            </div>
            <span className="hidden text-lg font-bold sm:inline">Theme Park</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to ||
                (link.to === '/restaurants' && location.pathname.startsWith('/restaurants'));
              return (
                <Button
                  key={link.to}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    'gap-1.5',
                    isActive
                      ? 'bg-primary/10 text-primary hover:bg-primary/15'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Link to={link.to}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{t(link.labelKey)}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                disabled={loggingOut}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.signOut')}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
