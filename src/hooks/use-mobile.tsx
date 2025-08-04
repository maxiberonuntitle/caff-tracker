'use client';

import { useEffect, useState } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

// Hook para prevenir auto-focus en móvil
export function usePreventAutoFocus() {
  const isMobile = useMobile();

  useEffect(() => {
    if (isMobile) {
      // Remover el foco de cualquier elemento activo cuando se monta el componente
      const removeFocus = () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      };

      // Ejecutar después de un pequeño delay para asegurar que el DOM esté listo
      const timeoutId = setTimeout(removeFocus, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isMobile]);

  return isMobile;
}
