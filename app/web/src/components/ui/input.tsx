import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          // Autofill styling for light and dark modes
          'autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)] dark:autofill:shadow-[inset_0_0_0px_1000px_rgb(31,41,55)]',
          'autofill:[-webkit-text-fill-color:rgb(17,24,39)] dark:autofill:[-webkit-text-fill-color:rgb(243,244,246)]',
          'autofill:caret-gray-900 dark:autofill:caret-gray-100',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };

