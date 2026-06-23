import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { routesConfig } from '@/app/configs/routes.config';
import { useAppSelector } from '@/app/stores/store';
import { MainLayout } from '@/app/layouts/MainLayout';
import { LoadingScreen } from '@/components/ui/loading-screen';

export function AppRoutes() {
  const user = useAppSelector((state) => state.auth.user);
  const sessionResolved = useAppSelector((state) => state.auth.sessionResolved);
  const isAuthenticated = !!user && sessionResolved;
  const userRole = user?.role;

  // Flatten all routes from modules and create lazy loaded components
  const allRoutes = routesConfig.flatMap((module) => {
    return (module.routes || []).map((route) => {
      const LazyComponent = lazy(route.component);

      return {
        path: route.path,
        requiresAuth: route.requiresAuth,
        allowedRoles: route.allowedRoles,
        element: (
          // IMPORTANT FIX: We add a key here based on the route path.
          // This forces the Suspense boundary (and the page component inside it)
          // to completely remount when the path changes, resolving the issue
          // where the view "stays in the same page" inside the layout.
          <Suspense key={route.path} fallback={<LoadingScreen />}>
            <LazyComponent />
          </Suspense>
        ),
      };
    });
  });

  return (
    <Routes>
      {allRoutes.map((route) => {
        if (route.requiresAuth && !sessionResolved) {
          return (
            <Route
              key={route.path}
              path={route.path}
              element={<LoadingScreen />}
            />
          );
        }

        if (route.requiresAuth && !isAuthenticated) {
          return (
            <Route
              key={route.path}
              path={route.path}
              element={<Navigate to="/sign-in" replace />}
            />
          );
        }
        if (
          route.requiresAuth &&
          route.allowedRoles?.length &&
          (!userRole || !route.allowedRoles.includes(userRole))
        ) {
          return (
            <Route
              key={route.path}
              path={route.path}
              element={<Navigate to="/restaurants" replace />}
            />
          );
        }

        // Determine the final element, wrapping with MainLayout for protected pages
        const element = route.requiresAuth ? (
          <MainLayout>{route.element}</MainLayout>
        ) : (
          route.element
        );

        return (
          <Route key={route.path} path={route.path} element={element} />
        );
      })}

      <Route
        path="/"
        element={
          !sessionResolved ? (
            <LoadingScreen />
          ) : isAuthenticated ? (
            <Navigate to="/restaurants" replace />
          ) : (
            <Navigate to="/sign-in" replace />
          )
        }
      />
      <Route
        path="*"
        element={
          !sessionResolved ? (
            <LoadingScreen />
          ) : isAuthenticated ? (
            <Navigate to="/restaurants" replace />
          ) : (
            <Navigate to="/sign-in" replace />
          )
        }
      />
    </Routes>
  );
}