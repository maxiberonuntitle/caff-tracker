'use client';
import type { Consulta } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Share2, FileText, MessageCircle } from 'lucide-react';
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
  
  const handleShareWhatsApp = () => {
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

  const handleSharePDF = () => {
    // Crear el contenido HTML del PDF con el mismo formato que el formulario
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
            title="Compartir por WhatsApp"
          >
            <MessageCircle className="mr-1 h-3 w-3" />
            WhatsApp
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-8 text-xs bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400" 
            onClick={handleSharePDF}
            title="Generar PDF"
          >
            <FileText className="mr-1 h-3 w-3" />
            PDF
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
