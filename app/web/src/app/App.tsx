import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider as ReduxProvider } from 'react-redux';
import { Toaster } from 'sonner';

import { queryClient } from '@/lib/query-client';
import { store, useAppSelector } from '@/app/stores/store';
import { AuthSessionBootstrap } from '@/app/providers/AuthSessionBootstrap';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRoutes } from '@/app/routes/AppRoutes';
import { LoadingScreen } from '@/components/ui/loading-screen';

// Dynamic Toaster that positions based on language direction
function AppToaster() {
  const language = useAppSelector((state) => state.ui.language);
  // English (LTR): bottom-left, Arabic (RTL): bottom-right
  const position = language === 'ar' ? 'bottom-left' : 'bottom-right';
  
  return <Toaster position={position} richColors />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        <AuthSessionBootstrap>
        <AppProviders>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Suspense fallback={<LoadingScreen />}>
              <AppRoutes />
            </Suspense>
          </BrowserRouter>
          <AppToaster />
        </AppProviders>
        </AuthSessionBootstrap>
      </ReduxProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;

