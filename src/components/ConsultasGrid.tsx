'use client';
import type { Consulta } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Share2, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import { ExpandableText } from './ExpandableText';
import { cn } from '@/lib/utils';

type ConsultasGridProps = {
  consultas: Consulta[];
  onEdit: (consulta: Consulta) => void;
  onDelete: (id: string) => void;
};

export function ConsultasGrid({ consultas, onEdit, onDelete }: ConsultasGridProps) {
  if (consultas.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No se encontraron consultas.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
      {consultas.map(consulta => (
        <ConsultaCard key={consulta.id} consulta={consulta} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

function ConsultaCard({ consulta, onEdit, onDelete }: { consulta: Consulta, onEdit: (consulta: Consulta) => void, onDelete: (id: string) => void }) {
  
  const handleShareWhatsApp = async () => {
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
              background: #f9fafb;
              padding: 16px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
              font-size: 13px;
              line-height: 1.6;
              white-space: pre-wrap;
            }
            
            .observations.empty {
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
            
            .status-agendada {
              background: #dbeafe;
              color: #1e40af;
            }
            
            .status-pendiente {
              background: #fef3c7;
              color: #92400e;
            }
            
            .status-completa {
              background: #d1fae5;
              color: #065f46;
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
                  INFORMACIÓN DEL PACIENTE
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
                <p>CAFF Consultas Médicas - Gestión de consultas</p>
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
          text: `🏥 CAFF CONSULTAS MÉDICAS\n\nConsulta médica de ${consulta.nombre}\n\n📋 Información:\n• Paciente: ${consulta.nombre}\n• Cédula: ${consulta.cedula}\n• Estudio: ${consulta.estudio}\n• Educador/a: ${consulta.educador}\n• Estado: ${consulta.estado}\n\n📅 Fecha Consulta: ${format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}\n⏰ Fecha Control: ${format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}\n\n📱 Compartido desde CAFF Consultas Médicas`,
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
        alert(`PDF descargado: ${pdfFile.name}\n\nAhora puedes compartir el archivo desde tu dispositivo.`);
        
        // Limpiar el URL
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      }
      
    } catch (error) {
      console.error('Error generando PDF para WhatsApp:', error);
      // Fallback: compartir solo texto si falla el PDF
      const details = [
        `🏥 CAFF CONSULTAS MÉDICAS`,
        `CONSULTA MÉDICA`,
        `Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
        ``,
        `📋 INFORMACIÓN DEL PACIENTE`,
        `👤 Nombre: ${consulta.nombre}`,
        `🆔 Cédula: ${consulta.cedula}`,
        ``,
        `🔬 DETALLES DE LA CONSULTA`,
        `📊 Estudio: ${consulta.estudio}`,
        `👨‍⚕️ Educador/a: ${consulta.educador}`,
        `📅 Fecha Consulta: ${format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}`,
        `⏰ Fecha Control: ${format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}`,
        `📈 Estado: ${consulta.estado}`,
        consulta.observaciones ? [
          ``,
          `📝 OBSERVACIONES`,
          `${consulta.observaciones}`
        ] : null,
        ``,
        `📱 Compartido desde CAFF Consultas Médicas`,
        `🕐 ${format(new Date(), 'dd/MM/yyyy HH:mm')}`
      ].filter(Boolean).flat().join('\n');
      
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(details)}`;
      window.open(whatsappUrl, '_blank');
    } finally {
      // Limpiar el elemento temporal
      document.body.removeChild(tempDiv);
    }
  };

  const handleSharePDF = async () => {
    // Importar html2pdf dinámicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Crear el contenido HTML del PDF con el mismo formato que el formulario
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
              padding: 20px 30px;
              font-size: 11px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-wrap: wrap;
              gap: 10px;
            }
            
            .footer-left {
              text-align: left;
            }
            
            .footer-center {
              text-align: center;
              flex-grow: 1;
            }
            
            .footer-right {
              text-align: right;
            }
            
            .footer p {
              margin: 0;
              line-height: 1.4;
            }
            
            @media (max-width: 600px) {
              .footer {
                flex-direction: column;
                text-align: center;
                gap: 8px;
              }
              
              .footer-left,
              .footer-center,
              .footer-right {
                text-align: center;
              }
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
              <h1>CAFF CONSULTAS MÉDICAS</h1>
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
                  INFORMACIÓN DEL PACIENTE
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
                <p>CAFF Consultas Médicas - Gestión de consultas</p>
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

  const cardColorClass = {
    'Agendada': 'bg-blue-500/10',
    'Pendiente': 'bg-yellow-500/10',
    'Completa': 'bg-green-500/10',
  }[consulta.estado];

  return (
    <Card className={cn(
        "flex flex-col hover:shadow-lg transition-shadow duration-300",
        cardColorClass
        )}>
      <CardHeader className="flex-row justify-between items-start p-3 pb-1 md:p-3 md:pb-1">
        <div>
          <CardTitle className="text-xs font-semibold">{consulta.nombre}</CardTitle>
          <p className="text-xs text-muted-foreground">{consulta.cedula}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 -mt-1 -mr-1">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onEdit(consulta)}>Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(consulta.id)} className="text-destructive">Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-1.5 flex-grow text-sm p-3 md:p-3 pt-1">
        <div className="flex justify-between items-center">
           <span className="font-medium text-xs">{consulta.estudio}</span>
           <StatusBadge status={consulta.estado} />
        </div>
        <div className="text-muted-foreground text-xs space-y-0.5">
          <p><strong>Educador/a:</strong> {consulta.educador}</p>
          <p><strong>F. Consulta:</strong> {format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}</p>
          <p><strong>F. Control:</strong> {format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}</p>
        </div>
        {consulta.observaciones && (
             <div className="text-xs pt-1">
                <strong className="block mb-0.5 text-xs">Observaciones:</strong>
                <ExpandableText text={consulta.observaciones} maxLength={40} />
            </div>
        )}
      </CardContent>
       <CardFooter className="p-3 md:p-3 pt-2">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-8 text-xs bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400" 
            onClick={handleShareWhatsApp}
            title="Compartir global"
          >
            <Share2 className="mr-1 h-3 w-3" />
            Compartir
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-8 text-xs bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400" 
            onClick={handleSharePDF}
            title="Descargar PDF"
          >
            <FileText className="mr-1 h-3 w-3" />
            <Download className="mr-1 h-3 w-3" />
            PDF
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
