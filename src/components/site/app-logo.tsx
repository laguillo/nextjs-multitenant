import { cn } from '@/lib/utils';

interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 32, className }: AppLogoProps) {
  return (
    <div
      className={cn(
        'bg-primary text-primary-foreground flex items-center justify-center rounded-lg font-bold',
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-hidden='true'
    >
      {(process.env.NEXT_PUBLIC_APP_NAME ?? 'A')[0].toUpperCase()}
    </div>
  );
}
