import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRestaurant, useAvailability } from '@/app/modules/restaurants/api/restaurants.api';
import { useCreateBooking } from '../api/bookings.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Store, Users, Calendar, Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

function generateIdempotencyKey(): string {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export default function BookingFormPage() {
  const { t } = useTranslation();
  const { id: restaurantId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant(restaurantId || '');

  const today = new Date();
  const minDate = today.toISOString().slice(0, 10);
  const defaultDate = minDate;

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [idempotencyKey] = useState(generateIdempotencyKey());
  const dateSlot = `${selectedDate}T${selectedTime}:00.000Z`;

  const { data: availability, isFetching: availabilityLoading } = useAvailability(restaurantId || '', dateSlot);

  const bookingSchema = z.object({
    partySize: z
      .number({ required_error: t('bookings.partySizeRequired') })
      .int()
      .min(1, t('bookings.partySizeMin'))
      .max(20, t('bookings.partySizeMax')),
  });

  type BookingFormData = z.infer<typeof bookingSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch, // Extract watch to track real-time inputs
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { partySize: 2 },
  });

  const watchedPartySize = watch('partySize');

  const { mutate: createBooking, isPending } = useCreateBooking();

  const onSubmit = (data: BookingFormData) => {
    if (!restaurantId) return;
    createBooking(
      {
        restaurantId,
        dateSlot,
        partySize: data.partySize,
        idempotencyKey: idempotencyKey,
      },
      {
        onSuccess: () => {
          navigate('/bookings');
        },
      },
    );
  };

  if (restaurantLoading) return <LoadingScreen />;
  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold">{t('restaurants.notFound')}</h2>
        <Button asChild className="mt-4">
          <Link to="/restaurants">{t('restaurants.backToDirectory')}</Link>
        </Button>
      </div>
    );
  }

  const isCapacityExceeded = availability 
    ? watchedPartySize > availability.availableSeats 
    : false;

  const isSubmitDisabled = 
    isPending || 
    availabilityLoading ||
    !availability || 
    !availability.hasVacancy || 
    isCapacityExceeded;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" asChild className="w-fit">
        <Link to="/restaurants" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('restaurants.backToDirectory')}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{restaurant.name}</CardTitle>
              <CardDescription>
                {restaurant.cuisine} &middot; {restaurant.city}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('bookings.makeBooking')}</CardTitle>
          <CardDescription>{t('bookings.bookingDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {t('bookings.date')}
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={minDate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {t('bookings.time')}
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partySize" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                {t('bookings.partySize')}
              </Label>
              <Input
                id="partySize"
                type="number"
                min={1}
                max={20}
                {...register('partySize', { valueAsNumber: true })}
                disabled={isPending}
              />
              {errors.partySize && (
                <p className="text-sm text-destructive">{errors.partySize.message}</p>
              )}
            </div>

            {availabilityLoading && (
              <p className="text-sm text-muted-foreground">{t('bookings.checkingAvailability')}</p>
            )}

            {availability && !availabilityLoading && (
              <div className="rounded-lg border p-4 dark:border-gray-700">
                <p className="mb-3 text-sm font-medium">{t('bookings.availabilityTitle')}</p>
                <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      availability.hasVacancy && !isCapacityExceeded
                        ? 'bg-emerald-500'
                        : 'bg-destructive'
                    }`}
                    style={{
                      width: `${Math.min(
                        (availability.currentOccupancy / availability.totalCapacity) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {availability.hasVacancy && !isCapacityExceeded ? (
                      <Badge variant="success" className="text-sm">
                        {t('bookings.seatsAvailable', { seats: availability.availableSeats })}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-sm">
                        {isCapacityExceeded ? t('bookings.insufficientSeats') || 'Insufficient Seats' : t('bookings.noSeats')}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {t('bookings.occupancy', {
                      current: availability.currentOccupancy,
                      total: availability.totalCapacity,
                    })}
                  </span>
                </div>
              </div>
            )}

            {isCapacityExceeded && !availabilityLoading && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>The selected party size exceeds the remaining available seats for this slot.</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitDisabled}
            >
              {isPending ? t('bookings.creating') : t('bookings.confirmBooking')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}