
import { MainLayout } from '@/components/layout/MainLayout';
import { getConsultas } from '@/lib/data';
import { InicioClient } from './dashboard-client';
import ErrorBoundary from '@/components/ErrorBoundary';

export default async function InicioPage() {
  const initialConsultas = await getConsultas();
  
  return (
    <MainLayout>
      <ErrorBoundary>
        <InicioClient initialConsultas={initialConsultas} />
      </ErrorBoundary>
    </MainLayout>
  );
}
