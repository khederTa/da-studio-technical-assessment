import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useRegister } from '../api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee } from 'lucide-react';

export default function SignUpPage() {
  const { t } = useTranslation();
  
  const registerSchema = z.object({
    name: z.string().min(2, t('auth.nameMinLength')),
    email: z.string().email(t('auth.invalidEmail')),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.passwordsDontMatch'),
    path: ['confirmPassword'],
  });

  type RegisterFormData = z.infer<typeof registerSchema>;
  
  const { mutate: register, isPending } = useRegister();
  const { register: registerField, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    register({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md border-gray-200 dark:border-gray-700 shadow-xl dark:shadow-2xl dark:shadow-black/20">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <Coffee className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('auth.signUpTitle')}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
              {t('auth.signUpDescription')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                {t('auth.fullName')}
              </Label>
              <Input
                id="name"
                placeholder={t('auth.namePlaceholder')}
                {...registerField('name')}
                disabled={isPending}
                className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-primary ${errors.name ? 'border-red-500 dark:border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                {t('auth.emailAddress')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                {...registerField('email')}
                disabled={isPending}
                className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-primary ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                {t('auth.password')}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...registerField('password')}
                disabled={isPending}
                className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-primary ${errors.password ? 'border-red-500 dark:border-red-500' : ''}`}
              />
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                {t('auth.confirmPassword')}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...registerField('confirmPassword')}
                disabled={isPending}
                className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-primary ${errors.confirmPassword ? 'border-red-500 dark:border-red-500' : ''}`}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isPending}>
              {isPending ? t('auth.creatingAccount') : t('auth.signUp')}
            </Button>

            <div className="text-center text-sm pt-2">
              <span className="text-gray-600 dark:text-gray-400">
                {t('auth.haveAccount')}{' '}
              </span>
              <Link to="/sign-in" className="text-primary hover:underline font-medium">
                {t('auth.alreadyHaveAccount')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

