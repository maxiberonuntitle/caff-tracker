
'use client';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useMobile } from '@/hooks/use-mobile';
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
import { PlusCircle, Printer, ChevronLeft, ChevronRight, Grid3X3, Calendar, Table, Search, User, UserCheck, Filter, FileText, CalendarDays, ChevronDown, Download, Stethoscope } from 'lucide-react';
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
  const isMobile = useMobile();
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
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const studies = useMemo(() => ['todos', ...studyOptions], []);
  const lastFetchRef = useRef<number>(0);

  // Texto de búsqueda global para móvil
  const globalSearchText = useMemo(() => {
    const parts = [];
    if (patientFilter) parts.push(`Adolescente: ${patientFilter}`);
    if (educatorFilter) parts.push(`Educador/a: ${educatorFilter}`);
    if (statusFilter !== 'todos') parts.push(`Estado: ${statusFilter}`);
    if (studyFilter !== 'todos') parts.push(`Estudio: ${studyFilter}`);
    if (dateFilter?.from) {
      const fromDate = format(dateFilter.from, 'dd/MM/yyyy');
      const toDate = dateFilter.to ? format(dateFilter.to, 'dd/MM/yyyy') : '';
      parts.push(`Fechas: ${fromDate}${toDate ? ` - ${toDate}` : ''}`);
    }
    return parts.length > 0 ? parts.join(', ') : 'Búsqueda rápida por adolescente';
  }, [patientFilter, educatorFilter, statusFilter, studyFilter, dateFilter]);

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
    console.log('Editando consulta desde calendario:', consulta);
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
    // Generar PDF y dar opciones de compartir
    handleSharePDF(consulta);
  };

  const handleSharePDF = async (consulta: Consulta) => {
    // Importar html2pdf dinámicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Crear el contenido HTML del PDF con diseño optimizado para impresión
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Consulta Médica - ${consulta.nombre}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              margin: 0; 
              line-height: 1.6; 
              color: #1f2937;
              background: white;
              min-height: 100vh;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            
            .header { 
              background: #f8fafc;
              color: #1f2937;
              padding: 20px 30px;
              text-align: center;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .header h1 { 
              font-size: 20px; 
              font-weight: 700; 
              margin-bottom: 4px;
              letter-spacing: -0.025em;
            }
            
            .header h2 { 
              font-size: 14px; 
              font-weight: 500; 
              color: #6b7280;
              margin-bottom: 8px;
            }
            
            .header p { 
              font-size: 12px; 
              color: #6b7280;
            }
            
            .content {
              padding: 30px;
            }
            
            .section { 
              margin-bottom: 24px; 
            }
            
            .section-title { 
              font-size: 14px; 
              font-weight: 600; 
              color: #374151;
              margin-bottom: 12px;
              padding-bottom: 6px;
              border-bottom: 1px solid #e5e7eb;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            
            .field { 
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid #f3f4f6;
            }
            
            .field:last-child {
              border-bottom: none;
            }
            
            .label { 
              font-weight: 500; 
              color: #6b7280;
              font-size: 13px;
            }
            
            .value { 
              color: #1f2937;
              font-weight: 500;
              font-size: 13px;
              text-align: right;
            }
            
            .observations { 
              background: #f8fafc;
              padding: 16px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              font-size: 13px;
              line-height: 1.6;
              min-height: 80px;
            }
            
            .observations.empty {
              color: #9ca3af;
              font-style: italic;
            }
            
            .status-badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            .status-agendada { background: #dbeafe; color: #1e40af; }
            .status-pendiente { background: #fef3c7; color: #d97706; }
            .status-completa { background: #d1fae5; color: #047857; }
            
            .footer { 
              background: #f9fafb;
              padding: 16px 30px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
              margin-bottom: 2px;
            }
            
            .footer p:last-child {
              margin-bottom: 0;
            }
            
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Centro CAFF Gestión Integral</h1>
              <h2>CONSULTA MÉDICA</h2>
              <p>Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            </div>
            
            <div class="content">
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  INFORMACIÓN DEL ADOLESCENTE
                </div>
                <div class="field">
                  <span class="label">Nombre</span>
                  <span class="value">${consulta.nombre}</span>
                </div>
                <div class="field">
                  <span class="label">Cédula</span>
                  <span class="value">${consulta.cedula}</span>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
                    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
                    <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"></path>
                    <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"></path>
                  </svg>
                  DETALLES DE LA CONSULTA
                </div>
                <div class="field">
                  <span class="label">Estudio</span>
                  <span class="value">${consulta.estudio}</span>
                </div>
                <div class="field">
                  <span class="label">Educador/a</span>
                  <span class="value">${consulta.educador}</span>
                </div>
                <div class="field">
                  <span class="label">Fecha Consulta</span>
                  <span class="value">${format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}</span>
                </div>
                <div class="field">
                  <span class="label">Fecha Control</span>
                  <span class="value">${format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}</span>
                </div>
                <div class="field">
                  <span class="label">Estado</span>
                  <span class="value">
                    <span class="status-badge status-${consulta.estado.toLowerCase()}">${consulta.estado}</span>
                  </span>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                  OBSERVACIONES
                </div>
                <div class="observations ${!consulta.observaciones ? 'empty' : ''}">${consulta.observaciones || '_________________________________________________________________\n_________________________________________________________________\n_________________________________________________________________'}</div>
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-left">
                <p>Centro CAFF Gestión Integral - Gestión de consultas</p>
              </div>
              <div class="footer-center">
                <p>Sistema de Gestión de Consultas Médicas</p>
              </div>
              <div class="footer-right">
                <p>${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Crear un elemento temporal para el contenido HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);
    
    // Configuración para el PDF
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `consulta_${consulta.nombre.replace(/\s+/g, '_')}_${format(new Date(consulta.fechaConsulta), 'dd-MM-yyyy')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };
    
    // Generar y compartir el PDF
    try {
      // Generar el PDF como blob
      const pdfBlob = await html2pdf().set(opt).from(tempDiv).outputPdf('blob');
      
      // Crear archivo PDF
      const pdfFile = new File([pdfBlob], `consulta_${consulta.nombre.replace(/\s+/g, '_')}_${format(new Date(consulta.fechaConsulta), 'dd-MM-yyyy')}.pdf`, {
        type: 'application/pdf'
      });
      
      // Verificar si el navegador soporta Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        // Usar Web Share API para compartir el PDF
        await navigator.share({
          title: `Consulta Médica - ${consulta.nombre}`,
          text: `🏥 Centro CAFF Gestión Integral\n\nConsulta médica de ${consulta.nombre}\n\n📋 Información:\n• Adolescente: ${consulta.nombre}\n• Cédula: ${consulta.cedula}\n• Estudio: ${consulta.estudio}\n• Educador/a: ${consulta.educador}\n• Estado: ${consulta.estado}\n\n📅 Fecha Consulta: ${format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}\n⏰ Fecha Control: ${format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}\n\n📱 Compartido desde Centro CAFF Gestión Integral`,
          files: [pdfFile]
        });
        
        toast({
          title: 'PDF compartido',
          description: 'El PDF se ha compartido correctamente.',
        });
      } else {
        // Fallback: descargar el PDF
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = pdfFile.name;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'PDF descargado',
          description: 'El PDF se ha descargado correctamente.',
        });
        
        // Limpiar el URL
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el PDF. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      // Limpiar el elemento temporal
      document.body.removeChild(tempDiv);
    }
  };

  const handleDownloadPDF = async (consulta: Consulta) => {
    // Importar html2pdf dinámicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Crear el contenido HTML del PDF con diseño profesional mejorado
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Consulta Médica - ${consulta.nombre}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              margin: 0; 
              line-height: 1.6; 
              color: #1f2937;
              background: white;
              min-height: 100vh;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            
            .header { 
              background: #eff6ff;
              color: #1f2937;
              padding: 20px 30px;
              text-align: center;
              border-bottom: 2px solid #bfdbfe;
            }
            
            .header h1 { 
              font-size: 20px; 
              font-weight: 700; 
              margin-bottom: 4px;
              letter-spacing: -0.025em;
            }
            
            .header h2 { 
              font-size: 14px; 
              font-weight: 500; 
              color: #6b7280;
              margin-bottom: 8px;
            }
            
            .header p { 
              font-size: 12px; 
              color: #6b7280;
            }
            
            .content {
              padding: 30px;
            }
            
            .section { 
              margin-bottom: 24px; 
            }
            
            .section-title { 
              font-size: 14px; 
              font-weight: 600; 
              color: #374151;
              margin-bottom: 12px;
              padding-bottom: 6px;
              border-bottom: 1px solid #e5e7eb;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            
            .field { 
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid #f3f4f6;
            }
            
            .field:last-child {
              border-bottom: none;
            }
            
            .label { 
              font-weight: 500; 
              color: #6b7280;
              font-size: 13px;
            }
            
            .value { 
              color: #1f2937;
              font-weight: 500;
              font-size: 13px;
              text-align: right;
            }
            
            .observations { 
              padding: 16px;
              border: 2px solid #bfdbfe;
              border-radius: 8px;
              font-size: 13px;
              line-height: 1.6;
              min-height: 120px;
              background: white;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            
            .observations.empty {
              color: #9ca3af;
              font-style: italic;
              border-style: dashed;
            }
            
            .status-badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            .status-agendada { background: #dbeafe; color: #1e40af; }
            .status-pendiente { background: #fef3c7; color: #d97706; }
            .status-completa { background: #d1fae5; color: #047857; }
            
            .footer { 
              background: #f9fafb;
              padding: 16px 30px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
              margin-bottom: 2px;
            }
            
            .footer p:last-child {
              margin-bottom: 0;
            }
            
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Centro CAFF Gestión Integral</h1>
              <h2>📋 INFORME DE CONSULTA MÉDICA</h2>
              <p>📅 Documento generado el: ${format(new Date(), 'dd/MM/yyyy')} a las ${format(new Date(), 'HH:mm')} hrs</p>
            </div>
            
            <div class="content">
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  INFORMACIÓN DEL ADOLESCENTE
                </div>
                <div class="field">
                  <span class="label">Nombre</span>
                  <span class="value">${consulta.nombre}</span>
                </div>
                <div class="field">
                  <span class="label">Cédula</span>
                  <span class="value">${consulta.cedula}</span>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
                    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
                    <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"></path>
                    <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"></path>
                  </svg>
                  DETALLES DE LA CONSULTA
                </div>
                <div class="field">
                  <span class="label">Estudio</span>
                  <span class="value">${consulta.estudio}</span>
                </div>
                <div class="field">
                  <span class="label">Educador/a</span>
                  <span class="value">${consulta.educador}</span>
                </div>
                <div class="field">
                  <span class="label">Fecha Consulta</span>
                  <span class="value">${format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}</span>
                </div>
                <div class="field">
                  <span class="label">Fecha Control</span>
                  <span class="value">${format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}</span>
                </div>
                <div class="field">
                  <span class="label">Estado</span>
                  <span class="value">
                    <span class="status-badge status-${consulta.estado.toLowerCase()}">${consulta.estado}</span>
                  </span>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                  OBSERVACIONES MÉDICAS
                </div>
                <div class="observations ${!consulta.observaciones ? 'empty' : ''}">${consulta.observaciones || '📝 Espacio para observaciones médicas:\n\n• Evaluación realizada:\n• Diagnóstico:\n• Tratamiento indicado:\n• Recomendaciones:\n• Seguimiento requerido:'}</div>
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-left">
                <p>🏥 Centro CAFF Gestión Integral</p>
                <p>Sistema de Gestión Integral</p>
              </div>
              <div class="footer-center">
                <p>📋 Documento Oficial</p>
                <p>Consulta Médica - ${consulta.nombre}</p>
              </div>
              <div class="footer-right">
                <p>📅 ${format(new Date(), 'dd/MM/yyyy')}</p>
                <p>⏰ ${format(new Date(), 'HH:mm')} hrs</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Crear un elemento temporal para el PDF
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    // Configurar opciones del PDF
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `consulta_${consulta.nombre.replace(/\s+/g, '_')}_${format(new Date(consulta.fechaConsulta), 'dd-MM-yyyy')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };
    
    try {
      // Generar PDF como blob
      const pdfBlob = await html2pdf().set(opt).from(tempDiv).outputPdf('blob');
      
      // Descargar el PDF directamente
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `consulta_${consulta.nombre.replace(/\s+/g, '_')}_${format(new Date(consulta.fechaConsulta), 'dd-MM-yyyy')}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'PDF descargado',
        description: 'El PDF se ha descargado correctamente.',
      });
      
      // Limpiar el URL
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el PDF. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      // Limpiar el elemento temporal
      document.body.removeChild(tempDiv);
    }
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
  
  const handleDownloadTablePDF = async () => {
    // Importar html2pdf dinámicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Crear el contenido HTML del PDF con diseño optimizado para impresión
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Consultas - Centro CAFF Gestión Integral</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              margin: 0; 
              line-height: 1.6; 
              color: #1f2937;
              background: white;
              min-height: 100vh;
            }
            
            .container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
            }
            
            .header { 
              background: #f8fafc;
              color: #1f2937;
              padding: 20px 30px;
              text-align: center;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .header h1 { 
              font-size: 20px; 
              font-weight: 700; 
              margin-bottom: 4px;
              letter-spacing: -0.025em;
            }
            
            .header h2 { 
              font-size: 14px; 
              font-weight: 500; 
              color: #6b7280;
              margin-bottom: 8px;
            }
            
            .header p { 
              font-size: 12px; 
              color: #6b7280;
              margin-bottom: 2px;
            }
            
            .content {
              padding: 30px;
            }
            
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              background: white;
              border: 1px solid #e5e7eb;
            }
            
            th, td { 
              padding: 8px 12px; 
              text-align: left; 
              font-size: 11px;
              border-bottom: 1px solid #f3f4f6;
              border-right: 1px solid #f3f4f6;
            }
            
            th { 
              background: #f8fafc;
              font-weight: 600;
              color: #374151;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-size: 10px;
            }
            
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            .status-badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 8px;
              font-size: 9px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            .status-agendada { background: #dbeafe; color: #1e40af; }
            .status-pendiente { background: #fef3c7; color: #d97706; }
            .status-completa { background: #d1fae5; color: #047857; }
            
            .footer { 
              background: #f9fafb;
              padding: 16px 30px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
              margin-bottom: 2px;
            }
            
            .footer p:last-child {
              margin-bottom: 0;
            }
            
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Centro CAFF Gestión Integral</h1>
              <h2>REPORTE DE CONSULTAS</h2>
              <p>Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
              <p>Total de consultas filtradas: ${filteredConsultas.length}</p>
            </div>
            
            <div class="content">
              <table>
                <thead>
                  <tr>
                    <th>Adolescente</th>
                    <th>Cédula</th>
                    <th>Estudio</th>
                    <th>Educador/a</th>
                    <th>F. Consulta</th>
                    <th>F. Control</th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredConsultas.map(consulta => `
                    <tr>
                      <td>${consulta.nombre}</td>
                      <td>${consulta.cedula}</td>
                      <td>${consulta.estudio}</td>
                      <td>${consulta.educador}</td>
                      <td>${format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}</td>
                      <td>${format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}</td>
                      <td>
                        <span class="status-badge status-${consulta.estado.toLowerCase()}">${consulta.estado}</span>
                      </td>
                      <td>${consulta.observaciones || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="footer">
              <div class="footer-left">
                <p>Centro CAFF Gestión Integral - Gestión de consultas</p>
              </div>
              <div class="footer-center">
                <p>Sistema de Gestión de Consultas Médicas</p>
              </div>
              <div class="footer-right">
                <p>${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Crear un elemento temporal para el contenido HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);
    
    // Configuración para el PDF
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `reporte_consultas_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'landscape' 
      }
    };
    
    // Generar y descargar el PDF
    try {
      // Generar el PDF como blob
      const pdfBlob = await html2pdf().set(opt).from(tempDiv).outputPdf('blob');
      
      // Descargar el PDF directamente
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `reporte_consultas_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Reporte descargado',
        description: 'El reporte se ha descargado correctamente.',
      });
      
      // Limpiar el URL
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el PDF. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      // Limpiar el elemento temporal
      document.body.removeChild(tempDiv);
    }
  };

  const handlePrint = async (sectionId: string) => {
    // Importar html2pdf dinámicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Crear el contenido HTML del PDF con diseño optimizado para impresión
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Consultas - Centro CAFF Gestión Integral</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              margin: 0; 
              line-height: 1.6; 
              color: #1f2937;
              background: white;
              min-height: 100vh;
            }
            
            .container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
            }
            
            .header { 
              background: #f8fafc;
              color: #1f2937;
              padding: 20px 30px;
              text-align: center;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .header h1 { 
              font-size: 20px; 
              font-weight: 700; 
              margin-bottom: 4px;
              letter-spacing: -0.025em;
            }
            
            .header h2 { 
              font-size: 14px; 
              font-weight: 500; 
              color: #6b7280;
              margin-bottom: 8px;
            }
            
            .header p { 
              font-size: 12px; 
              color: #6b7280;
              margin-bottom: 2px;
            }
            
            .content {
              padding: 30px;
            }
            
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              background: white;
              border: 1px solid #e5e7eb;
            }
            
            th, td { 
              padding: 8px 12px; 
              text-align: left; 
              font-size: 11px;
              border-bottom: 1px solid #f3f4f6;
              border-right: 1px solid #f3f4f6;
            }
            
            th { 
              background: #f8fafc;
              font-weight: 600;
              color: #374151;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-size: 10px;
            }
            
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            .status-badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 8px;
              font-size: 9px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            .status-agendada { background: #dbeafe; color: #1e40af; }
            .status-pendiente { background: #fef3c7; color: #d97706; }
            .status-completa { background: #d1fae5; color: #047857; }
            
            .footer { 
              background: #f9fafb;
              padding: 16px 30px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
              margin-bottom: 2px;
            }
            
            .footer p:last-child {
              margin-bottom: 0;
            }
            
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Centro CAFF Gestión Integral</h1>
              <h2>REPORTE DE CONSULTAS</h2>
              <p>Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
              <p>Total de consultas filtradas: ${filteredConsultas.length}</p>
            </div>
            
            <div class="content">
              <table>
                <thead>
                  <tr>
                    <th>Adolescente</th>
                    <th>Cédula</th>
                    <th>Estudio</th>
                    <th>Educador/a</th>
                    <th>F. Consulta</th>
                    <th>F. Control</th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredConsultas.map(consulta => `
                    <tr>
                      <td>${consulta.nombre}</td>
                      <td>${consulta.cedula}</td>
                      <td>${consulta.estudio}</td>
                      <td>${consulta.educador}</td>
                      <td>${format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}</td>
                      <td>${format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}</td>
                      <td>
                        <span class="status-badge status-${consulta.estado.toLowerCase()}">${consulta.estado}</span>
                      </td>
                      <td>${consulta.observaciones || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="footer">
              <div class="footer-left">
                <p>Centro CAFF Gestión Integral - Gestión de consultas</p>
              </div>
              <div class="footer-center">
                <p>Sistema de Gestión de Consultas Médicas</p>
              </div>
              <div class="footer-right">
                <p>${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Crear un elemento temporal para el contenido HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);
    
    // Configuración para el PDF
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `reporte_consultas_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'landscape' 
      }
    };
    
    // Generar y compartir el PDF
    try {
      // Generar el PDF como blob
      const pdfBlob = await html2pdf().set(opt).from(tempDiv).outputPdf('blob');
      
      // Crear archivo PDF
      const pdfFile = new File([pdfBlob], `reporte_consultas_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`, {
        type: 'application/pdf'
      });
      
      // Verificar si el navegador soporta Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        // Usar Web Share API para compartir el PDF
        await navigator.share({
          title: 'Reporte de Consultas - Centro CAFF Gestión Integral',
          text: `🏥 Centro CAFF Gestión Integral\n\nReporte de consultas médicas\n\n📊 Total de consultas: ${filteredConsultas.length}\n📅 Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}\n\n📱 Compartido desde Centro CAFF Gestión Integral`,
          files: [pdfFile]
        });
        
        toast({
          title: 'Reporte compartido',
          description: 'El reporte se ha compartido correctamente.',
        });
      } else {
        // Fallback: descargar el PDF
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = pdfFile.name;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Reporte descargado',
          description: 'El reporte se ha descargado correctamente.',
        });
        
        // Limpiar el URL
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el PDF. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      // Limpiar el elemento temporal
      document.body.removeChild(tempDiv);
    }
  }

  const descriptionId = useMemo(() => `alert-desc-${Math.random()}`, []);


  return (
    <>
      <PageHeader
        title="Consultas"
        subtitle="Consultas Médicas"
        icon={Stethoscope}
        onAction={handleAddConsulta}
        actionLabel="Nueva"
        actionIcon={PlusCircle}
        showBackButton={true}
        backUrl="/"
      />

      <div className="space-y-6">

        

        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="flex items-center gap-1"
              >
                {filtersExpanded ? 'Contraer' : 'Expandir'}
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  filtersExpanded && "rotate-180"
                )} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
                        {/* Vista contraída */}
            {!filtersExpanded && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Input 
                    placeholder={globalSearchText}
                    value={patientFilter}
                    onChange={e => setPatientFilter(e.target.value)}
                    className="h-10"
                  />
                </div>
 
              </div>
            )}

            {/* Vista expandida */}
            {filtersExpanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Adolescente
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
                    Educador/a
                  </label>
                  <Input
                    placeholder="Buscar por educador/a..."
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
            )}
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
                      onSharePDF={handleSharePDF}
                      onDownloadPDF={handleDownloadPDF}
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
                onDeleteConsulta={handleDeleteConfirmation}
                onSharePDF={handleSharePDF}
                onDownloadPDF={handleDownloadPDF}
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
                      onSharePDF={handleSharePDF}
                      onDownloadPDF={handleDownloadPDF}
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
                <div className="flex justify-center gap-3 mt-6 print-hidden">
                  <Button
                    onClick={() => handlePrint('consultas-table-section')}
                    variant="outline"
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 border-gray-300"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Compartir Reporte
                  </Button>
                  <Button
                    onClick={handleDownloadTablePDF}
                    variant="outline"
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 border-gray-300"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
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
          onDownloadPDF={handleDownloadPDF}
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
