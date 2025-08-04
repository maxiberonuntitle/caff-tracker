'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type ScrollToTopProps = {
  onNewConsulta?: () => void;
}

export function ScrollToTop({ onNewConsulta }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Mostrar el botón cuando el usuario haya scrolleado más de 150px (más rápido)
      if (window.pageYOffset > 150) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-3">
      {/* Fila superior: Nueva consulta (derecha) */}
      {onNewConsulta && (
        <div className="flex justify-end">
          <Button
            onClick={onNewConsulta}
            className={cn(
              "rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110",
              "bg-green-500 hover:bg-green-600 text-white",
              "size-10 sm:size-12 p-0",
              isVisible 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-10 pointer-events-none"
            )}
            aria-label="Nueva consulta"
          >
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
      )}

      {/* Botón de subir arriba */}
      <Button
        onClick={scrollToTop}
        className={cn(
          "rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "size-10 sm:size-12 p-0",
          isVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-10 pointer-events-none"
        )}
        aria-label="Subir arriba"
      >
        <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
    </div>
  );
} 