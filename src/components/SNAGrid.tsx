'use client';
import type { SNA } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Share2, FileText, Download, AlertTriangle, User, Calendar, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import { ExpandableText } from './ExpandableText';
import { cn } from '@/lib/utils';

type SNAGridProps = {
  snas: SNA[];
  onEdit: (sna: SNA) => void;
  onDelete: (id: string) => void;
  onSharePDF: (sna: SNA) => void;
  onDownloadPDF: (sna: SNA) => void;
};

export function SNAGrid({ snas, onEdit, onDelete, onSharePDF, onDownloadPDF }: SNAGridProps) {
  if (snas.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-muted-foreground">
        <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
        <p className="text-sm sm:text-base">No se encontraron SNAs.</p>
        <p className="text-xs sm:text-sm">Crea una nueva SNA para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 p-2 sm:p-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {snas.map(sna => (
                <SNACard
          key={sna.id} 
          sna={sna} 
          onEdit={onEdit} 
          onDelete={onDelete}
          onSharePDF={onSharePDF}
          onDownloadPDF={onDownloadPDF}
        />
      ))}
    </div>
  );
}

function SNACard({ 
  sna, 
  onEdit, 
  onDelete, 
  onSharePDF, 
  onDownloadPDF 
}: { 
  sna: SNA, 
  onEdit: (sna: SNA) => void, 
  onDelete: (id: string) => void,
  onSharePDF: (sna: SNA) => void,
  onDownloadPDF: (sna: SNA) => void
}) {
  
  const cardColorClass = {
    'Abierta': 'bg-yellow-500/10 border-yellow-200',
    'Cerrada': 'bg-green-500/10 border-green-200',
  }[sna.estado];

  const statusColorClass = {
    'Abierta': 'text-yellow-700',
    'Cerrada': 'text-green-700',
  }[sna.estado];

  return (
    <Card className={cn(
        "flex flex-col hover:shadow-lg transition-shadow duration-300 border-2",
        cardColorClass
        )}>
      <CardHeader className="flex-row justify-between items-start p-2 sm:p-3 pb-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
            <CardTitle className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
              SNA #{sna.numeroDenuncia}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
            <User className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
            <span className="truncate">{sna.nombreAdolescente}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 -mt-1 -mr-1">
              <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onEdit(sna)}>Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(sna.id)} className="text-destructive">Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="space-y-2 flex-grow text-xs sm:text-sm p-2 sm:p-3 pt-1">
        <div className="flex justify-between items-center">
          <span className="font-medium text-xs text-gray-700">Estado</span>
          <StatusBadge status={sna.estado} />
        </div>
        
        <div className="text-muted-foreground text-xs space-y-1">
          <div className="flex items-center gap-1 sm:gap-2">
            <Calendar className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
            <span className="truncate"><strong>F. Denuncia:</strong> {format(new Date(sna.fechaDenuncia), 'dd/MM/yyyy')}</span>
          </div>
          
          {sna.fechaCierre && (
            <div className="flex items-center gap-1 sm:gap-2">
              <Calendar className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
              <span className="truncate"><strong>F. Cierre:</strong> {format(new Date(sna.fechaCierre), 'dd/MM/yyyy')}</span>
            </div>
          )}
          
          {sna.retira && (
            <div className="flex items-center gap-1 sm:gap-2">
              <UserCheck className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
              <span className="truncate"><strong>Retira:</strong> {sna.retira}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 sm:gap-2">
            <span className={cn("text-xs font-medium px-1 sm:px-2 py-0.5 sm:py-1 rounded-full truncate", {
              'bg-red-100 text-red-700': sna.constatacionLesiones,
              'bg-gray-100 text-gray-700': !sna.constatacionLesiones
            })}>
              Constatación de lesiones: {sna.constatacionLesiones ? 'Sí' : 'No'}
            </span>
          </div>
        </div>
        
        {sna.comentarios && (
          <div className="text-xs pt-2 border-t border-gray-100">
            <strong className="block mb-1 text-xs text-gray-700">Comentarios:</strong>
            <ExpandableText text={sna.comentarios} maxLength={50} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-2 sm:p-3 pt-1">
        <div className="flex gap-1 sm:gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-7 sm:h-8 text-xs bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400" 
            onClick={() => onSharePDF(sna)}
            title="Compartir PDF"
          >
            <Share2 className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">Compartir</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-7 sm:h-8 text-xs bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400" 
            onClick={() => onDownloadPDF(sna)}
            title="Descargar PDF"
          >
            <FileText className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
            <Download className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 