
import { MainLayout } from '@/components/layout/MainLayout';
import { getConsultas, getSNAs } from '@/lib/data';
import { InicioClient } from './dashboard-client';
import ErrorBoundary from '@/components/ErrorBoundary';

export default async function InicioPage() {
  const [initialConsultas, initialSNAs] = await Promise.all([
    getConsultas(),
    getSNAs()
  ]);
  
  return (
    <MainLayout>
      <ErrorBoundary>
        <InicioClient initialConsultas={initialConsultas} initialSNAs={initialSNAs} />
      </ErrorBoundary>
    </MainLayout>
  );
}
