export interface RouteConfig {
  path: string;
  requiresAuth?: boolean;
  allowedRoles?: Array<'ADMIN' | 'CASHIER'>;
  component: () => Promise<{ default: React.ComponentType<any> }>;
}

export interface ModuleRouteConfig {
  id: string;
  routes?: RouteConfig[];
}

export const routesConfig: ModuleRouteConfig[] = [
  {
    id: 'auth',
    routes: [
      {
        path: '/sign-in',
        component: () => import('@/app/modules/auth/pages/SignInPage'),
        requiresAuth: false,
      },
      {
        path: '/sign-up',
        component: () => import('@/app/modules/auth/pages/SignUpPage'),
        requiresAuth: false,
      },
    ],
  },
  {
    id: 'restaurants',
    routes: [
      {
        path: '/restaurants',
        component: () => import('@/app/modules/restaurants/pages/RestaurantDirectoryPage'),
        requiresAuth: true,
      },
      {
        path: '/restaurants/:id/book',
        component: () => import('@/app/modules/bookings/pages/BookingFormPage'),
        requiresAuth: true,
      },
    ],
  },
  {
    id: 'bookings',
    routes: [
      {
        path: '/bookings',
        component: () => import('@/app/modules/bookings/pages/BookingManagementPage'),
        requiresAuth: true,
      },
    ],
  },
];
