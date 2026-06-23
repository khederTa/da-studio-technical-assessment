import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAppDispatch } from '@/app/stores/store';
import { setSessionUser, logout, setUser } from '@/app/stores/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import i18n from 'i18next';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'CASHIER';
}

interface UserDto {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CASHIER';
  scopeUserId: string;
}

export interface LoginResponse {
  access_token: string;
  user: UserDto;
}

export interface AdminUserDto {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CASHIER';
  scopeUserId: string;
  createdAt: string;
  updatedAt: string;
}

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

export function useLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginDto) => {
      const response = await api.post<LoginResponse>('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      dispatch(setSessionUser(data.user));
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      navigate('/restaurants');
      toast.success(i18n.t('toasts.welcomeBack'));
    },
    onError: (error: unknown) => {
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || i18n.t('toasts.loginFailed'));
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterDto) => {
      const response = await api.post<AdminUserDto>('/auth/register', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      navigate('/sign-in');
      toast.success(i18n.t('toasts.accountCreated'));
    },
    onError: (error: unknown) => {
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || i18n.t('toasts.registrationFailed'));
    },
  });
}

export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // JWT is stateless — logout is client-side only
    },
    onSuccess: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      dispatch(logout());
      queryClient.clear();
      navigate('/sign-in');
      toast.success(i18n.t('toasts.loggedOut'));
    },
    onError: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      dispatch(logout());
      queryClient.clear();
      navigate('/sign-in');
    },
  });
}

export function useAdminUsers(enabled = true) {
  return useQuery({
    queryKey: [...authKeys.all, 'users'],
    queryFn: async () => {
      const response = await api.get<AdminUserDto[]>('/auth/users');
      return response.data;
    },
    enabled,
  });
}

export function useAdminCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RegisterDto & { role: 'ADMIN' | 'CASHIER' }) => {
      const response = await api.post('/auth/users', data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...authKeys.all, 'users'] }),
  });
}

export function useAdminUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      name?: string;
      email?: string;
    }) => {
      const response = await api.patch(`/auth/users/${data.id}/profile`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...authKeys.all, 'users'] }),
  });
}

export function useAdminResetUserPassword() {
  return useMutation({
    mutationFn: async (data: { id: string; newPassword: string }) => {
      const response = await api.patch(`/auth/users/${data.id}/password`, {
        newPassword: data.newPassword,
      });
      return response.data;
    },
  });
}

export function useUpdateOwnProfile() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: async (data: { name?: string; email?: string }) => {
      const response = await api.patch<AdminUserDto>('/auth/me/profile', data);
      return response.data;
    },
    onSuccess: (u) => {
      dispatch(
        setUser({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          scopeUserId: u.scopeUserId,
        }),
      );
    },
  });
}

export function useChangeOwnPassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await api.patch<{ success: boolean }>('/auth/me/password', data);
      return response.data;
    },
  });
}
