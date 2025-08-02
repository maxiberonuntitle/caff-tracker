
import { MainLayout } from '@/components/layout/MainLayout';
import { getConsultas } from '@/lib/data';
import { DashboardClient } from './dashboard-client';
import ErrorBoundary from '@/components/ErrorBoundary';

export default async function DashboardPage() {
  const initialConsultas = await getConsultas();
  
  return (
    <MainLayout>
      <ErrorBoundary>
        <DashboardClient initialConsultas={initialConsultas} />
      </ErrorBoundary>
    </MainLayout>
  );
}
