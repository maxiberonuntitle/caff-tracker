
'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { ContentContainer } from './ContentContainer';
import { ConsultaForm } from '@/app/consultas/consulta-form';
import { SNAForm } from '@/app/sna/sna-form';
import type { Consulta, SNA } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addConsulta, addSNA } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

import { Footer } from './Footer';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const pathname = usePathname();
  const [isConsultaFormOpen, setIsConsultaFormOpen] = useState(false);
  const [isSNAFormOpen, setIsSNAFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const handleConsultaFormSubmit = async (data: Omit<Consulta, 'id'> | Consulta) => {
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
        setIsConsultaFormOpen(false);
        setIsSubmitting(false);
    }
  };

  const handleSNAFormSubmit = async (data: Omit<SNA, 'id'> | SNA) => {
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    try {
        await addSNA(data as Omit<SNA, 'id'>);
        toast({
            title: 'SNA creado',
            description: 'Se ha registrado un nuevo SNA.',
        });
        router.refresh();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'No se pudo guardar el SNA.';
        toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
        });
    } finally {
        setIsSNAFormOpen(false);
        setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`min-h-screen ${
      pathname === '/sna' 
        ? 'bg-gradient-to-br from-orange-50 via-orange-25 to-orange-100/30' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      <Navbar 
        onNewConsulta={() => setIsConsultaFormOpen(true)}
        onNewSNA={() => setIsSNAFormOpen(true)}
      />
      <main className="py-8 sm:py-10 lg:py-12">
        <ContentContainer>
          {children}
        </ContentContainer>
      </main>
      <Footer />
      <ConsultaForm 
        isOpen={isConsultaFormOpen}
        setIsOpen={setIsConsultaFormOpen}
        onSubmit={handleConsultaFormSubmit}
        initialData={null}
      />
      <SNAForm 
        isOpen={isSNAFormOpen}
        setIsOpen={setIsSNAFormOpen}
        onSubmit={handleSNAFormSubmit}
        initialData={null}
      />
      <ScrollToTop 
        onNewConsulta={() => setIsConsultaFormOpen(true)}
        onNewSNA={() => setIsSNAFormOpen(true)}
      />
    </div>
  );
}

