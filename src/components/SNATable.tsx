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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  ChevronUp,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
  const [selectedSNA, setSelectedSNA] = useState<SNA | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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

  // Función para abrir detalles de SNA
  const handleSNAClick = (sna: SNA) => {
    setSelectedSNA(sna);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (estado: string) => {
    const colors = {
      'Abierta': 'bg-red-100 text-red-800 border-red-200',
      'Cerrada': 'bg-green-100 text-green-800 border-green-200'
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

  const getLesionesBadge = (constatacionLesiones: boolean) => {
    if (constatacionLesiones) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Sí
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          No
        </Badge>
      );
    }
  };

  if (snas.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-xs">
        No se encontraron SNAs para mostrar en la tabla.
      </div>
    );
  }

  const rowColorClass: { [key in SNA['estado']]?: string } = {
    'Abierta': 'bg-red-500/10 hover:bg-red-500/20',
    'Cerrada': 'bg-green-500/10 hover:bg-green-500/20',
  };

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
                "cursor-pointer hover:bg-gray-50 transition-colors"
              )}
              onClick={() => handleSNAClick(sna)}
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
                    {onEdit && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onEdit(sna);
                      }}>Editar</DropdownMenuItem>
                    )}
                    {onSharePDF && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onSharePDF(sna);
                      }} className="flex gap-2">
                        Compartir PDF
                        <Download className="h-3 w-3" />
                      </DropdownMenuItem>
                    )}
                    {onDownloadPDF && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onDownloadPDF(sna);
                      }} className="flex gap-2">
                        Descargar PDF
                        <Download className="h-3 w-3" />
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onDelete(sna.id);
                      }} className="text-destructive">
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

      {/* Modal de detalles de SNA */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 shadow-lg">
          <DialogHeader className="bg-gradient-to-r from-slate-100 to-gray-100 text-gray-800 rounded-t-lg -mt-6 -mx-6 px-6 py-3 mb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              Detalles de la SNA
            </DialogTitle>
          </DialogHeader>
          
          {selectedSNA && (
            <div className="space-y-4 sm:space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    INFORMACIÓN DEL ADOLESCENTE
                  </h4>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div><strong>Nombre:</strong> {selectedSNA.nombreAdolescente}</div>
                    <div><strong>N° Denuncia:</strong> {selectedSNA.numeroDenuncia}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    ESTADO Y FECHAS
                  </h4>
                  <div className="space-y-2">
                    <div>{getStatusBadge(selectedSNA.estado)}</div>
                    <div className="text-xs sm:text-sm">
                      <strong>Denuncia:</strong> {format(new Date(selectedSNA.fechaDenuncia), 'EEEE, d MMMM yyyy', { locale: es })}
                    </div>
                    {selectedSNA.fechaCierre && (
                      <div className="text-xs sm:text-sm">
                        <strong>Cierre:</strong> {format(new Date(selectedSNA.fechaCierre), 'EEEE, d MMMM yyyy', { locale: es })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Información adicional */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                    CONSTATACIÓN DE LESIONES
                  </h4>
                  <div>{getLesionesBadge(selectedSNA.constatacionLesiones)}</div>
                </div>
                
                {selectedSNA.retira && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                      <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                      RETIRA
                    </h4>
                    <div className="text-xs sm:text-sm">{selectedSNA.retira}</div>
                  </div>
                )}
              </div>
              
              {/* Comentarios */}
              {selectedSNA.comentarios && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    COMENTARIOS
                  </h4>
                  <div className="bg-muted p-2 sm:p-3 rounded-md text-xs sm:text-sm">
                    {selectedSNA.comentarios}
                  </div>
                </div>
              )}
              
              {/* Acciones */}
              <div className="flex flex-wrap gap-2 pt-3 sm:pt-4 border-t">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onEdit(selectedSNA);
                      setIsDetailOpen(false);
                    }}
                    className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                )}
                
                {onSharePDF && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onSharePDF(selectedSNA);
                      setIsDetailOpen(false);
                    }}
                    className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Compartir PDF</span>
                  </Button>
                )}
                
                {onDownloadPDF && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onDownloadPDF(selectedSNA);
                      setIsDetailOpen(false);
                    }}
                    className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Descargar PDF</span>
                  </Button>
                )}
                
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de que quieres eliminar esta SNA? Esta acción no se puede deshacer.')) {
                        onDelete(selectedSNA.id);
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