import { MainLayout } from '@/components/layout/MainLayout';
import { getSNAs } from '@/lib/data';
import { SNAClient } from './sna-client';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Suspense } from 'react';

export default async function SNAPage() {
  const initialSNAs = await getSNAs();
  
  return (
    <MainLayout>
      <ErrorBoundary>
        <Suspense fallback={<div>Cargando...</div>}>
          <SNAClient initialSNAs={initialSNAs} />
        </Suspense>
      </ErrorBoundary>
    </MainLayout>
  );
} 