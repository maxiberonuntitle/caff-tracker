'use client';
import type { Consulta } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Share2 } from 'lucide-react';
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
  
  const handleShare = () => {
    const details = [
      `*Resumen de Consulta Médica*`,
      `*Paciente:* ${consulta.nombre}`,
      `*Cédula:* ${consulta.cedula}`,
      `*Estudio:* ${consulta.estudio}`,
      `*Educador:* ${consulta.educador}`,
      `*Fecha Consulta:* ${format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}`,
      `*Fecha Control:* ${format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}`,
      `*Estado:* ${consulta.estado}`,
      consulta.observaciones ? `*Observaciones:* ${consulta.observaciones}` : null
    ].filter(Boolean).join('\n');
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(details)}`;
    window.open(whatsappUrl, '_blank');
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
        <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={handleShare}>
          <Share2 className="mr-2 h-3 w-3" />
          Compartir
        </Button>
      </CardFooter>
    </Card>
  );
}
