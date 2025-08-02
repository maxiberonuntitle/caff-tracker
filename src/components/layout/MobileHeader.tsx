
'use client';

import { HeartPulse } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScroll } from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';

export function MobileHeader() {
  const isMobile = useIsMobile();
  const isScrolled = useScroll(10);

  // Don't render anything until we know if we're on mobile
  if (!isMobile) {
    return null;
  }

  return (
    <header className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm md:hidden transition-all duration-300",
        isScrolled ? "h-12" : "h-14"
        )}>
      <div className="container flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className={cn(
              "flex items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all duration-300",
              isScrolled ? "size-6" : "size-7"
            )}>
            <HeartPulse className={cn("transition-all duration-300", isScrolled ? "size-3" : "size-4")} />
          </div>
          <span className={cn(
              "font-normal font-headline text-primary transition-all duration-300",
               isScrolled ? "text-sm opacity-0 w-0" : "text-base opacity-100 w-auto"
            )}>
                CAFF Consultas
            </span>
        </div>
        <SidebarTrigger />
      </div>
    </header>
  );
}
