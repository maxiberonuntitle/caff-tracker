
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Area, AreaChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { ClipboardList, CheckCircle, Clock, CalendarCheck, TrendingUp, Users, Calendar, Activity, Database, AlertCircle, FileCheck, CalendarDays } from 'lucide-react';
import type { Consulta, ConsultaStatus } from '@/lib/types';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { es } from 'date-fns/locale';

function generateChartData(consultas: Consulta[], filterStatus?: ConsultaStatus) {
  const data = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
          date: format(date, 'MMM yyyy'),
          value: 0,
      };
  });

  consultas.forEach(consulta => {
      if (!filterStatus || consulta.estado === filterStatus) {
          const consultaDate = new Date(consulta.fechaConsulta);
          const monthIndex = data.findIndex(d => {
              const dDate = new Date(d.date);
              return dDate.getMonth() === consultaDate.getMonth() && dDate.getFullYear() === consultaDate.getFullYear();
          });
          if (monthIndex !== -1) {
              data[monthIndex].value++;
          }
      }
  });
  return data;
};

function generateMonthlyData(consultas: Consulta[]) {
  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);
  
  const currentMonthConsultas = consultas.filter(consulta => {
    const consultaDate = new Date(consulta.fechaConsulta);
    return isWithinInterval(consultaDate, {
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    });
  }).length;
  
  const lastMonthConsultas = consultas.filter(consulta => {
    const consultaDate = new Date(consulta.fechaConsulta);
    return isWithinInterval(consultaDate, {
      start: startOfMonth(lastMonth),
      end: endOfMonth(lastMonth)
    });
  }).length;
  
  return {
    current: currentMonthConsultas,
    last: lastMonthConsultas,
    change: lastMonthConsultas > 0 ? ((currentMonthConsultas - lastMonthConsultas) / lastMonthConsultas * 100) : 0
  };
}

// Función para obtener consultas del mes actual
function getCurrentMonthConsultas(consultas: Consulta[]) {
  const currentMonth = new Date();
  return consultas.filter(consulta => {
    const consultaDate = new Date(consulta.fechaConsulta);
    return isWithinInterval(consultaDate, {
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    });
  });
}

const Sparkline = ({ data, color }: { data: {date: string, value: number}[], color: string }) => (
  <ChartContainer config={{
      value: {
          label: "Consultas",
          color: color,
      },
  }} className="h-8 w-full">
       <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
               <defs>
                  <linearGradient id={`color-${color}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
              </defs>
              <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent 
                      indicator="dot" 
                      labelKey="date"
                      hideLabel
                  />}
              />
              <Area dataKey="value" type="monotone" stroke={color} fillOpacity={1} fill={`url(#color-${color})`} strokeWidth={2} />
          </AreaChart>
      </ResponsiveContainer>
  </ChartContainer>
);

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  subtitle,
  onClick
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: number;
  subtitle?: string;
  onClick?: () => void;
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
          text: 'text-blue-600',
          border: 'border-blue-200/50',
          gradient: 'from-blue-50/50 to-blue-100/30'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-500/10 group-hover:bg-yellow-500/20',
          text: 'text-yellow-600',
          border: 'border-yellow-200/50',
          gradient: 'from-yellow-50/50 to-yellow-100/30'
        };
      case 'green':
        return {
          bg: 'bg-green-500/10 group-hover:bg-green-500/20',
          text: 'text-green-600',
          border: 'border-green-200/50',
          gradient: 'from-green-50/50 to-green-100/30'
        };
      case 'purple':
        return {
          bg: 'bg-purple-500/10 group-hover:bg-purple-500/20',
          text: 'text-purple-600',
          border: 'border-purple-200/50',
          gradient: 'from-purple-50/50 to-purple-100/30'
        };
      default:
        return {
          bg: 'bg-gray-500/10 group-hover:bg-gray-500/20',
          text: 'text-gray-600',
          border: 'border-gray-200/50',
          gradient: 'from-gray-50/50 to-gray-100/30'
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <Card 
      className={cn(
        "w-full bg-gradient-to-br backdrop-blur-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group",
        colorClasses.gradient,
        colorClasses.border,
        onClick && "cursor-pointer hover:from-white/95 hover:to-white/80"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-4">
        <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg transition-colors", colorClasses.bg)}>
          <Icon className={cn("h-5 w-5", colorClasses.text)} />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex items-end justify-between mb-3">
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          {trend !== undefined && (
            <Badge variant={trend >= 0 ? "default" : "secondary"} className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-600 mb-3">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
};

type DashboardClientProps = {
    initialConsultas: Consulta[];
}

export function DashboardClient({ initialConsultas }: DashboardClientProps) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const consultas = initialConsultas;

  const totalConsultas = consultas.length;
  const pendingConsultas = consultas.filter(v => v.estado === 'Pendiente').length;
  const completedConsultas = consultas.filter(v => v.estado === 'Completa').length;
  const scheduledConsultas = consultas.filter(v => v.estado === 'Agendada').length;

  // Cálculos adicionales
  const completionRate = totalConsultas > 0 ? (completedConsultas / totalConsultas * 100) : 0;
  const pendingRate = totalConsultas > 0 ? (pendingConsultas / totalConsultas * 100) : 0;
  const monthlyData = generateMonthlyData(consultas);

  const allChartData = useMemo(() => generateChartData(consultas), [consultas]);
  const pendingChartData = useMemo(() => generateChartData(consultas, 'Pendiente'), [consultas]);
  const completedChartData = useMemo(() => generateChartData(consultas, 'Completa'), [consultas]);
  const scheduledChartData = useMemo(() => generateChartData(consultas, 'Agendada'), [consultas]);

  // Consultas del mes actual
  const currentMonthConsultas = useMemo(() => getCurrentMonthConsultas(consultas), [consultas]);
  
  // Obtener consultas del día seleccionado
  const consultasDelDiaSeleccionado = useMemo(() => {
    if (!selectedDay) return [];
    return currentMonthConsultas.filter(consulta => 
      format(new Date(consulta.fechaConsulta), 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd')
    );
  }, [selectedDay, currentMonthConsultas]);

  // Funciones de navegación
  const navigateToConsultas = (statusFilter: string) => {
    router.push(`/consultas?status=${statusFilter}`);
  };

  const navigateToAllConsultas = () => {
    router.push('/consultas');
  };

  const handleAddConsulta = () => {
    router.push('/consultas');
  };

  const handleEditConsulta = (consulta: Consulta) => {
    console.log('Dashboard: Editing consulta:', consulta);
    router.push(`/consultas?edit=${consulta.id}`);
  };

  const handleDeleteConsulta = (id: string) => {
    // En el dashboard, redirigir a consultas para eliminar
    router.push('/consultas');
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="text-center mb-8 pt-4 md:pt-0">
        <h1 className="text-2xl md:text-2xl lg:text-2xl font-bold tracking-tight font-headline text-gray-900 mb-2">
          Dashboard
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto mt-4 rounded-full"></div>
      </div>
      
      {/* Métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          title="Total de Casos"
          value={totalConsultas}
          icon={Database}
          color="blue"
          subtitle={`${totalConsultas} casos atendidos`}
          onClick={navigateToAllConsultas}
        />
        
        <StatCard
          title="Casos Pendientes"
          value={pendingConsultas}
          icon={AlertCircle}
          color="yellow"
          subtitle={`${pendingRate.toFixed(1)}% requieren seguimiento`}
          onClick={() => navigateToConsultas('Pendiente')}
        />
        
        <StatCard
          title="Casos Completados"
          value={completedConsultas}
          icon={FileCheck}
          color="green"
          subtitle={`${completionRate.toFixed(1)}% de efectividad`}
          onClick={() => navigateToConsultas('Completa')}
        />
        
        <StatCard
          title="Citas Agendadas"
          value={scheduledConsultas}
          icon={CalendarDays}
          color="purple"
          subtitle="Próximas sesiones"
          onClick={() => navigateToConsultas('Agendada')}
        />
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-green-500/20 rounded-xl shadow-sm">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              <div>
                <p className="text-sm font-semibold text-green-800 uppercase tracking-wide">Tasa de Resolución</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-700">{completionRate.toFixed(1)}%</p>
                <p className="text-xs text-green-600 mt-1">Casos completados exitosamente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-yellow-500/20 rounded-xl shadow-sm">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
              <div>
                <p className="text-sm font-semibold text-yellow-800 uppercase tracking-wide">Casos Activos</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-700">{pendingConsultas + scheduledConsultas}</p>
                <p className="text-xs text-yellow-600 mt-1">Requieren seguimiento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-xl shadow-sm">
                  <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              <div>
                <p className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Atenciones del Mes</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-700">{monthlyData.current}</p>
                <p className="text-xs text-blue-600 mt-1">Evaluaciones realizadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendario del mes actual */}
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-100/30 shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg font-semibold text-gray-900 text-center flex items-center justify-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Calendario de Atenciones del Mes
        </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendario */}
            <div className="lg:col-span-2">
              <CalendarComponent
                mode="single"
                selected={selectedDay}
                onSelect={setSelectedDay}
                className="rounded-md border bg-white"
                locale={es}
                components={{
                  DayContent: ({ date: dayDate }) => {
                    const fechaStr = format(dayDate, 'yyyy-MM-dd');
                    const consultasDelDia = currentMonthConsultas.filter(consulta => 
                      format(new Date(consulta.fechaConsulta), 'yyyy-MM-dd') === fechaStr
                    );
                    const isSelected = selectedDay && format(dayDate, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd');

                    return (
                      <div className="relative w-full h-full">
                        <div 
                          className="w-full h-full cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDay(dayDate);
                          }}
                        >
                          <div className="relative w-full h-full min-h-[40px] p-1">
                            {/* Número del día */}
                            <div className={cn(
                              "text-sm font-medium mb-1",
                              isSelected ? "text-white" : "text-gray-900"
                            )}>
                              {format(dayDate, 'd')}
                            </div>
                            
                            {/* Indicadores de consultas (solo visuales, no clickeables) */}
                            {consultasDelDia.length > 0 && (
                              <div className="space-y-1">
                                {consultasDelDia.slice(0, 3).map((consulta, index) => (
                                  <div
                                    key={consulta.id}
                                    className={cn(
                                      'h-1.5 rounded-full opacity-80 transition-opacity',
                                      consulta.estado === 'Agendada' && 'bg-blue-500',
                                      consulta.estado === 'Pendiente' && 'bg-yellow-500',
                                      consulta.estado === 'Completa' && 'bg-green-500'
                                    )}
                                    title={`${consulta.nombre} - ${consulta.estado}`}
                                  />
                                ))}
                                {consultasDelDia.length > 3 && (
                                  <div className="h-1.5 rounded-full bg-gray-400 opacity-60 text-[6px] text-white flex items-center justify-center">
                                    +{consultasDelDia.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  },
                }}
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
                    💡 Toca una consulta para editarla
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
                        onClick={() => handleEditConsulta(consulta)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{consulta.nombre}</h4>
                            <p className="text-sm text-gray-600">{consulta.estudio}</p>
                            <p className="text-xs text-gray-500">{consulta.educador}</p>
                          </div>
                          <div className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium text-white',
                            consulta.estado === 'Agendada' && 'bg-blue-500',
                            consulta.estado === 'Pendiente' && 'bg-yellow-500',
                            consulta.estado === 'Completa' && 'bg-green-500'
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

      {/* Tabla de consultas del mes actual */}
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-100/30 shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg font-semibold text-gray-900 text-center flex items-center justify-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Casos del Mes Actual
        </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {currentMonthConsultas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay casos este mes</p>
              <p className="text-sm">Los casos aparecerán aquí cuando se registren</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Paciente</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Cédula</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Estudio</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Educador/a</TableHead>
                    <TableHead className="text-xs">F. Consulta</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">F. Control</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMonthConsultas.map((consulta) => (
                    <TableRow 
                      key={consulta.id} 
                      className="text-xs cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleEditConsulta(consulta)}
                    >
                      <TableCell className="font-medium">{consulta.nombre}</TableCell>
                      <TableCell className="hidden md:table-cell">{consulta.cedula}</TableCell>
                      <TableCell className="hidden lg:table-cell">{consulta.estudio}</TableCell>
                      <TableCell className="hidden lg:table-cell">{consulta.educador}</TableCell>
                      <TableCell>{format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="hidden lg:table-cell">{format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            consulta.estado === 'Agendada' ? 'default' :
                            consulta.estado === 'Pendiente' ? 'secondary' :
                            'outline'
                          }
                          className={
                            consulta.estado === 'Agendada' ? 'bg-blue-100 text-blue-800' :
                            consulta.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }
                        >
                          {consulta.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

