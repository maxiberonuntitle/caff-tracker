'use client';

import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CalendarDays, 
  AlertTriangle, 
  User, 
  UserCheck, 
  Shield,
  CheckCircle,
  Edit,
  Trash2,
  Share2,
  Download
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { SNA } from '@/lib/types';

type SNACalendarProps = {
  snas: SNA[];
  onEdit?: (sna: SNA) => void;
  onDelete?: (id: string) => void;
  onSharePDF?: (sna: SNA) => void;
  onDownloadPDF?: (sna: SNA) => void;
};

const getStatusColor = (estado: string) => {
  switch (estado) {
    case 'Abierta':
      return 'bg-yellow-500';
    case 'Cerrada':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export function SNACalendar({ 
  snas, 
  onEdit, 
  onDelete, 
  onSharePDF, 
  onDownloadPDF 
}: SNACalendarProps) {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [selectedSNA, setSelectedSNA] = useState<SNA | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Agrupar SNAs por fecha
  const snasPorFecha = useMemo(() => {
    return snas.reduce((acc, sna) => {
      const fecha = format(new Date(sna.fechaDenuncia), 'yyyy-MM-dd');
      if (!acc[fecha]) {
        acc[fecha] = [];
      }
      acc[fecha].push(sna);
      return acc;
    }, {} as Record<string, SNA[]>);
  }, [snas]);

  // Función para renderizar el contenido de cada día
  const renderDayContent = (day: Date) => {
    const fechaStr = format(day, 'yyyy-MM-dd');
    const snasDelDia = snasPorFecha[fechaStr] || [];
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
        
        {/* Indicadores de SNAs (solo líneas de color) */}
        {snasDelDia.length > 0 && (
          <div className="absolute bottom-1 left-1 right-1">
            <div className="flex flex-col gap-0.5">
              {snasDelDia.slice(0, 3).map((sna) => (
                <div
                  key={sna.id}
                  className={cn(
                    'h-1.5 rounded-full opacity-80',
                    getStatusColor(sna.estado)
                  )}
                  title={`${sna.nombreAdolescente} - ${sna.estado}`}
                />
              ))}
              {snasDelDia.length > 3 && (
                <div className="h-1.5 rounded-full bg-gray-400 opacity-60 text-[6px] text-white flex items-center justify-center">
                  +{snasDelDia.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Obtener SNAs del día seleccionado
  const snasDelDiaSeleccionado = selectedDay 
    ? snasPorFecha[format(selectedDay, 'yyyy-MM-dd')] || []
    : [];

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

  if (snas.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
          <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-muted-foreground mb-2">
            No hay SNAs registradas
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            No se encontraron Salidas No Acordadas con los filtros aplicados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
            Calendario de SNAs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
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
                        onClick={() => setSelectedDay(dayDate)}
                      >
                        {renderDayContent(dayDate)}
                      </div>
                    </div>
                  ),
                }}
                locale={es}
              />
            </div>

            {/* SNAs del día seleccionado */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-gray-700 text-sm sm:text-base">
                {selectedDay ? format(selectedDay, 'EEEE, d MMMM yyyy', { locale: es }) : 'Selecciona una fecha'}
              </h3>
              
              {!selectedDay ? (
                <div className="text-center py-6 sm:py-8">
                  <CalendarDays className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                  <p className="text-gray-500 text-xs sm:text-sm">Toca un día en el calendario para ver las SNAs</p>
                </div>
              ) : snasDelDiaSeleccionado.length === 0 ? (
                <p className="text-gray-500 text-xs sm:text-sm">No hay SNAs registradas para este día.</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded-md">
                    💡 Toca una SNA para ver sus detalles
                  </p>
                  <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
                    {snasDelDiaSeleccionado.map((sna) => (
                      <div
                        key={sna.id}
                        className={cn(
                          'p-2 sm:p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                          'bg-white border-l-4',
                          sna.estado === 'Abierta' && 'border-l-yellow-500',
                          sna.estado === 'Cerrada' && 'border-l-green-500'
                        )}
                        onClick={() => {
                          setSelectedSNA(sna);
                          setIsDetailOpen(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">{sna.nombreAdolescente}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">N° {sna.numeroDenuncia}</p>
                            <p className="text-xs text-gray-500">
                              Constatación de lesiones: {sna.constatacionLesiones ? 'Sí' : 'No'}
                            </p>
                          </div>
                          <div className={cn(
                            'px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium text-white ml-2',
                            getStatusColor(sna.estado)
                          )}>
                            {sna.estado}
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

      {/* Diálogo de detalles */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              Detalles de la SNA
            </DialogTitle>
            <DialogDescription className="text-sm">
              Información completa de la Salida No Acordada
            </DialogDescription>
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
                    <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                    ESTADO Y FECHAS
                  </h4>
                  <div className="space-y-2">
                    <div>{getStatusBadge(selectedSNA.estado)}</div>
                    <div className="text-xs sm:text-sm">
                      <strong>Denuncia:</strong> {format(new Date(selectedSNA.fechaDenuncia), 'dd/MM/yyyy')}
                    </div>
                    {selectedSNA.fechaCierre && (
                      <div className="text-xs sm:text-sm">
                        <strong>Cierre:</strong> {format(new Date(selectedSNA.fechaCierre), 'dd/MM/yyyy')}
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
                  <h4 className="font-semibold text-sm text-muted-foreground">
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
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      onDelete(selectedSNA.id);
                      setIsDetailOpen(false);
                    }}
                    className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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