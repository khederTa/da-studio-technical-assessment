import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useRestaurants } from '../api/restaurants.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Store, MapPin, Users, Search, UtensilsCrossed } from 'lucide-react';

export default function RestaurantDirectoryPage() {
  const { t } = useTranslation();
  const { data: restaurants, isLoading } = useRestaurants();
  const [search, setSearch] = useState('');

  const filtered = (restaurants || []).filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t('restaurants.title')}
          </h1>
          <p className="mt-1 text-muted-foreground">{t('restaurants.subtitle')}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('restaurants.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UtensilsCrossed className="h-16 w-16 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">{t('restaurants.noResults')}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}

function RestaurantCard({ restaurant }: { restaurant: import('../api/restaurants.api').Restaurant }) {
  const { t } = useTranslation();

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg dark:border-gray-700">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{restaurant.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                {restaurant.cuisine}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{restaurant.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {restaurant.amenities.slice(0, 4).map((amenity) => (
            <Badge key={amenity} variant="secondary" className="text-xs">
              {amenity}
            </Badge>
          ))}
          {restaurant.amenities.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{restaurant.amenities.length - 4}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {restaurant.city}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {t('restaurants.capacity', { count: restaurant.maxCapacity })}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/restaurants/${restaurant.id}/book`}>
            {t('restaurants.bookNow')}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
