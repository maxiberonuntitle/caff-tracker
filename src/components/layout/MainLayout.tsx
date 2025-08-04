
'use client';
import { useState } from 'react';
import { Navbar } from './Navbar';
import { ContentContainer } from './ContentContainer';
import { ConsultaForm } from '@/app/consultas/consulta-form';
import type { Consulta } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addConsulta } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

import { Footer } from './Footer';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar onNewConsulta={() => setIsFormOpen(true)} />
      <main className="py-8 sm:py-10 lg:py-12">
        <ContentContainer>
          {children}
        </ContentContainer>
      </main>
      <Footer />
      <ConsultaForm 
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={null}
      />
      <ScrollToTop onNewConsulta={() => setIsFormOpen(true)} />
    </div>
  );
}

