'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, Plus, ClipboardList, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ScrollToTopProps = {
  onNewConsulta?: () => void;
  onNewSNA?: () => void;
}

export function ScrollToTop({ onNewConsulta, onNewSNA }: ScrollToTopProps) {
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
      {/* Fila superior: Menú de nueva entrada (derecha) */}
      {(onNewConsulta || onNewSNA) && (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={cn(
                  "rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110",
                  "bg-green-500 hover:bg-green-600 text-white",
                  "size-10 sm:size-12 p-0",
                  isVisible 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-10 pointer-events-none"
                )}
                aria-label="Nueva entrada"
              >
                <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onNewConsulta && (
                <DropdownMenuItem onClick={onNewConsulta} className="cursor-pointer">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Nueva Consulta
                </DropdownMenuItem>
              )}
              {onNewSNA && (
                <DropdownMenuItem onClick={onNewSNA} className="cursor-pointer">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Nuevo SNA
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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