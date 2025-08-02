
import { MainLayout } from '@/components/layout/MainLayout';
import { ConsultasClient } from './consultas-client';
import { getConsultas } from '@/lib/data';
import ErrorBoundary from '@/components/ErrorBoundary';

export default async function ConsultasPage() {
  const initialConsultas = await getConsultas();
  
  return (
    <MainLayout>
      <ErrorBoundary>
        <div className="space-y-6">
          <ConsultasClient initialConsultas={initialConsultas} />
        </div>
      </ErrorBoundary>
    </MainLayout>
  );
}
