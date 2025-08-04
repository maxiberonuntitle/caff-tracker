
'use client';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { PlusCircle, Printer, ChevronLeft, ChevronRight, Grid3X3, Calendar, Table, Search, User, UserCheck, Filter, FileText, CalendarDays } from 'lucide-react';
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
import { ConsultasCalendar } from '@/components/ConsultasCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';


type ConsultasClientProps = {
  initialConsultas: Consulta[];
}

export function ConsultasClient({ initialConsultas }: ConsultasClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [consultas, setConsultas] = useState<Consulta[]>(initialConsultas);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [consultaToDelete, setConsultaToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    const statusFromUrl = searchParams.get('status');
    return statusFromUrl || 'todos';
  });
  const [studyFilter, setStudyFilter] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>(undefined);
  const [educatorFilter, setEducatorFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [activeTab, setActiveTab] = useState('grid');

  const studies = useMemo(() => ['todos', ...studyOptions], []);
  const lastFetchRef = useRef<number>(0);

  // Manejar parámetro edit de la URL
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      console.log('Edit ID from URL:', editId);
      const consultaToEdit = consultas.find(c => c.id === editId);
      console.log('Found consulta to edit:', consultaToEdit);
      if (consultaToEdit) {
        setSelectedConsulta(consultaToEdit);
        setIsFormOpen(true);
        // Limpiar el parámetro de la URL
        router.replace('/consultas', { scroll: false });
      }
    }
  }, [searchParams, consultas, router]);

  // Function to reload data from server
  const reloadData = useCallback(async (isAutoSync = false) => {
    // Evitar múltiples llamadas simultáneas
    if (isLoading || isSyncing) {
      return;
    }

    // Debounce: evitar llamadas muy frecuentes
    const now = Date.now();
    if (isAutoSync && (now - lastFetchRef.current) < 5000) {
      return; // Mínimo 5 segundos entre llamadas automáticas
    }
    lastFetchRef.current = now;

    if (isAutoSync) {
      setIsSyncing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const response = await fetch('/api/consultas', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConsultas(data);
      } else {
        console.error('Failed to fetch consultas');
      }
    } catch (error) {
      console.error('Error fetching consultas:', error);
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
      if (isSyncing) {
        setIsSyncing(false);
      }
    }
  }, [isLoading, isSyncing]);

  // Auto-refresh data every 60 seconds when page is visible
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Solo recargar si han pasado al menos 60 segundos desde la última carga
        const now = Date.now();
        const lastLoad = sessionStorage.getItem('lastDataLoad');
        if (!lastLoad || (now - parseInt(lastLoad)) > 60000) {
          reloadData(true);
          sessionStorage.setItem('lastDataLoad', now.toString());
        }
      }
    };

    // Solo establecer el intervalo si la página está visible y no hay carga en curso
    if (!document.hidden && !isLoading && !isSyncing) {
      intervalId = setInterval(() => {
        if (!document.hidden && !isLoading && !isSyncing) {
          reloadData(true); // Auto sync
          sessionStorage.setItem('lastDataLoad', Date.now().toString());
        }
      }, 120000); // 2 minutos en lugar de 1 minuto
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reloadData, isLoading, isSyncing]);

  // Aplicar filtros
  const filteredConsultas = useMemo(() => {
    return consultas.filter(consulta => {
      const matchesPatient = patientFilter === '' || 
        consulta.nombre.toLowerCase().includes(patientFilter.toLowerCase());
      const matchesEducator = educatorFilter === '' || 
        consulta.educador.toLowerCase().includes(educatorFilter.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || consulta.estado === statusFilter;
      const matchesStudy = studyFilter === 'todos' || consulta.estudio === studyFilter;
      const matchesDateRange = dateFilter === undefined || 
        (dateFilter.from && dateFilter.to && 
         new Date(consulta.fechaConsulta) >= dateFilter.from && 
         new Date(consulta.fechaConsulta) <= dateFilter.to);

      return matchesPatient && matchesEducator && matchesStatus && matchesStudy && matchesDateRange;
    });
  }, [consultas, patientFilter, educatorFilter, statusFilter, studyFilter, dateFilter]);

  // Lógica de paginación
  const totalPages = Math.ceil(filteredConsultas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedConsultas = filteredConsultas.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [patientFilter, educatorFilter, statusFilter, studyFilter, dateFilter]);

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
        // Remove from local state immediately
        setConsultas(prev => prev.filter(consulta => consulta.id !== consultaToDelete));
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

  const handleShare = (consulta: Consulta) => {
    const details = [
      `🏥 CENTRO CAFF`,
      `CONSULTA MÉDICA`,
      `Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
      ``,
      `📋 INFORMACIÓN DEL PACIENTE`,
      `👤 Nombre: ${consulta.nombre}`,
      `🆔 Cédula: ${consulta.cedula}`,
      ``,
      `🔬 DETALLES DE LA CONSULTA`,
      `📊 Estudio: ${consulta.estudio}`,
      `👨‍⚕️ Educador: ${consulta.educador}`,
      `📅 Fecha Consulta: ${format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}`,
      `⏰ Fecha Control: ${format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}`,
      `📈 Estado: ${consulta.estado}`,
      consulta.observaciones ? [
        ``,
        `📝 OBSERVACIONES`,
        `${consulta.observaciones}`
      ] : null,
      ``,
      `📱 Compartido desde Sistema CAFF`,
      `🕐 ${format(new Date(), 'dd/MM/yyyy HH:mm')}`
    ].filter(Boolean).flat().join('\n');
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(details)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSharePDF = (consulta: Consulta) => {
    // Crear el contenido HTML del PDF con el mismo formato que WhatsApp
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Consulta Médica - ${consulta.nombre}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .field { margin-bottom: 8px; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .observations { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 CENTRO CAFF</h1>
            <h2>CONSULTA MÉDICA</h2>
            <p>Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
          
          <div class="section">
            <div class="section-title">📋 INFORMACIÓN DEL PACIENTE</div>
            <div class="field">
              <span class="label">👤 Nombre:</span>
              <span class="value">${consulta.nombre}</span>
            </div>
            <div class="field">
              <span class="label">🆔 Cédula:</span>
              <span class="value">${consulta.cedula}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">🔬 DETALLES DE LA CONSULTA</div>
            <div class="field">
              <span class="label">📊 Estudio:</span>
              <span class="value">${consulta.estudio}</span>
            </div>
            <div class="field">
              <span class="label">👨‍⚕️ Educador:</span>
              <span class="value">${consulta.educador}</span>
            </div>
            <div class="field">
              <span class="label">📅 Fecha Consulta:</span>
              <span class="value">${format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}</span>
            </div>
            <div class="field">
              <span class="label">⏰ Fecha Control:</span>
              <span class="value">${format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}</span>
            </div>
            <div class="field">
              <span class="label">📈 Estado:</span>
              <span class="value">${consulta.estado}</span>
            </div>
          </div>
          
          ${consulta.observaciones ? `
          <div class="section">
            <div class="section-title">📝 OBSERVACIONES</div>
            <div class="observations">
              ${consulta.observaciones}
            </div>
          </div>
          ` : ''}
          
          <div class="footer">
            <p>📱 Compartido desde Sistema CAFF</p>
            <p>🕐 ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </body>
      </html>
    `;

    // Crear un blob con el contenido HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Abrir en nueva ventana para imprimir/descargar
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    
    // Limpiar el URL después de un tiempo
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleFormSubmit = async (data: Omit<Consulta, 'id'> | Consulta) => {
    if (isLoading) return; // Prevent double submission
    
    setIsLoading(true);
    try {
      if ('id' in data && data.id) {
        await updateConsulta(data.id, data);
        // Update local state immediately
        setConsultas(prev => prev.map(consulta => 
          consulta.id === data.id ? { 
            ...consulta, 
            ...data,
            fechaConsulta: data.fechaConsulta || consulta.fechaConsulta,
            fechaControl: data.fechaControl || consulta.fechaControl
          } : consulta
        ));
        toast({
          title: 'Consulta actualizada',
          description: 'Los datos de la consulta se han actualizado.',
        });
      } else {
        const newConsulta = await addConsulta(data);
        // Add to local state immediately with the real ID from Firebase
        setConsultas(prev => [newConsulta as Consulta, ...prev]);
        toast({
          title: 'Consulta creada',
          description: 'Se ha registrado una nueva consulta.',
        });
      }
      // Force a refresh to get the latest data from server
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
    // Crear el contenido HTML del PDF con el mismo formato que el formulario
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Consultas Médicas</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .table-container { margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f8f9fa; font-weight: bold; color: #333; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 20px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
            .stat-item { text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #333; }
            .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 CENTRO CAFF</h1>
            <h2>REPORTE DE CONSULTAS MÉDICAS</h2>
            <p>Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
          
          <div class="section">
            <div class="section-title">📊 ESTADÍSTICAS GENERALES</div>
            <div class="stats">
              <div class="stat-item">
                <div class="stat-number">${consultas.length}</div>
                <div class="stat-label">Total Consultas</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${consultas.filter(c => c.estado === 'Agendada').length}</div>
                <div class="stat-label">Agendadas</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${consultas.filter(c => c.estado === 'Pendiente').length}</div>
                <div class="stat-label">Pendientes</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${consultas.filter(c => c.estado === 'Completa').length}</div>
                <div class="stat-label">Completas</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">📋 LISTADO DE CONSULTAS</div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Cédula</th>
                    <th>Estudio</th>
                    <th>Educador</th>
                    <th>F. Consulta</th>
                    <th>F. Control</th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${consultas.map(consulta => `
                    <tr>
                      <td>${consulta.nombre}</td>
                      <td>${consulta.cedula}</td>
                      <td>${consulta.estudio}</td>
                      <td>${consulta.educador}</td>
                      <td>${format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}</td>
                      <td>${format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}</td>
                      <td>${consulta.estado}</td>
                      <td>${consulta.observaciones || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="footer">
            <p>📱 Generado desde Sistema CAFF</p>
            <p>🕐 ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </body>
      </html>
    `;

    // Crear un blob con el contenido HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Abrir en nueva ventana para imprimir/descargar
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    
    // Limpiar el URL después de un tiempo
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const descriptionId = useMemo(() => `alert-desc-${Math.random()}`, []);


  return (
    <>
      <PageHeader
        title="Gestión de Consultas"
        showBackButton={true}
        backUrl="/"
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

        

        
                 <Card className="print-hidden border-2 border-gray-100 shadow-sm">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Paciente
                </label>
                <Input 
                  placeholder="Buscar por nombre..."
                  value={patientFilter}
                  onChange={e => setPatientFilter(e.target.value)}
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Educador
                </label>
                <Input
                  placeholder="Buscar por educador..."
                  value={educatorFilter}
                  onChange={e => setEducatorFilter(e.target.value)}
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Estado
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los Estados</SelectItem>
                    <SelectItem value="Agendada">🟦 Agendada</SelectItem>
                    <SelectItem value="Pendiente">🟨 Pendiente</SelectItem>
                    <SelectItem value="Completa">🟩 Completa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Estudio
                </label>
                <Select value={studyFilter} onValueChange={setStudyFilter}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Seleccionar estudio" />
                  </SelectTrigger>
                  <SelectContent>
                    {studies.map(study => (
                      <SelectItem key={study} value={study}>
                        {study === 'todos' ? 'Todos los Estudios' : study}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Rango de Fechas
                </label>
                <DateRangePicker date={dateFilter} onDateChange={setDateFilter} />
              </div>
            </div>
          </CardContent>
        </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Tarjetas
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Tabla
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-4">
            <div id="consultas-grid-section">
              <Card>
                <CardHeader className="p-3 pt-3 md:p-4 md:pt-4">
                  <CardTitle className="text-sm text-center md:text-base font-semibold">
                    Resultados ({!isLoading ? filteredConsultas.length : '...'} consultas)
                  </CardTitle>
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
                      consultas={paginatedConsultas}
                      onEdit={handleEditConsulta}
                      onDelete={handleDeleteConfirmation}
                    />
                  )}
                </CardContent>
              </Card>
              
              {/* Controles de Paginación para Grid */}
              {!isLoading && filteredConsultas.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-6 print-hidden">
                  <div className="text-sm text-gray-600">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, filteredConsultas.length)} de {filteredConsultas.length} consultas
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="lg" text="Cargando calendario..." />
              </div>
            ) : (
              <ConsultasCalendar
                consultas={filteredConsultas}
                onAddConsulta={handleAddConsulta}
                onEditConsulta={handleEditConsulta}
              />
            )}
          </TabsContent>

          <TabsContent value="table" className="space-y-4">
            <div id="consultas-table-section">
              <Card>
                <CardContent className="p-0 sm:p-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                      <LoadingSpinner size="lg" text="Cargando tabla..." />
                    </div>
                  ) : (
                    <ConsultasTable
                      consultas={paginatedConsultas}
                      onEdit={handleEditConsulta}
                      onDelete={handleDeleteConfirmation}
                    />
                  )}
                </CardContent>
              </Card>
              
              {/* Controles de Paginación */}
              {!isLoading && filteredConsultas.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-6 print-hidden">
                  <div className="text-sm text-gray-600">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, filteredConsultas.length)} de {filteredConsultas.length} consultas
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {!isLoading && filteredConsultas.length > 0 && (
                <div className="flex justify-center mt-6 print-hidden">
                  <Button
                    onClick={() => handlePrint('consultas-table-section')}
                    variant="outline"
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 border-gray-300"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Tabla Completa
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>


              <ConsultaForm
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          onSubmit={handleFormSubmit}
          onDelete={handleDeleteConfirmation}
          onShare={handleShare}
          onSharePDF={handleSharePDF}
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
