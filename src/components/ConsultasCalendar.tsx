'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, CalendarDays } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Consulta } from '@/lib/types';
import { cn } from '@/lib/utils';

type ConsultasCalendarProps = {
  consultas: Consulta[];
  onAddConsulta: () => void;
  onEditConsulta: (consulta: Consulta) => void;
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

export function ConsultasCalendar({ consultas, onAddConsulta, onEditConsulta }: ConsultasCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

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

    return (
      <div className="relative w-full h-full">
        {/* Número del día siempre visible */}
        <div className="absolute top-1 left-1 text-xs font-medium text-gray-900 z-10">
          {format(day, 'd')}
        </div>
        
        {/* Indicadores de consultas */}
        {consultasDelDia.length > 0 && (
          <div className="absolute bottom-1 left-1 right-1">
            <div className="flex flex-col gap-0.5">
              {consultasDelDia.slice(0, 2).map((consulta, index) => (
                <div
                  key={consulta.id}
                  className={cn(
                    'h-1.5 rounded-full opacity-80 cursor-pointer hover:opacity-100 transition-opacity',
                    getStatusColor(consulta.estado)
                  )}
                  title={`${consulta.nombre} - ${consulta.estado}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditConsulta(consulta);
                  }}
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
  const consultasDelDiaSeleccionado = date 
    ? consultasPorFecha[format(date, 'yyyy-MM-dd')] || []
    : [];

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
                selected={date}
                onSelect={setDate}
                className="rounded-md border bg-white"
                components={{
                  DayContent: ({ date: dayDate }) => (
                    <div className="relative w-full h-full">
                      {renderDayContent(dayDate)}
                    </div>
                  ),
                }}
                locale={es}
              />
            </div>

            {/* Consultas del día seleccionado */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">
                {date ? format(date, 'EEEE, d MMMM yyyy', { locale: es }) : 'Selecciona una fecha'}
              </h3>
              
              {consultasDelDiaSeleccionado.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay consultas programadas para este día.</p>
              ) : (
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
                      onClick={() => onEditConsulta(consulta)}
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
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 