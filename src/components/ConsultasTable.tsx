
'use client';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import { ExpandableText } from './ExpandableText';
import { cn } from '@/lib/utils';

type ConsultasTableProps = {
  consultas: Consulta[];
  onEdit: (consulta: Consulta) => void;
  onDelete: (id: string) => void;
};

export function ConsultasTable({ consultas, onEdit, onDelete }: ConsultasTableProps) {
  if (consultas.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-xs">
        No se encontraron consultas para mostrar en la tabla.
      </div>
    );
  }

  const handleShare = (consulta: Consulta) => {
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

  const rowColorClass: { [key in Consulta['estado']]?: string } = {
    'Agendada': 'bg-blue-500/10 hover:bg-blue-500/20',
    'Pendiente': 'bg-yellow-500/10 hover:bg-yellow-500/20',
    'Completa': 'bg-green-500/10 hover:bg-green-500/20',
  };

  return (
    <div className="w-full overflow-x-auto">
        <Table className="w-full">
        <TableHeader>
            <TableRow>
            <TableHead className="text-xs">Paciente</TableHead>
            <TableHead className="text-xs hidden lg:table-cell">Estudio</TableHead>
            <TableHead className="text-xs hidden lg:table-cell">Educador/a</TableHead>
            <TableHead className="text-xs">F. Consulta</TableHead>
            <TableHead className="text-xs hidden lg:table-cell">F. Control</TableHead>
            <TableHead className="text-xs hidden lg:table-cell">Observaciones</TableHead>
            <TableHead className="text-xs">Estado</TableHead>
            <TableHead className="text-right text-xs print-hidden hidden lg:table-cell">Acciones</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {consultas.map((consulta) => (
            <TableRow key={consulta.id} className={cn("text-xs", rowColorClass[consulta.estado] || '')}>
                <TableCell>
                    <div className="font-medium">{consulta.nombre}</div>
                    <div className="text-muted-foreground lg:hidden">{consulta.cedula}</div>
                    <div className="text-muted-foreground hidden lg:block">{consulta.cedula}</div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{consulta.estudio}</TableCell>
                <TableCell className="hidden lg:table-cell">{consulta.educador}</TableCell>
                <TableCell>{format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="hidden lg:table-cell">{format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="hidden lg:table-cell">
                    <ExpandableText text={consulta.observaciones} maxLength={30} />
                </TableCell>
                <TableCell>
                    <StatusBadge status={consulta.estado} />
                </TableCell>
                <TableCell className="text-right print-hidden hidden lg:table-cell">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(consulta)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(consulta)} className="flex gap-2">
                            Compartir
                            <Share2 className="h-3 w-3" />
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(consulta.id)} className="text-destructive">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}
