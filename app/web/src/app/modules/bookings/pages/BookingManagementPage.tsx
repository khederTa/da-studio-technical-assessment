import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useUserBookings, useCancelBooking } from '../api/bookings.api';
import { useRestaurants } from '@/app/modules/restaurants/api/restaurants.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Calendar, Clock, Users, XCircle, CalendarX, Ticket } from 'lucide-react';
import { useState } from 'react';

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'default' | 'secondary'> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'destructive',
  COMPLETED: 'default',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function BookingManagementPage() {
  const { t } = useTranslation();
  const { data: bookings, isLoading: bookingsLoading } = useUserBookings();
  const { data: restaurants } = useRestaurants();
  const { mutate: cancelBooking, isPending: cancelling } = useCancelBooking();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const restaurantMap = new Map((restaurants || []).map((r) => [r.id, r.name]));

  const handleCancel = (id: string) => {
    setCancellingId(id);
    cancelBooking(id, {
      onSettled: () => setCancellingId(null),
    });
  };

  if (bookingsLoading) return <LoadingScreen />;

  const activeBookings = (bookings || []).filter((b) => b.status !== 'CANCELLED');
  const pastBookings = (bookings || []).filter((b) => b.status === 'CANCELLED');

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t('bookings.myBookings')}
        </h1>
        <p className="text-muted-foreground">{t('bookings.myBookingsDescription')}</p>
      </div>

      {(!bookings || bookings.length === 0) ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarX className="h-16 w-16 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              {t('bookings.noBookings')}
            </p>
            <Button asChild className="mt-4">
              <Link to="/restaurants">{t('restaurants.browseRestaurants')}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeBookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t('bookings.upcoming')}</h2>
              {activeBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  restaurantName={restaurantMap.get(booking.restaurantId) || t('restaurants.unknown')}
                  onCancel={handleCancel}
                  isCancelling={cancelling && cancellingId === booking.id}
                />
              ))}
            </div>
          )}

          {pastBookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground">{t('bookings.cancelled')}</h2>
              {pastBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  restaurantName={restaurantMap.get(booking.restaurantId) || t('restaurants.unknown')}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface BookingCardProps {
  booking: import('../api/bookings.api').Booking;
  restaurantName: string;
  onCancel?: (id: string) => void;
  isCancelling?: boolean;
}

function BookingCard({ booking, restaurantName, onCancel, isCancelling }: BookingCardProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card className="transition-shadow hover:shadow-md dark:border-gray-700">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{restaurantName}</p>
              <Badge variant={statusVariant[booking.status] || 'default'}>
                {booking.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(booking.dateSlot)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(booking.dateSlot)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {t('bookings.guests', { count: booking.partySize })}
              </span>
            </div>
          </div>
        </div>

        {onCancel && booking.status === 'CONFIRMED' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" className="shrink-0">
                <XCircle className="mr-1.5 h-4 w-4" />
                {t('bookings.cancel')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('bookings.confirmCancelTitle')}</DialogTitle>
                <DialogDescription>
                  {t('bookings.confirmCancelDescription', {
                    restaurant: restaurantName,
                    date: formatDate(booking.dateSlot),
                    time: formatTime(booking.dateSlot),
                  })}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('common.no')}
                </Button>
                <Button
                  variant="destructive"
                  disabled={isCancelling}
                  onClick={() => {
                    onCancel(booking.id);
                    setDialogOpen(false);
                  }}
                >
                  {isCancelling ? t('bookings.cancelling') : t('bookings.confirmCancel')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
