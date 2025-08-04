'use client';

import { LoadingSpinner } from './LoadingSpinner';

export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size={'xl' as const} text="Cargando página..." />
        <div className="text-gray-600 text-sm">
          Por favor espera mientras cargamos el contenido...
        </div>
      </div>
    </div>
  );
} 