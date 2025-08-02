
'use client';
import { useState, useMemo, useCallback } from 'react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlusCircle, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Consulta } from '@/lib/types';
import { ConsultaForm, studyOptions } from './consulta-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { ConsultasGrid } from '@/components/ConsultasGrid';
import { ConsultasTable } from '@/components/ConsultasTable';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { addConsulta, deleteConsulta, updateConsulta } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';


type ConsultasClientProps = {
  initialConsultas: Consulta[];
}

export function ConsultasClient({ initialConsultas }: ConsultasClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [consultas, setConsultas] = useState<Consulta[]>(initialConsultas);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [consultaToDelete, setConsultaToDelete] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [studyFilter, setStudyFilter] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>(undefined);
  const [educatorFilter, setEducatorFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState('');

  const studies = useMemo(() => ['todos', ...studyOptions], []);

  const filteredConsultas = useMemo(() => {
    return consultas.filter(consulta => {
      const statusMatch = statusFilter === 'todos' || consulta.estado === statusFilter;
      const studyMatch = studyFilter === 'todos' || consulta.estudio === studyFilter;
      const educatorMatch = !educatorFilter || consulta.educador.toLowerCase().includes(educatorFilter.toLowerCase());
      const patientMatch = !patientFilter || consulta.nombre.toLowerCase().includes(patientFilter.toLowerCase());
      
      if (!dateFilter || !dateFilter.from) {
        return statusMatch && studyMatch && educatorMatch && patientMatch;
      }
      
      const consultaDate = new Date(consulta.fechaConsulta);
      let dateMatch = false;

      if (dateFilter.to) {
        const toDate = new Date(dateFilter.to);
        toDate.setHours(23, 59, 59, 999);
        dateMatch = consultaDate >= dateFilter.from && consultaDate <= toDate;
      } else {
        const fromDate = new Date(dateFilter.from);
        dateMatch = consultaDate.getFullYear() === fromDate.getFullYear() &&
                    consultaDate.getMonth() === fromDate.getMonth() &&
                    consultaDate.getDate() === fromDate.getDate();
      }

      return statusMatch && studyMatch && dateMatch && educatorMatch && patientMatch;
    });
  }, [consultas, statusFilter, studyFilter, dateFilter, educatorFilter, patientFilter]);

  const handleAddConsulta = () => {
    setSelectedConsulta(null);
    setIsFormOpen(true);
  };

  const handleEditConsulta = (consulta: Consulta) => {
    setSelectedConsulta(consulta);
    setIsFormOpen(true);
  };

  const handleDeleteConfirmation = (id: string) => {
    setConsultaToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDeleteConsulta = async () => {
    if (consultaToDelete) {
      setIsLoading(true);
      try {
        await deleteConsulta(consultaToDelete);
        // The revalidation is handled by the server action
        router.refresh(); 
        toast({
          title: 'Consulta eliminada',
          description: 'El registro de la consulta ha sido eliminado.',
          variant: 'default',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'No se pudo eliminar la consulta.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsAlertOpen(false);
        setConsultaToDelete(null);
        setIsLoading(false);
      }
    }
  };

  const handleFormSubmit = async (data: Omit<Consulta, 'id'> | Consulta) => {
    if (isLoading) return; // Prevent double submission
    
    setIsLoading(true);
    try {
      if ('id' in data && data.id) {
        await updateConsulta(data.id, data);
        toast({
          title: 'Consulta actualizada',
          description: 'Los datos de la consulta se han actualizado.',
        });
      } else {
        await addConsulta(data);
        toast({
          title: 'Consulta creada',
          description: 'Se ha registrado una nueva consulta.',
        });
      }
      // The revalidation is handled by the server action
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
      setSelectedConsulta(null);
      setIsLoading(false);
    }
  };
  
  const handlePrint = (sectionId: string) => {
    
    const allBodyElements = Array.from(document.body.children);
    const sectionToPrint = document.getElementById(sectionId);

    if (!sectionToPrint) return;

    allBodyElements.forEach(el => {
        if (el.tagName.toLowerCase() !== 'script') {
             (el as HTMLElement).style.display = 'none';
        }
    });
    
    document.body.appendChild(sectionToPrint);
    
    document.body.classList.add('printing', `printing-${sectionId}`);
    
    window.print();

    document.body.classList.remove('printing', `printing-${sectionId}`);
    
    allBodyElements.forEach(el => {
         if (el.tagName.toLowerCase() !== 'script') {
            (el as HTMLElement).style.display = '';
        }
    });

    window.location.reload();
  }

  const descriptionId = useMemo(() => `alert-desc-${Math.random()}`, []);


  return (
    <>
      <PageHeader
        title="Consultas medicas"
        action={
          <div className="flex justify-center gap-2">
            <Button 
              onClick={handleAddConsulta} 
              className={cn(
                "w-full md:w-auto shadow-md hover:shadow-lg transition-all transform hover:scale-105 bg-green-500/80 hover:bg-green-500/90 text-white"
                )}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
         <Card className="print-hidden">
          <CardHeader className="p-3 pt-3 md:p-4 md:pt-4">
            <CardTitle className="text-sm text-center md:text-base font-semibold">Búsqueda</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input 
                  placeholder="Buscar por nombre de paciente..."
                  value={patientFilter}
                  onChange={e => setPatientFilter(e.target.value)}
                />
                <Input
                  placeholder="Buscar por educador..."
                  value={educatorFilter}
                  onChange={e => setEducatorFilter(e.target.value)}
                />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los Estados</SelectItem>
                  <SelectItem value="Agendada">Agendada</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Completa">Completa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={studyFilter} onValueChange={setStudyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estudio" />
                </SelectTrigger>
                <SelectContent>
                  {studies.map(study => (
                    <SelectItem key={study} value={study}>{study === 'todos' ? 'Todos los Estudios' : study}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="sm:col-span-2 lg:col-span-1">
                <DateRangePicker date={dateFilter} onDateChange={setDateFilter} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div id="consultas-grid-section">
            <Card>
                <CardHeader className="p-3 pt-3 md:p-4 md:pt-4">
                    <CardTitle className="text-sm text-center md:text-base font-semibold">Resultados ({!isLoading ? filteredConsultas.length : '...'} consultas)</CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-0">
                   {isLoading ? (
                     <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
                        <div className="flex items-center justify-center h-48">
                          <LoadingSpinner size="lg" text="Cargando consultas..." />
                        </div>
                     </div>
                   ) : (
                     <ConsultasGrid
                        consultas={filteredConsultas}
                        onEdit={handleEditConsulta}
                        onDelete={handleDeleteConfirmation}
                      />
                   )}
                </CardContent>
            </Card>
            {!isLoading && filteredConsultas.length > 0 && (
              <div className="flex justify-center mt-6 print-hidden">
                <Button
                  onClick={() => handlePrint('consultas-grid-section')}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir Tarjetas
                </Button>
              </div>
            )}
        </div>

        <div id="consultas-table-section" className="mt-8">
             <Card>
                <CardContent className="p-0 sm:p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <LoadingSpinner size="lg" text="Cargando tabla..." />
                        </div>
                    ) : (
                        <ConsultasTable
                            consultas={filteredConsultas}
                            onEdit={handleEditConsulta}
                            onDelete={handleDeleteConfirmation}
                        />
                    )}
                </CardContent>
             </Card>
             {!isLoading && filteredConsultas.length > 0 && (
                <div className="flex justify-center mt-6 print-hidden">
                    <Button
                    onClick={() => handlePrint('consultas-table-section')}
                    variant="outline"
                    className="w-full sm:w-auto"
                    >
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Tabla
                    </Button>
                </div>
            )}
        </div>
      </div>


      <ConsultaForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={selectedConsulta}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen} aria-describedby={descriptionId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription id={descriptionId}>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro de la consulta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConsulta}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
