import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import i18n from 'i18next';
import { restaurantKeys } from '@/app/modules/restaurants/api/restaurants.api';

export interface Booking {
  id: string;
  restaurantId: string;
  dateSlot: string;
  partySize: number;
  status: string;
}

export interface CreateBookingDto {
  restaurantId: string;
  dateSlot: string;
  partySize: number;
  idempotencyKey: string;
}

export const bookingKeys = {
  all: ['bookings'] as const,
  list: () => [...bookingKeys.all, 'list'] as const,
};

export function useUserBookings() {
  return useQuery({
    queryKey: bookingKeys.list(),
    queryFn: async () => {
      const response = await api.get<Booking[]>('/bookings');
      return response.data;
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBookingDto) => {
      const response = await api.post<Booking>('/bookings', data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.list() });
      queryClient.invalidateQueries({
        queryKey: restaurantKeys.availability(variables.restaurantId, variables.dateSlot),
      });
      toast.success(i18n.t('bookings.createdSuccess'));
    },
    onError: (error: unknown) => {
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || i18n.t('bookings.createFailed'));
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<Booking>(`/bookings/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.list() });
      queryClient.invalidateQueries({ queryKey: restaurantKeys.all });
      toast.success(i18n.t('bookings.cancelledSuccess'));
    },
    onError: (error: unknown) => {
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || i18n.t('bookings.cancelFailed'));
    },
  });
}
