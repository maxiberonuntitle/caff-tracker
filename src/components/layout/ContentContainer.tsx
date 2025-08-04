import { cn } from '@/lib/utils';

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentContainer({ children, className }: ContentContainerProps) {
  return (
    <div className={cn(
      "max-w-content mx-auto px-4 sm:px-6",
      className
    )}>
      {children}
    </div>
  );
} 