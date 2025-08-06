'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle, CalendarDays, User, CreditCard, FileText, UserCheck, Clock, Stethoscope, Edit, Share2, Download, X } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Consulta } from '@/lib/types';
import { cn } from '@/lib/utils';

type ConsultasCalendarProps = {
  consultas: Consulta[];
  onAddConsulta: () => void;
  onEditConsulta: (consulta: Consulta) => void;
  onDeleteConsulta?: (id: string) => void;
  onSharePDF?: (consulta: Consulta) => void;
  onDownloadPDF?: (consulta: Consulta) => void;
};

const getStatusColor = (estado: string) => {
  switch (estado) {
    case 'Agendada':
      return 'bg-blue-500';
    case 'Pendiente':
      return 'bg-yellow-500';
    case 'Completa':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export function ConsultasCalendar({ 
  consultas, 
  onAddConsulta, 
  onEditConsulta, 
  onDeleteConsulta,
  onSharePDF,
  onDownloadPDF 
}: ConsultasCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Agrupar consultas por fecha
  const consultasPorFecha = consultas.reduce((acc, consulta) => {
    const fecha = format(parseISO(consulta.fechaConsulta), 'yyyy-MM-dd');
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(consulta);
    return acc;
  }, {} as Record<string, Consulta[]>);

  // Función para renderizar el contenido de cada día
  const renderDayContent = (day: Date) => {
    const fechaStr = format(day, 'yyyy-MM-dd');
    const consultasDelDia = consultasPorFecha[fechaStr] || [];
    const isSelected = selectedDay && isSameDay(day, selectedDay);

    return (
      <div className="relative w-full h-full">
        {/* Número del día siempre visible */}
        <div className={cn(
          "absolute top-1 left-1 text-xs font-medium z-10",
          isSelected ? "text-white" : "text-gray-900"
        )}>
          {format(day, 'd')}
        </div>
        
        {/* Indicadores de consultas (solo visuales, no clickeables) */}
        {consultasDelDia.length > 0 && (
          <div className="absolute bottom-1 left-1 right-1">
            <div className="flex flex-col gap-0.5">
              {consultasDelDia.slice(0, 2).map((consulta, index) => (
                <div
                  key={consulta.id}
                  className={cn(
                    'h-1.5 rounded-full opacity-80 transition-opacity',
                    getStatusColor(consulta.estado)
                  )}
                  title={`${consulta.nombre} - ${consulta.estado}`}
                />
              ))}
              {consultasDelDia.length > 2 && (
                <div className="h-1.5 rounded-full bg-gray-400 opacity-60 text-[6px] text-white flex items-center justify-center">
                  +{consultasDelDia.length - 2}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Obtener consultas del día seleccionado
  const consultasDelDiaSeleccionado = selectedDay 
    ? consultasPorFecha[format(selectedDay, 'yyyy-MM-dd')] || []
    : [];

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

  const handleSharePDF = async (consulta: Consulta) => {
    // Importar html2pdf dinámicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Crear el contenido HTML del PDF
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
    
    try {
      // Generar el PDF como blob para compartir
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
          text: `🏥 CAFF CONSULTAS MÉDICAS\n\nConsulta médica de ${consulta.nombre}\n\n📋 Información:\n• Adolescente: ${consulta.nombre}\n• Cédula: ${consulta.cedula}\n• Estudio: ${consulta.estudio}\n• Educador/a: ${consulta.educador}\n• Estado: ${consulta.estado}\n\n📅 Fecha Consulta: ${format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}\n⏰ Fecha Control: ${format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}\n\n📱 Compartido desde CAFF Consultas Médicas`,
          files: [pdfFile]
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
        
        // Limpiar el URL
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      }
      
    } catch (error) {
      console.error('Error generando PDF para compartir:', error);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Calendario de Consultas
        </CardTitle>
          <Button
            onClick={onAddConsulta}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendario */}
            <div className="lg:col-span-2">
              <Calendar
                mode="single"
                selected={selectedDay}
                onSelect={setSelectedDay}
                className="rounded-md border bg-white"
                components={{
                  DayContent: ({ date: dayDate }) => (
                    <div className="relative w-full h-full">
                      <div 
                    className="w-full h-full cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDay(dayDate);
                    }}
                  >
                    {renderDayContent(dayDate)}
                  </div>
                    </div>
                  ),
                }}
                locale={es}
              />
            </div>

            {/* Consultas del día seleccionado */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">
                {selectedDay ? format(selectedDay, 'EEEE, d MMMM yyyy', { locale: es }) : 'Selecciona una fecha'}
              </h3>
              
              {!selectedDay ? (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Toca un día en el calendario para ver las consultas</p>
                </div>
              ) : consultasDelDiaSeleccionado.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay consultas programadas para este día.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded-md">
                    💡 Toca una consulta para ver los detalles
                  </p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {consultasDelDiaSeleccionado.map((consulta) => (
                    <div
                      key={consulta.id}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                        'bg-white border-l-4',
                        consulta.estado === 'Agendada' && 'border-l-blue-500',
                        consulta.estado === 'Pendiente' && 'border-l-yellow-500',
                        consulta.estado === 'Completa' && 'border-l-green-500'
                      )}
                      onClick={() => handleConsultaClick(consulta)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{consulta.nombre}</h4>
                          <p className="text-sm text-gray-600">{consulta.estudio}</p>
                          <p className="text-xs text-gray-500">{consulta.educador}</p>
                        </div>
                        <div className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium text-white',
                          getStatusColor(consulta.estado)
                        )}>
                          {consulta.estado}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalles de consulta */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 shadow-lg">
          <DialogHeader className="bg-gradient-to-r from-slate-100 to-gray-100 text-gray-800 rounded-t-lg -mt-6 -mx-6 px-6 py-3 mb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarDays className="h-5 w-5 text-blue-600" />
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
                    <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
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
                    onEditConsulta(selectedConsulta);
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
                    handleSharePDF(selectedConsulta);
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
                
                {onDeleteConsulta && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de que quieres eliminar esta consulta? Esta acción no se puede deshacer.')) {
                        onDeleteConsulta(selectedConsulta.id);
                        setIsDetailOpen(false);
                      }
                    }}
                    className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 