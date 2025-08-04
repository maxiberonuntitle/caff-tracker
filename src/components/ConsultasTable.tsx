
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Share2, ChevronUp, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
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
};

export function ConsultasTable({ consultas, onEdit, onDelete }: ConsultasTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

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
  if (consultas.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-xs">
        No se encontraron consultas para mostrar en la tabla.
      </div>
    );
  }

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
                Paciente
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
                "cursor-pointer hover:bg-gray-50 transition-colors lg:cursor-default lg:hover:bg-transparent"
              )}
              onClick={() => onEdit(consulta)}
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
