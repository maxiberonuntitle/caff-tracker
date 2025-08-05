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
                
                {onSharePDF && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onSharePDF(selectedConsulta);
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
                      onDownloadPDF(selectedConsulta);
                      setIsDetailOpen(false);
                    }}
                    className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Descargar PDF</span>
                  </Button>
                )}
                
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