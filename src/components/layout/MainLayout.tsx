
'use client';
import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from './SidebarNav';
import { MobileHeader } from './MobileHeader';
import { FloatingActionButton } from './FloatingActionButton';
import { ConsultaForm } from '@/app/consultas/consulta-form';
import type { Consulta } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addConsulta } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const handleFormSubmit = async (data: Omit<Consulta, 'id'> | Consulta) => {
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    try {
        await addConsulta(data as Omit<Consulta, 'id'>);
        toast({
            title: 'Consulta creada',
            description: 'Se ha registrado una nueva consulta.',
        });
        router.refresh();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'No se pudo guardar la consulta.';
        toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
        });
    } finally {
        setIsFormOpen(false);
        setIsSubmitting(false);
    }
  };
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav onNewConsulta={() => setIsFormOpen(true)} />
      </Sidebar>
      <SidebarInset>
        <MobileHeader />
        <main className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto w-full">
            {children}
        </main>
        <FloatingActionButton onClick={() => setIsFormOpen(true)} />
        <ConsultaForm 
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          onSubmit={handleFormSubmit}
          initialData={null}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

