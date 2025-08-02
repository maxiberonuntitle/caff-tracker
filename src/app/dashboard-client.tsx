
'use client';

import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { ClipboardList, CheckCircle, Clock, CalendarCheck } from 'lucide-react';
import type { Consulta, ConsultaStatus } from '@/lib/types';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';
import { subMonths, format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

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

type DashboardClientProps = {
    initialConsultas: Consulta[];
}

export function DashboardClient({ initialConsultas }: DashboardClientProps) {
  
  const consultas = initialConsultas;

  const totalConsultas = consultas.length;
  const pendingConsultas = consultas.filter(v => v.estado === 'Pendiente').length;
  const completedConsultas = consultas.filter(v => v.estado === 'Completa').length;
  const scheduledConsultas = consultas.filter(v => v.estado === 'Agendada').length;

  const allChartData = useMemo(() => generateChartData(consultas), [consultas]);
  const pendingChartData = useMemo(() => generateChartData(consultas, 'Pendiente'), [consultas]);
  const completedChartData = useMemo(() => generateChartData(consultas, 'Completa'), [consultas]);
  const scheduledChartData = useMemo(() => generateChartData(consultas, 'Agendada'), [consultas]);

  return (
    <>
      <PageHeader title="Resumen de Consultas" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="w-full bg-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">Total de Consultas</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{totalConsultas}</div>
            <Sparkline data={allChartData} color="hsl(var(--primary))" />
          </CardContent>
        </Card>
        <Card className="w-full bg-yellow-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{pendingConsultas}</div>
            <Sparkline data={pendingChartData} color="hsl(var(--chart-4))" />
          </CardContent>
        </Card>
        <Card className="w-full bg-green-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Completas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{completedConsultas}</div>
            <Sparkline data={completedChartData} color="hsl(var(--chart-2))" />
          </CardContent>
        </Card>
        <Card className="w-full bg-blue-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Agendadas</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{scheduledConsultas}</div>
            <Sparkline data={scheduledChartData} color="hsl(var(--chart-1))" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
