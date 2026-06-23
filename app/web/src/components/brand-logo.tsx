import { cn } from '@/lib/utils';

const sizeHeights = {
  sm: 'h-8 max-h-8',
  md: 'h-10 max-h-10',
  lg: 'h-14 max-h-14',
  xl: 'h-[16rem] max-h-[16rem]',
  /** Sidebar / nav rail — larger mark, still fits compact header */
  sidebar: 'h-12 max-h-12 sm:h-[3.25rem] sm:max-h-[3.25rem]',
} as const;

export type BrandLogoProps = {
  className?: string;
  /** Accessible label; use empty string when decorative next to visible brand text */
  alt?: string;
  size?: keyof typeof sizeHeights;
};

export function BrandLogo({ className, alt = '', size = 'md' }: BrandLogoProps) {
  return (
    <img
      src="/logo.svg"
      alt={alt}
      width={160}
      height={48}
      decoding="async"
      className={cn(
        'w-auto max-w-[min(100%,10rem)] shrink-0 object-contain object-left',
        sizeHeights[size],
        className,
      )}
    />
  );
}
