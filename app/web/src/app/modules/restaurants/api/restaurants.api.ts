import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  location: string;
  city: string;
  maxCapacity: number;
  amenities: string[];
}

export interface CapacityResponse {
  restaurantId: string;
  requestedAt: string;
  totalCapacity: number;
  currentOccupancy: number;
  availableSeats: number;
  hasVacancy: boolean;
}

export const restaurantKeys = {
  all: ['restaurants'] as const,
  list: () => [...restaurantKeys.all, 'list'] as const,
  detail: (id: string) => [...restaurantKeys.all, 'detail', id] as const,
  availability: (id: string, requestedAt: string) =>
    [...restaurantKeys.all, 'availability', id, requestedAt] as const,
};

export function useRestaurants() {
  return useQuery({
    queryKey: restaurantKeys.list(),
    queryFn: async () => {
      const response = await api.get<Restaurant[]>('/restaurants');
      return response.data;
    },
  });
}

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: restaurantKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<Restaurant>(`/restaurants/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useAvailability(id: string, requestedAt: string) {
  return useQuery({
    queryKey: restaurantKeys.availability(id, requestedAt),
    queryFn: async () => {
      const response = await api.get<CapacityResponse>(
        `/restaurants/${id}/availability`,
        { params: { requestedAt } },
      );
      return response.data;
    },
    enabled: !!id && !!requestedAt,
  });
}
