'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Share2, 
  Download, 
  User, 
  Calendar, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  UserCheck,
  Shield,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import type { SNA } from '@/lib/types';
import { cn } from '@/lib/utils';

type SortConfig = {
  key: keyof SNA | null;
  direction: 'asc' | 'desc';
};

type SNATableProps = {
  snas: SNA[];
  onEdit?: (sna: SNA) => void;
  onDelete?: (id: string) => void;
  onSharePDF?: (sna: SNA) => void;
  onDownloadPDF?: (sna: SNA) => void;
};

export function SNATable({ 
  snas, 
  onEdit, 
  onDelete, 
  onSharePDF, 
  onDownloadPDF 
}: SNATableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  const sortedSNAs = useMemo(() => {
    if (!sortConfig.key) return snas;

    return [...snas].sort((a, b) => {
      let aValue: any = a[sortConfig.key!];
      let bValue: any = b[sortConfig.key!];

      // Convertir fechas para comparación
      if (sortConfig.key === 'fechaDenuncia' || sortConfig.key === 'fechaCierre') {
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
  }, [snas, sortConfig]);

  const handleSort = (key: keyof SNA) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof SNA) => {
    if (sortConfig.key !== key) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Abierta':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            Abierta
          </Badge>
        );
      case 'Cerrada':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Cerrada
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {estado}
          </Badge>
        );
    }
  };

  const getLesionesBadge = (constatacionLesiones: boolean) => {
    return constatacionLesiones ? (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        <Shield className="w-3 h-3 mr-1" />
        Sí
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        No
      </Badge>
    );
  };

  const rowColorClass: { [key in SNA['estado']]?: string } = {
    'Abierta': 'bg-yellow-500/10 hover:bg-yellow-500/20',
    'Cerrada': 'bg-green-500/10 hover:bg-green-500/20',
  };

  if (snas.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-xs">
        No se encontraron SNAs para mostrar en la tabla.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto" id="snas-table-section">
      <Table className="w-full print:w-full print:overflow-visible print:table">
        <TableHeader>
          <TableRow>
            <TableHead 
              className="text-xs print:text-[10px] cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => handleSort('nombreAdolescente')}
            >
              <div className="flex items-center gap-1">
                Adolescente
                {getSortIcon('nombreAdolescente')}
              </div>
            </TableHead>
            <TableHead 
              className="text-xs print:text-[10px] hidden md:table-cell print:table-cell cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => handleSort('numeroDenuncia')}
            >
              <div className="flex items-center gap-1">
                N° Denuncia
                {getSortIcon('numeroDenuncia')}
              </div>
            </TableHead>
            <TableHead 
              className="text-xs print:text-[10px] cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => handleSort('fechaDenuncia')}
            >
              <div className="flex items-center gap-1">
                F. Denuncia
                {getSortIcon('fechaDenuncia')}
              </div>
            </TableHead>
            <TableHead 
              className="text-xs print:text-[10px] hidden lg:table-cell print:table-cell cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => handleSort('fechaCierre')}
            >
              <div className="flex items-center gap-1">
                F. Cierre
                {getSortIcon('fechaCierre')}
              </div>
            </TableHead>
            <TableHead 
              className="text-xs print:text-[10px] hidden lg:table-cell print:table-cell cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => handleSort('retira')}
            >
              <div className="flex items-center gap-1">
                Retira
                {getSortIcon('retira')}
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
            <TableHead 
              className="text-xs print:text-[10px] cursor-pointer hover:bg-gray-50 select-none"
            >
              <div className="flex items-center gap-1">
                Lesiones
              </div>
            </TableHead>
            <TableHead className="text-right text-xs print-hidden hidden lg:table-cell">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSNAs.map((sna) => (
            <TableRow 
              key={sna.id} 
              className={cn(
                "text-xs print:text-[9px]", 
                rowColorClass[sna.estado] || '',
                "cursor-pointer hover:bg-gray-50 transition-colors lg:cursor-default lg:hover:bg-transparent"
              )}
              onClick={() => onEdit?.(sna)}
            >
              <TableCell className="print:py-1">
                <div className="font-medium print:text-[9px]">{sna.nombreAdolescente}</div>
                <div className="text-muted-foreground md:hidden print:text-[8px]">N° {sna.numeroDenuncia}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell print:table-cell print:py-1 print:text-[9px]">{sna.numeroDenuncia}</TableCell>
              <TableCell className="print:py-1 print:text-[9px]">{format(new Date(sna.fechaDenuncia), 'dd/MM/yyyy')}</TableCell>
              <TableCell className="hidden lg:table-cell print:table-cell print:py-1 print:text-[9px]">
                {sna.fechaCierre ? format(new Date(sna.fechaCierre), 'dd/MM/yyyy') : '-'}
              </TableCell>
              <TableCell className="hidden lg:table-cell print:table-cell print:py-1 print:text-[9px]">
                {sna.retira || '-'}
              </TableCell>
              <TableCell className="print:py-1">
                {getStatusBadge(sna.estado)}
              </TableCell>
              <TableCell className="print:py-1">
                {getLesionesBadge(sna.constatacionLesiones)}
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
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(sna)}>Editar</DropdownMenuItem>
                    )}
                    {onSharePDF && (
                      <DropdownMenuItem onClick={() => onSharePDF(sna)} className="flex gap-2">
                        Compartir PDF
                        <Download className="h-3 w-3" />
                      </DropdownMenuItem>
                    )}
                    {onDownloadPDF && (
                      <DropdownMenuItem onClick={() => onDownloadPDF(sna)} className="flex gap-2">
                        Descargar PDF
                        <Download className="h-3 w-3" />
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={() => onDelete(sna.id)} className="text-destructive">
                        Eliminar
                      </DropdownMenuItem>
                    )}
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