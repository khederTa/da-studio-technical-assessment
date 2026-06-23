import { ReactNode } from 'react';
interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  return <>{children}</>;
}
