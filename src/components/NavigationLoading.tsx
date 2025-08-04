'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LoadingSpinner } from './LoadingSpinner';

export function NavigationLoading() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Simular loading en cambio de rutas
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" />
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner size="sm" text="Cargando..." />
        </div>
      </div>
    </div>
  );
} 