import { ReactNode, useEffect } from 'react';
import { useAppDispatch } from '@/app/stores/store';
import { setSessionUser, setSessionResolved } from '@/app/stores/slices/authSlice';

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CASHIER';
  scopeUserId: string;
}

export function AuthSessionBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const raw = localStorage.getItem('auth_user');

    if (token && raw) {
      try {
        const user: AuthSessionUser = JSON.parse(raw);
        dispatch(setSessionUser(user));
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        dispatch(setSessionResolved(true));
      }
    } else {
      dispatch(setSessionResolved(true));
    }
  }, [dispatch]);

  return <>{children}</>;
}
