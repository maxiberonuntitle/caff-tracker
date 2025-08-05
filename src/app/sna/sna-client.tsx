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
import { PlusCircle, Printer, ChevronLeft, ChevronRight, Grid3X3, Calendar, Table, Search, User, UserCheck, Filter, FileText, CalendarDays, ChevronDown, Download, AlertTriangle, Share2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { SNA } from '@/lib/types';
import { SNAForm } from './sna-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { SNATable } from '@/components/SNATable';
import { SNAGrid } from '@/components/SNAGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { addSNA, deleteSNA, updateSNA } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SNACalendar } from '@/components/SNACalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

type SNAClientProps = {
  initialSNAs: SNA[];
}

export function SNAClient({ initialSNAs }: SNAClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useMobile();
  const searchParams = useSearchParams();
  const [snas, setSNAs] = useState<SNA[]>(initialSNAs);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedSNA, setSelectedSNA] = useState<SNA | null>(null);
  const [snaToDelete, setSnaToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    const statusFromUrl = searchParams.get('status');
    return statusFromUrl || 'todos';
  });
  const [lesionesFilter, setLesionesFilter] = useState<string>(() => {
    const lesionesFromUrl = searchParams.get('lesiones');
    return lesionesFromUrl || 'todos';
  });
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>(undefined);
  const [retiraFilter, setRetiraFilter] = useState('');
  const [adolescenteFilter, setAdolescenteFilter] = useState('');
  const [activeTab, setActiveTab] = useState('grid');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const lastFetchRef = useRef<number>(0);

  // Texto de búsqueda global para móvil
  const globalSearchText = useMemo(() => {
    const parts = [];
    if (adolescenteFilter) parts.push(`Adolescente: ${adolescenteFilter}`);
    if (retiraFilter) parts.push(`Retira: ${retiraFilter}`);
    if (statusFilter !== 'todos') parts.push(`Estado: ${statusFilter}`);
    if (lesionesFilter !== 'todos') parts.push(`Constatación: ${lesionesFilter === 'si' ? 'Sí' : 'No'}`);
    if (dateFilter?.from) {
      const fromDate = format(dateFilter.from, 'dd/MM/yyyy');
      const toDate = dateFilter.to ? format(dateFilter.to, 'dd/MM/yyyy') : '';
      parts.push(`Fechas: ${fromDate}${toDate ? ` - ${toDate}` : ''}`);
    }
    return parts.length > 0 ? parts.join(', ') : 'Búsqueda rápida por adolescente';
  }, [adolescenteFilter, retiraFilter, statusFilter, lesionesFilter, dateFilter]);

  // Manejar parámetro edit de la URL
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      console.log('Edit ID from URL:', editId);
      const snaToEdit = snas.find(s => s.id === editId);
      console.log('Found SNA to edit:', snaToEdit);
      if (snaToEdit) {
        // Usar setTimeout para evitar setState durante el renderizado
        setTimeout(() => {
          setSelectedSNA(snaToEdit);
          setIsFormOpen(true);
          // Limpiar el parámetro de la URL
          router.replace('/sna', { scroll: false });
        }, 0);
      }
    }
  }, [searchParams, snas, router]);

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
      const response = await fetch('/api/snas', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSNAs(data);
      } else {
        console.error('Failed to fetch SNAs');
      }
    } catch (error) {
      console.error('Error fetching SNAs:', error);
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
        const lastLoad = sessionStorage.getItem('lastSNALoad');
        if (!lastLoad || (now - parseInt(lastLoad)) > 60000) {
          // Usar setTimeout para evitar setState durante el renderizado
          setTimeout(() => {
            reloadData(true);
            sessionStorage.setItem('lastSNALoad', now.toString());
          }, 0);
        }
      }
    };

    // Solo establecer el intervalo si la página está visible y no hay carga en curso
    if (!document.hidden && !isLoading && !isSyncing) {
      intervalId = setInterval(() => {
        if (!document.hidden && !isLoading && !isSyncing) {
          // Usar setTimeout para evitar setState durante el renderizado
          setTimeout(() => {
            reloadData(true); // Auto sync
            sessionStorage.setItem('lastSNALoad', Date.now().toString());
          }, 0);
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
  const filteredSNAs = useMemo(() => {
    return snas.filter(sna => {
      const matchesAdolescente = adolescenteFilter === '' || 
        sna.nombreAdolescente.toLowerCase().includes(adolescenteFilter.toLowerCase());
      const matchesRetira = retiraFilter === '' || 
        (sna.retira && sna.retira.toLowerCase().includes(retiraFilter.toLowerCase()));
      const matchesStatus = statusFilter === 'todos' || sna.estado === statusFilter;
      const matchesLesiones = lesionesFilter === 'todos' || 
        (lesionesFilter === 'si' && sna.constatacionLesiones) ||
        (lesionesFilter === 'no' && !sna.constatacionLesiones);
      const matchesDateRange = dateFilter === undefined || 
        (dateFilter.from && dateFilter.to && 
         new Date(sna.fechaDenuncia) >= dateFilter.from && 
         new Date(sna.fechaDenuncia) <= dateFilter.to);

      return matchesAdolescente && matchesRetira && matchesStatus && matchesLesiones && matchesDateRange;
    });
  }, [snas, adolescenteFilter, retiraFilter, statusFilter, lesionesFilter, dateFilter]);

  // Lógica de paginación
  const totalPages = Math.ceil(filteredSNAs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSNAs = filteredSNAs.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [adolescenteFilter, retiraFilter, statusFilter, lesionesFilter, dateFilter]);

  const handleAddSNA = () => {
    setSelectedSNA(null);
    setIsFormOpen(true);
  };

  const handleEditSNA = (sna: SNA) => {
    console.log('Editando SNA desde calendario:', sna);
    setSelectedSNA(sna);
    setIsFormOpen(true);
  };

  const handleDeleteConfirmation = (id: string) => {
    setSnaToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDeleteSNA = async () => {
    if (snaToDelete) {
      setIsLoading(true);
      try {
        await deleteSNA(snaToDelete);
        // Remove from local state immediately
        setSNAs(prev => prev.filter(sna => sna.id !== snaToDelete));
        toast({
          title: 'SNA eliminada',
          description: 'El registro de la SNA ha sido eliminado.',
          variant: 'default',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'No se pudo eliminar la SNA.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsAlertOpen(false);
        setSnaToDelete(null);
        setIsLoading(false);
      }
    }
  };

  const handleShare = (sna: SNA) => {
    const details = [
      `🏥 CAFF CONSULTAS MÉDICAS`,
      `SALIDA NO ACORDADA (SNA)`,
      `Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
      ``,
      `📋 INFORMACIÓN DEL ADOLESCENTE`,
      `👤 Nombre: ${sna.nombreAdolescente}`,
      `🆔 Número de Denuncia: ${sna.numeroDenuncia}`,
      ``,
      `📅 DETALLES DE LA SNA`,
      `📅 Fecha de Denuncia: ${format(new Date(sna.fechaDenuncia), 'dd/MM/yyyy')}`,
      `📊 Estado: ${sna.estado}`,
      `🔍 Constatación de Lesiones: ${sna.constatacionLesiones ? 'Sí' : 'No'}`,
      sna.fechaCierre ? `📅 Fecha de Cierre: ${format(new Date(sna.fechaCierre), 'dd/MM/yyyy')}` : null,
      sna.retira ? `👨‍⚕️ Retira: ${sna.retira}` : null,
      sna.comentarios ? [
        ``,
        `📝 COMENTARIOS`,
        `${sna.comentarios}`
      ] : null,
      ``,
      `📱 Compartido desde CAFF Consultas Médicas`,
      `🕐 ${format(new Date(), 'dd/MM/yyyy HH:mm')}`
    ].filter(Boolean).flat().join('\n');
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(details)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSharePDF = async (sna: SNA) => {
    // Importar html2pdf dinámicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Crear el contenido HTML del PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>SNA - ${sna.nombreAdolescente}</title>
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
            
            .comments {
              background: #f9fafb;
              padding: 16px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
              font-size: 13px;
              line-height: 1.6;
              white-space: pre-wrap;
            }
            
            .comments.empty {
              background: #fef3c7;
              border-left-color: #f59e0b;
              color: #92400e;
              font-style: italic;
            }
            
            .status-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .status-abierta {
              background: #fef3c7;
              color: #92400e;
            }
            
            .status-cerrada {
              background: #d1fae5;
              color: #065f46;
            }
            
            .lesiones-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
            }
            
            .lesiones-si {
              background: #fee2e2;
              color: #991b1b;
            }
            
            .lesiones-no {
              background: #f3f4f6;
              color: #374151;
            }
            
            .footer {
              background: #f8fafc;
              padding: 20px 30px;
              border-top: 2px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #6b7280;
            }
            
            .footer-left, .footer-center, .footer-right {
              flex: 1;
            }
            
            .footer-center {
              text-align: center;
            }
            
            .footer-right {
              text-align: right;
            }
            
            @media print {
              body { margin: 0; }
              .container { max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CAFF CONSULTAS MÉDICAS</h1>
              <h2>SALIDA NO ACORDADA (SNA)</h2>
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
                  <span class="value">${sna.nombreAdolescente}</span>
                </div>
                <div class="field">
                  <span class="label">Número de Denuncia</span>
                  <span class="value">${sna.numeroDenuncia}</span>
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
                  DETALLES DE LA SNA
                </div>
                <div class="field">
                  <span class="label">Fecha de Denuncia</span>
                  <span class="value">${format(new Date(sna.fechaDenuncia), 'dd/MM/yyyy')}</span>
                </div>
                <div class="field">
                  <span class="label">Estado</span>
                  <span class="value">
                    <span class="status-badge status-${sna.estado.toLowerCase()}">${sna.estado}</span>
                  </span>
                </div>
                <div class="field">
                  <span class="label">Constatación de Lesiones</span>
                  <span class="value">
                    <span class="lesiones-badge lesiones-${sna.constatacionLesiones ? 'si' : 'no'}">${sna.constatacionLesiones ? 'Sí' : 'No'}</span>
                  </span>
                </div>
                ${sna.fechaCierre ? `
                <div class="field">
                  <span class="label">Fecha de Cierre</span>
                  <span class="value">${format(new Date(sna.fechaCierre), 'dd/MM/yyyy')}</span>
                </div>
                ` : ''}
                ${sna.retira ? `
                <div class="field">
                  <span class="label">Retira</span>
                  <span class="value">${sna.retira}</span>
                </div>
                ` : ''}
              </div>
              
              ${sna.comentarios ? `
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                  COMENTARIOS
                </div>
                <div class="comments">${sna.comentarios}</div>
              </div>
              ` : `
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                  COMENTARIOS
                </div>
                <div class="comments empty">Sin comentarios registrados</div>
              </div>
              `}
            </div>
            
            <div class="footer">
              <div class="footer-left">
                <p>CAFF Consultas Médicas - Gestión de SNAs</p>
              </div>
              <div class="footer-center">
                <p>Sistema de Gestión de Salidas No Acordadas</p>
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
      filename: `sna_${sna.nombreAdolescente.replace(/\s+/g, '_')}_${format(new Date(sna.fechaDenuncia), 'dd-MM-yyyy')}.pdf`,
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
      // Generar el PDF como blob
      const pdfBlob = await html2pdf().set(opt).from(tempDiv).outputPdf('blob');
      
      // Crear archivo PDF
      const pdfFile = new File([pdfBlob], `sna_${sna.nombreAdolescente.replace(/\s+/g, '_')}_${format(new Date(sna.fechaDenuncia), 'dd-MM-yyyy')}.pdf`, {
        type: 'application/pdf'
      });
      
      // Verificar si el navegador soporta Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        // Usar Web Share API para compartir el PDF
        await navigator.share({
          title: `SNA - ${sna.nombreAdolescente}`,
          text: `🏥 CAFF CONSULTAS MÉDICAS\n\nSalida No Acordada (SNA) de ${sna.nombreAdolescente}\n\n📋 Información:\n• Adolescente: ${sna.nombreAdolescente}\n• N° Denuncia: ${sna.numeroDenuncia}\n• Estado: ${sna.estado}\n• Constatación de lesiones: ${sna.constatacionLesiones ? 'Sí' : 'No'}\n\n📅 Fecha Denuncia: ${format(new Date(sna.fechaDenuncia), 'dd/MM/yyyy')}\n${sna.fechaCierre ? `📅 Fecha Cierre: ${format(new Date(sna.fechaCierre), 'dd/MM/yyyy')}\n` : ''}${sna.retira ? `👨‍⚕️ Retira: ${sna.retira}\n` : ''}\n📱 Compartido desde CAFF Consultas Médicas`,
          files: [pdfFile]
        });
      } else {
        // Fallback: descargar el PDF y mostrar opciones
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = pdfFile.name;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Mostrar mensaje de éxito
        toast({
          title: 'PDF descargado',
          description: `El archivo ${pdfFile.name} se ha descargado correctamente.`,
        });
        
        // Limpiar el URL
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      }
      
    } catch (error) {
      console.error('Error generando PDF para compartir:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el PDF para compartir.',
        variant: 'destructive',
      });
    } finally {
      // Limpiar el elemento temporal
      document.body.removeChild(tempDiv);
    }
  };

  const handleDownloadPDF = async (sna: SNA) => {
    // Importar html2pdf dinámicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Crear el contenido HTML del PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>SNA - ${sna.nombreAdolescente}</title>
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
            
            .comments {
              background: #f9fafb;
              padding: 16px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
              font-size: 13px;
              line-height: 1.6;
              white-space: pre-wrap;
            }
            
            .comments.empty {
              background: #fef3c7;
              border-left-color: #f59e0b;
              color: #92400e;
              font-style: italic;
            }
            
            .status-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .status-abierta {
              background: #fef3c7;
              color: #92400e;
            }
            
            .status-cerrada {
              background: #d1fae5;
              color: #065f46;
            }
            
            .lesiones-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
            }
            
            .lesiones-si {
              background: #fee2e2;
              color: #991b1b;
            }
            
            .lesiones-no {
              background: #f3f4f6;
              color: #374151;
            }
            
            .footer {
              background: #f8fafc;
              padding: 20px 30px;
              border-top: 2px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #6b7280;
            }
            
            .footer-left, .footer-center, .footer-right {
              flex: 1;
            }
            
            .footer-center {
              text-align: center;
            }
            
            .footer-right {
              text-align: right;
            }
            
            @media print {
              body { margin: 0; }
              .container { max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CAFF CONSULTAS MÉDICAS</h1>
              <h2>SALIDA NO ACORDADA (SNA)</h2>
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
                  <span class="value">${sna.nombreAdolescente}</span>
                </div>
                <div class="field">
                  <span class="label">Número de Denuncia</span>
                  <span class="value">${sna.numeroDenuncia}</span>
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
                  DETALLES DE LA SNA
                </div>
                <div class="field">
                  <span class="label">Fecha de Denuncia</span>
                  <span class="value">${format(new Date(sna.fechaDenuncia), 'dd/MM/yyyy')}</span>
                </div>
                <div class="field">
                  <span class="label">Estado</span>
                  <span class="value">
                    <span class="status-badge status-${sna.estado.toLowerCase()}">${sna.estado}</span>
                  </span>
                </div>
                <div class="field">
                  <span class="label">Constatación de Lesiones</span>
                  <span class="value">
                    <span class="lesiones-badge lesiones-${sna.constatacionLesiones ? 'si' : 'no'}">${sna.constatacionLesiones ? 'Sí' : 'No'}</span>
                  </span>
                </div>
                ${sna.fechaCierre ? `
                <div class="field">
                  <span class="label">Fecha de Cierre</span>
                  <span class="value">${format(new Date(sna.fechaCierre), 'dd/MM/yyyy')}</span>
                </div>
                ` : ''}
                ${sna.retira ? `
                <div class="field">
                  <span class="label">Retira</span>
                  <span class="value">${sna.retira}</span>
                </div>
                ` : ''}
              </div>
              
              ${sna.comentarios ? `
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                  COMENTARIOS
                </div>
                <div class="comments">${sna.comentarios}</div>
              </div>
              ` : `
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                  COMENTARIOS
                </div>
                <div class="comments empty">Sin comentarios registrados</div>
              </div>
              `}
            </div>
            
            <div class="footer">
              <div class="footer-left">
                <p>CAFF Consultas Médicas - Gestión de SNAs</p>
              </div>
              <div class="footer-center">
                <p>Sistema de Gestión de Salidas No Acordadas</p>
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
      filename: `SNA_${sna.numeroDenuncia}_${sna.nombreAdolescente.replace(/\s+/g, '_')}.pdf`,
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
      // Generar el PDF como blob
      const pdfBlob = await html2pdf().set(opt).from(tempDiv).outputPdf('blob');
      
      // Crear archivo PDF
      const pdfFile = new File([pdfBlob], `SNA_${sna.numeroDenuncia}_${sna.nombreAdolescente.replace(/\s+/g, '_')}.pdf`, {
        type: 'application/pdf'
      });
      
      // Descargar el PDF
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = pdfFile.name;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Mostrar mensaje de éxito
      toast({
        title: 'PDF descargado',
        description: `Se ha descargado el PDF de la SNA ${sna.numeroDenuncia}`,
      });
      
      // Limpiar el URL
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast({
        title: 'Error al generar PDF',
        description: 'No se pudo generar el PDF. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      // Limpiar el elemento temporal
      document.body.removeChild(tempDiv);
    }
  };

  const handleDownloadTablePDF = async () => {
    // Importar html2pdf dinámicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Crear el contenido HTML del PDF para la tabla completa
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de SNAs - CAFF</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              margin: 0; 
              line-height: 1.6; 
              color: #1f2937;
              background: white;
            }
            
            .container {
              max-width: 100%;
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
            
            .table-container {
              overflow-x: auto;
              margin-top: 20px;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            
            th, td {
              border: 1px solid #e5e7eb;
              padding: 8px 12px;
              text-align: left;
            }
            
            th {
              background: #f9fafb;
              font-weight: 600;
              color: #374151;
            }
            
            tr:nth-child(even) {
              background: #f9fafb;
            }
            
            .status-badge {
              padding: 2px 6px;
              border-radius: 8px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
            }
            
            .status-abierta {
              background: #fef3c7;
              color: #92400e;
            }
            
            .status-cerrada {
              background: #d1fae5;
              color: #065f46;
            }
            
            .lesiones-badge {
              padding: 2px 6px;
              border-radius: 8px;
              font-size: 10px;
              font-weight: 600;
            }
            
            .lesiones-si {
              background: #fee2e2;
              color: #991b1b;
            }
            
            .lesiones-no {
              background: #f3f4f6;
              color: #374151;
            }
            
            .footer {
              background: #f8fafc;
              padding: 20px 30px;
              border-top: 2px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #6b7280;
            }
            
            .footer-left, .footer-center, .footer-right {
              flex: 1;
            }
            
            .footer-center {
              text-align: center;
            }
            
            .footer-right {
              text-align: right;
            }
            
            @media print {
              body { margin: 0; }
              .container { max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CAFF CONSULTAS MÉDICAS</h1>
              <h2>REPORTE DE SALIDAS NO ACORDADAS (SNAs)</h2>
              <p>Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            </div>
            
            <div class="content">
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Adolescente</th>
                      <th>N° Denuncia</th>
                      <th>F. Denuncia</th>
                      <th>Estado</th>
                      <th>Constatación de lesiones</th>
                      <th>Retira</th>
                      <th>F. Cierre</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredSNAs.map(sna => `
                      <tr>
                        <td>${sna.nombreAdolescente}</td>
                        <td>${sna.numeroDenuncia}</td>
                        <td>${format(new Date(sna.fechaDenuncia), 'dd/MM/yyyy')}</td>
                        <td>
                          <span class="status-badge status-${sna.estado.toLowerCase()}">${sna.estado}</span>
                        </td>
                        <td>
                          <span class="lesiones-badge lesiones-${sna.constatacionLesiones ? 'si' : 'no'}">${sna.constatacionLesiones ? 'Sí' : 'No'}</span>
                        </td>
                        <td>${sna.retira || '-'}</td>
                        <td>${sna.fechaCierre ? format(new Date(sna.fechaCierre), 'dd/MM/yyyy') : '-'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-left">
                <p>CAFF Consultas Médicas - Gestión de SNAs</p>
              </div>
              <div class="footer-center">
                <p>Sistema de Gestión de Salidas No Acordadas</p>
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
      filename: `reporte_snas_${format(new Date(), 'dd-MM-yyyy')}.pdf`,
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
    
    try {
      // Generar y descargar el PDF
      await html2pdf().set(opt).from(tempDiv).save();
      
      toast({
        title: 'PDF descargado',
        description: 'El reporte de SNAs se ha descargado correctamente.',
      });
    } catch (error) {
      console.error('Error generando PDF del reporte:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el PDF del reporte.',
        variant: 'destructive',
      });
    } finally {
      // Limpiar el elemento temporal
      document.body.removeChild(tempDiv);
    }
  };

  const handleShareTablePDF = async () => {
    // Importar html2pdf dinámicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Crear el contenido HTML del PDF para la tabla completa
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de SNAs - CAFF</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              margin: 0; 
              line-height: 1.6; 
              color: #1f2937;
              background: white;
            }
            
            .container {
              max-width: 100%;
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
            
            .table-container {
              overflow-x: auto;
              margin-top: 20px;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            
            th, td {
              border: 1px solid #e5e7eb;
              padding: 8px 12px;
              text-align: left;
            }
            
            th {
              background: #f9fafb;
              font-weight: 600;
              color: #374151;
            }
            
            tr:nth-child(even) {
              background: #f9fafb;
            }
            
            .status-badge {
              padding: 2px 6px;
              border-radius: 8px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
            }
            
            .status-abierta {
              background: #fef3c7;
              color: #92400e;
            }
            
            .status-cerrada {
              background: #d1fae5;
              color: #065f46;
            }
            
            .lesiones-badge {
              padding: 2px 6px;
              border-radius: 8px;
              font-size: 10px;
              font-weight: 600;
            }
            
            .lesiones-si {
              background: #fee2e2;
              color: #991b1b;
            }
            
            .lesiones-no {
              background: #f3f4f6;
              color: #374151;
            }
            
            .footer {
              background: #f8fafc;
              padding: 20px 30px;
              border-top: 2px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #6b7280;
            }
            
            .footer-left, .footer-center, .footer-right {
              flex: 1;
            }
            
            .footer-center {
              text-align: center;
            }
            
            .footer-right {
              text-align: right;
            }
            
            @media print {
              body { margin: 0; }
              .container { max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CAFF CONSULTAS MÉDICAS</h1>
              <h2>REPORTE DE SALIDAS NO ACORDADAS (SNAs)</h2>
              <p>Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            </div>
            
            <div class="content">
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Adolescente</th>
                      <th>N° Denuncia</th>
                      <th>F. Denuncia</th>
                      <th>Estado</th>
                      <th>Constatación de lesiones</th>
                      <th>Retira</th>
                      <th>F. Cierre</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredSNAs.map(sna => `
                      <tr>
                        <td>${sna.nombreAdolescente}</td>
                        <td>${sna.numeroDenuncia}</td>
                        <td>${format(new Date(sna.fechaDenuncia), 'dd/MM/yyyy')}</td>
                        <td>
                          <span class="status-badge status-${sna.estado.toLowerCase()}">${sna.estado}</span>
                        </td>
                        <td>
                          <span class="lesiones-badge lesiones-${sna.constatacionLesiones ? 'si' : 'no'}">${sna.constatacionLesiones ? 'Sí' : 'No'}</span>
                        </td>
                        <td>${sna.retira || '-'}</td>
                        <td>${sna.fechaCierre ? format(new Date(sna.fechaCierre), 'dd/MM/yyyy') : '-'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-left">
                <p>CAFF Consultas Médicas - Gestión de SNAs</p>
              </div>
              <div class="footer-center">
                <p>Sistema de Gestión de Salidas No Acordadas</p>
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
      filename: `reporte_snas_${format(new Date(), 'dd-MM-yyyy')}.pdf`,
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
    
    try {
      // Generar el PDF como blob
      const pdfBlob = await html2pdf().set(opt).from(tempDiv).outputPdf('blob');
      
      // Crear un archivo para compartir
      const file = new File([pdfBlob], `reporte_snas_${format(new Date(), 'dd-MM-yyyy')}.pdf`, {
        type: 'application/pdf',
      });
      
      // Intentar compartir usando Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Reporte de SNAs - CAFF',
          text: 'Reporte de Salidas No Acordadas generado desde CAFF Consultas Médicas',
          files: [file],
        });
        
        toast({
          title: 'Reporte compartido',
          description: 'El reporte de SNAs se ha compartido correctamente.',
        });
      } else {
        // Fallback: descargar el archivo
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_snas_${format(new Date(), 'dd-MM-yyyy')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: 'PDF descargado',
          description: 'El reporte de SNAs se ha descargado correctamente.',
        });
      }
    } catch (error) {
      console.error('Error compartiendo PDF del reporte:', error);
      toast({
        title: 'Error',
        description: 'No se pudo compartir el PDF del reporte.',
        variant: 'destructive',
      });
    } finally {
      // Limpiar el elemento temporal
      document.body.removeChild(tempDiv);
    }
  };

  const handleFormSubmit = async (data: Omit<SNA, 'id'> | SNA) => {
    if (isLoading) return; // Prevent double submission
    
    setIsLoading(true);
    try {
      if ('id' in data && data.id) {
        await updateSNA(data.id, data);
        // Update local state immediately
        setSNAs(prev => prev.map(sna => 
          sna.id === data.id ? { 
            ...sna, 
            ...data,
            fechaDenuncia: data.fechaDenuncia || sna.fechaDenuncia,
            fechaCierre: data.fechaCierre || sna.fechaCierre
          } : sna
        ));
        toast({
          title: 'SNA actualizada',
          description: 'Los datos de la SNA se han actualizado.',
        });
      } else {
        const newSNA = await addSNA(data);
        // Add to local state immediately with the real ID from Firebase
        setSNAs(prev => [newSNA as SNA, ...prev]);
        toast({
          title: 'SNA creada',
          description: 'Se ha registrado una nueva SNA.',
        });
      }
      // Force a refresh to get the latest data from server
      router.refresh();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'No se pudo guardar la SNA.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsFormOpen(false);
      setSelectedSNA(null);
      setIsLoading(false);
    }
  };

  const descriptionId = useMemo(() => `alert-desc-${Math.random()}`, []);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Gestión de SNAs"
          subtitle="Salidas No Acordadas"
          icon={AlertTriangle}
          onAction={handleAddSNA}
          actionLabel="Nueva SNA"
          actionIcon={PlusCircle}
          showBackButton={true}
          backUrl="/"
        />

        {/* Filtros */}
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
                    value={adolescenteFilter}
                    onChange={e => setAdolescenteFilter(e.target.value)}
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
                    value={adolescenteFilter}
                    onChange={e => setAdolescenteFilter(e.target.value)}
                    className="h-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Retira
                  </label>
                  <Input
                    placeholder="Buscar por educador/a..."
                    value={retiraFilter}
                    onChange={e => setRetiraFilter(e.target.value)}
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
                      <SelectItem value="Abierta">🟨 Abierta</SelectItem>
                      <SelectItem value="Cerrada">🟩 Cerrada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Constatación de Lesiones
                  </label>
                  <Select value={lesionesFilter} onValueChange={setLesionesFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Seleccionar lesiones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los Casos</SelectItem>
                      <SelectItem value="si">🛡️ Con Constatación</SelectItem>
                      <SelectItem value="no">✅ Sin Constatación</SelectItem>
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Tarjetas
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Tabla
            </TabsTrigger>
          </TabsList>

          {/* Tab de Tarjetas */}
          <TabsContent value="grid" className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-48">
                    <LoadingSpinner size="lg" text="Cargando tarjetas..." />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <SNAGrid
                snas={filteredSNAs}
                onEdit={handleEditSNA}
                onDelete={handleDeleteConfirmation}
                onShare={handleShare}
                onSharePDF={handleSharePDF}
                onDownloadPDF={handleDownloadPDF}
              />
            )}
          </TabsContent>

          {/* Tab de Calendario */}
          <TabsContent value="calendar" className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-48">
                    <LoadingSpinner size="lg" text="Cargando calendario..." />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <SNACalendar
                snas={filteredSNAs}
                onEdit={handleEditSNA}
                onDelete={handleDeleteConfirmation}
                onShare={handleShare}
                onSharePDF={handleSharePDF}
                onDownloadPDF={handleDownloadPDF}
              />
            )}
          </TabsContent>

          {/* Tab de Tabla */}
          <TabsContent value="table" className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-48">
                    <LoadingSpinner size="lg" text="Cargando tabla..." />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <SNATable
                snas={paginatedSNAs}
                onEdit={handleEditSNA}
                onDelete={handleDeleteConfirmation}
                onShare={handleShare}
                onSharePDF={handleSharePDF}
                onDownloadPDF={handleDownloadPDF}
              />
            )}
            
            {/* Controles de Paginación */}
            {!isLoading && filteredSNAs.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6 print-hidden">
                <div className="text-sm text-gray-600">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, filteredSNAs.length)} de {filteredSNAs.length} SNAs
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
            
            {!isLoading && filteredSNAs.length > 0 && (
              <div className="flex justify-center gap-3 mt-6 print-hidden">
                <Button
                  onClick={handleShareTablePDF}
                  variant="outline"
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 border-gray-300"
                >
                  <Share2 className="mr-2 h-4 w-4" />
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
          </TabsContent>
        </Tabs>
      </div>

      <SNAForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSubmit={handleFormSubmit}
        onDelete={handleDeleteConfirmation}
        onShare={handleShare}
        onSharePDF={handleSharePDF}
        onDownloadPDF={handleSharePDF}
        initialData={selectedSNA}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen} aria-describedby={descriptionId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription id={descriptionId}>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro de la SNA.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSNA}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 