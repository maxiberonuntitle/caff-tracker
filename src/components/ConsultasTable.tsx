
'use client';

import { useState, useMemo } from 'react';
import type { Consulta } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Share2, ChevronUp, ChevronDown, Download, User, CreditCard, FileText, UserCheck, Clock, Stethoscope, Edit, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { StatusBadge } from './StatusBadge';
import { ExpandableText } from './ExpandableText';
import { cn } from '@/lib/utils';

type SortConfig = {
  key: keyof Consulta | null;
  direction: 'asc' | 'desc';
};

type ConsultasTableProps = {
  consultas: Consulta[];
  onEdit: (consulta: Consulta) => void;
  onDelete: (id: string) => void;
  onSharePDF?: (consulta: Consulta) => void;
  onDownloadPDF?: (consulta: Consulta) => void;
};

export function ConsultasTable({ consultas, onEdit, onDelete, onSharePDF, onDownloadPDF }: ConsultasTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const sortedConsultas = useMemo(() => {
    if (!sortConfig.key) return consultas;

    return [...consultas].sort((a, b) => {
      let aValue: any = a[sortConfig.key!];
      let bValue: any = b[sortConfig.key!];

      // Convertir fechas para comparación
      if (sortConfig.key === 'fechaConsulta' || sortConfig.key === 'fechaControl') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else {
        // Convertir strings a minúsculas para comparación
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [consultas, sortConfig]);

  const handleSort = (key: keyof Consulta) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof Consulta) => {
    if (sortConfig.key !== key) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  // Función para abrir detalles de consulta
  const handleConsultaClick = (consulta: Consulta) => {
    setSelectedConsulta(consulta);
    setIsDetailOpen(true);
  };

  // Función para obtener el badge de estado
  const getStatusBadge = (estado: string) => {
    const colors = {
      'Agendada': 'bg-blue-100 text-blue-800 border-blue-200',
      'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Completa': 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
      )}>
        {estado}
      </span>
    );
  };

  if (consultas.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-xs">
        No se encontraron consultas para mostrar en la tabla.
      </div>
    );
  }

  const handleShare = async (consulta: Consulta) => {
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
              border-top: 1px solid #e5e7eb;
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
    
    // Generar y descargar el PDF
    try {
      await html2pdf().set(opt).from(tempDiv).save();
    } catch (error) {
      console.error('Error generando PDF:', error);
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
              border-top: 1px solid #e5e7eb;
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
                <p>📋 Consulta Médica - ${consulta.nombre}</p>
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
    
    // Generar y descargar el PDF
    try {
      await html2pdf().set(opt).from(tempDiv).save();
    } catch (error) {
      console.error('Error generando PDF:', error);
    } finally {
      // Limpiar el elemento temporal
      document.body.removeChild(tempDiv);
    }
  };

  const rowColorClass: { [key in Consulta['estado']]?: string } = {
    'Agendada': 'bg-blue-500/10 hover:bg-blue-500/20',
    'Pendiente': 'bg-yellow-500/10 hover:bg-yellow-500/20',
    'Completa': 'bg-green-500/10 hover:bg-green-500/20',
  };

  return (
    <div className="w-full overflow-x-auto" id="consultas-table-section">
        <Table className="w-full print:w-full print:overflow-visible print:table">
        <TableHeader>
            <TableRow>
            <TableHead 
              className="text-xs print:text-[10px] cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => handleSort('nombre')}
            >
              <div className="flex items-center gap-1">
                Adolescente
                {getSortIcon('nombre')}
              </div>
            </TableHead>
            <TableHead 
              className="text-xs print:text-[10px] hidden md:table-cell print:table-cell cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => handleSort('cedula')}
            >
              <div className="flex items-center gap-1">
                Cédula
                {getSortIcon('cedula')}
              </div>
            </TableHead>
            <TableHead 
              className="text-xs print:text-[10px] hidden lg:table-cell print:table-cell cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => handleSort('estudio')}
            >
              <div className="flex items-center gap-1">
                Estudio
                {getSortIcon('estudio')}
              </div>
            </TableHead>
            <TableHead 
              className="text-xs print:text-[10px] hidden lg:table-cell print:table-cell cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => handleSort('educador')}
            >
              <div className="flex items-center gap-1">
                Educador/a
                {getSortIcon('educador')}
              </div>
            </TableHead>
            <TableHead 
              className="text-xs print:text-[10px] cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => handleSort('fechaConsulta')}
            >
              <div className="flex items-center gap-1">
                F. Consulta
                {getSortIcon('fechaConsulta')}
              </div>
            </TableHead>
            <TableHead 
              className="text-xs print:text-[10px] hidden lg:table-cell print:table-cell cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => handleSort('fechaControl')}
            >
              <div className="flex items-center gap-1">
                F. Control
                {getSortIcon('fechaControl')}
              </div>
            </TableHead>
            <TableHead 
              className="text-xs print:text-[10px] hidden xl:table-cell print:table-cell cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => handleSort('observaciones')}
            >
              <div className="flex items-center gap-1">
                Observaciones
                {getSortIcon('observaciones')}
              </div>
            </TableHead>
            <TableHead 
              className="text-xs print:text-[10px] cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => handleSort('estado')}
            >
              <div className="flex items-center gap-1">
                Estado
                {getSortIcon('estado')}
              </div>
            </TableHead>
            <TableHead className="text-right text-xs print-hidden hidden lg:table-cell">Acciones</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {sortedConsultas.map((consulta) => (
            <TableRow 
              key={consulta.id} 
              className={cn(
                "text-xs print:text-[9px]", 
                rowColorClass[consulta.estado] || '',
                "cursor-pointer hover:bg-gray-50 transition-colors"
              )}
              onClick={() => handleConsultaClick(consulta)}
            >
                <TableCell className="print:py-1">
                    <div className="font-medium print:text-[9px]">{consulta.nombre}</div>
                    <div className="text-muted-foreground md:hidden print:text-[8px]">{consulta.cedula}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell print:table-cell print:py-1 print:text-[9px]">{consulta.cedula}</TableCell>
                <TableCell className="hidden lg:table-cell print:table-cell print:py-1 print:text-[9px]">{consulta.estudio}</TableCell>
                <TableCell className="hidden lg:table-cell print:table-cell print:py-1 print:text-[9px]">{consulta.educador}</TableCell>
                <TableCell className="print:py-1 print:text-[9px]">{format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="hidden lg:table-cell print:table-cell print:py-1 print:text-[9px]">{format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="hidden xl:table-cell print:table-cell print:py-1 print:text-[8px] max-w-[150px]">
                    <div className="truncate">{consulta.observaciones || '-'}</div>
                </TableCell>
                <TableCell className="print:py-1">
                    <StatusBadge status={consulta.estado} />
                </TableCell>
                <TableCell className="text-right print-hidden hidden lg:table-cell">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onEdit(consulta);
                        }}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleShare(consulta);
                        }} className="flex gap-2">
                            Compartir
                            <Share2 className="h-3 w-3" />
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onDelete(consulta.id);
                        }} className="text-destructive">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>

        {/* Modal de detalles de consulta */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 shadow-lg">
            <DialogHeader className="bg-gradient-to-r from-slate-100 to-gray-100 text-gray-800 rounded-t-lg -mt-6 -mx-6 px-6 py-3 mb-4 border-b border-gray-200">
              <DialogTitle className="text-xl font-semibold flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                Detalles de la Consulta
              </DialogTitle>
            </DialogHeader>
            
            {selectedConsulta && (
              <div className="space-y-4 sm:space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      INFORMACIÓN DEL ADOLESCENTE
                    </h4>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <div><strong>Nombre:</strong> {selectedConsulta.nombre}</div>
                      <div><strong>Cédula:</strong> {selectedConsulta.cedula}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                      <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4" />
                      ESTADO Y ESTUDIO
                    </h4>
                    <div className="space-y-2">
                      <div>{getStatusBadge(selectedConsulta.estado)}</div>
                      <div className="text-xs sm:text-sm">
                        <strong>Estudio:</strong> {selectedConsulta.estudio}
                      </div>
                      <div className="text-xs sm:text-sm">
                        <strong>Educador/a:</strong> {selectedConsulta.educador}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Fechas */}
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      FECHA DE CONSULTA
                    </h4>
                    <div className="text-xs sm:text-sm">
                      {format(new Date(selectedConsulta.fechaConsulta), 'EEEE, d MMMM yyyy', { locale: es })}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      FECHA DE CONTROL
                    </h4>
                    <div className="text-xs sm:text-sm">
                      {format(new Date(selectedConsulta.fechaControl), 'EEEE, d MMMM yyyy', { locale: es })}
                    </div>
                  </div>
                </div>
                
                {/* Observaciones */}
                {selectedConsulta.observaciones && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      OBSERVACIONES
                    </h4>
                    <div className="bg-muted p-2 sm:p-3 rounded-md text-xs sm:text-sm">
                      {selectedConsulta.observaciones}
                    </div>
                  </div>
                )}
                
                {/* Acciones */}
                <div className="flex flex-wrap gap-2 pt-3 sm:pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onEdit(selectedConsulta);
                      setIsDetailOpen(false);
                    }}
                    className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleShare(selectedConsulta);
                      setIsDetailOpen(false);
                    }}
                    className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Compartir PDF</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleDownloadPDF(selectedConsulta);
                      setIsDetailOpen(false);
                    }}
                    className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Descargar PDF</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onDelete(selectedConsulta.id);
                      setIsDetailOpen(false);
                    }}
                    className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </div>
  );
}
