
import { MainLayout } from '@/components/layout/MainLayout';
import { ConsultasClient } from './consultas-client';
import { getConsultas } from '@/lib/data';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Suspense } from 'react';

export default async function ConsultasPage() {
  const initialConsultas = await getConsultas();
  
  return (
    <MainLayout>
      <ErrorBoundary>
        <div className="space-y-8">
          <Suspense fallback={<div>Cargando consultas...</div>}>
            <ConsultasClient initialConsultas={initialConsultas} />
          </Suspense>
        </div>
      </ErrorBoundary>
    </MainLayout>
  );
}
