import { ReactNode } from 'react';
import { Header } from './components/Header';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <div className="flex min-h-0 flex-1 flex-col">
        <Header />
        <main className="relative z-0 min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100/70 p-4 transition-all duration-300 sm:p-6 dark:from-slate-900 dark:to-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}

