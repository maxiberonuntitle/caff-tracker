'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Area, AreaChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  CalendarCheck, 
  TrendingUp, 
  Users, 
  Calendar, 
  Activity, 
  Database, 
  AlertCircle, 
  FileCheck, 
  CalendarDays, 
  AlertTriangle, 
  Shield,
  Plus, 
  Edit, 
  Share2, 
  Download, 
  X,
  User,
  CreditCard,
  FileText,
  UserCheck,
  Stethoscope,
  Trash2
} from 'lucide-react';
import type { Consulta, ConsultaStatus, SNA } from '@/lib/types';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { addConsulta, deleteConsulta, updateConsulta } from '@/lib/actions';
import { addSNA, deleteSNA, updateSNA } from '@/lib/actions';

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
}

function generateSNAChartData(snas: SNA[], filterStatus?: string) {
  const data = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
          date: format(date, 'MMM yyyy'),
          value: 0,
      };
  });

  snas.forEach(sna => {
      if (!filterStatus || sna.estado === filterStatus) {
          const snaDate = new Date(sna.fechaDenuncia);
          const monthIndex = data.findIndex(d => {
              const dDate = new Date(d.date);
              return dDate.getMonth() === snaDate.getMonth() && dDate.getFullYear() === snaDate.getFullYear();
          });
          if (monthIndex !== -1) {
              data[monthIndex].value++;
          }
      }
  });
  return data;
}

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

function generateSNAMonthlyData(snas: SNA[]) {
  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);
  
  const currentMonthSNAs = snas.filter(sna => {
    const snaDate = new Date(sna.fechaDenuncia);
    return isWithinInterval(snaDate, {
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    });
  }).length;
  
  const lastMonthSNAs = snas.filter(sna => {
    const snaDate = new Date(sna.fechaDenuncia);
    return isWithinInterval(snaDate, {
      start: startOfMonth(lastMonth),
      end: endOfMonth(lastMonth)
    });
  }).length;
  
  return {
    current: currentMonthSNAs,
    last: lastMonthSNAs,
    change: lastMonthSNAs > 0 ? ((currentMonthSNAs - lastMonthSNAs) / lastMonthSNAs * 100) : 0
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

// Función para obtener SNAs del mes actual
function getCurrentMonthSNAs(snas: SNA[]) {
  const currentMonth = new Date();
  return snas.filter(sna => {
    const snaDate = new Date(sna.fechaDenuncia);
    return isWithinInterval(snaDate, {
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
      case 'orange':
        return {
          bg: 'bg-orange-500/10 group-hover:bg-orange-500/20',
          text: 'text-orange-600',
          border: 'border-orange-200/50',
          gradient: 'from-orange-50/50 to-orange-100/30'
        };
      case 'red':
        return {
          bg: 'bg-red-500/10 group-hover:bg-red-500/20',
          text: 'text-red-600',
          border: 'border-red-200/50',
          gradient: 'from-red-50/50 to-red-100/30'
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

const StatCardSNA = ({ 
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
      case 'red':
        return {
          bg: 'bg-red-600',
          text: 'text-white',
          border: 'border-red-600',
          gradient: 'from-red-600 to-red-700',
          iconBg: 'bg-white/20',
          iconColor: 'text-white'
        };
      case 'orange':
        return {
          bg: 'bg-orange-600',
          text: 'text-white',
          border: 'border-orange-600',
          gradient: 'from-orange-600 to-orange-700',
          iconBg: 'bg-white/20',
          iconColor: 'text-white'
        };
      case 'green':
        return {
          bg: 'bg-green-600',
          text: 'text-white',
          border: 'border-green-600',
          gradient: 'from-green-600 to-green-700',
          iconBg: 'bg-white/20',
          iconColor: 'text-white'
        };
      case 'purple':
        return {
          bg: 'bg-purple-600',
          text: 'text-white',
          border: 'border-purple-600',
          gradient: 'from-purple-600 to-purple-700',
          iconBg: 'bg-white/20',
          iconColor: 'text-white'
        };
      default:
        return {
          bg: 'bg-gray-600',
          text: 'text-white',
          border: 'border-gray-600',
          gradient: 'from-gray-600 to-gray-700',
          iconBg: 'bg-white/20',
          iconColor: 'text-white'
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <Card 
      className={cn(
        "w-full bg-gradient-to-br backdrop-blur-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group overflow-hidden",
        colorClasses.gradient,
        colorClasses.border,
        onClick && "cursor-pointer hover:scale-[1.05]"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-4">
        <CardTitle className={cn("text-sm font-semibold transition-colors", colorClasses.text)}>
          {title}
        </CardTitle>
        <div className={cn("p-3 rounded-full transition-all duration-300 group-hover:scale-110", colorClasses.iconBg)}>
          <Icon className={cn("h-5 w-5", colorClasses.iconColor)} />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex items-end justify-between mb-3">
          <div className={cn("text-3xl font-bold", colorClasses.text)}>{value}</div>
          {trend !== undefined && (
            <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className={cn("text-sm opacity-90", colorClasses.text)}>{subtitle}</p>
        )}
        {/* Elemento decorativo circular */}
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 transition-all duration-300"></div>
      </CardContent>
    </Card>
  );
};

type InicioClientProps = {
    initialConsultas: Consulta[];
    initialSNAs: SNA[];
}

export function InicioClient({ initialConsultas, initialSNAs }: InicioClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [selectedSNA, setSelectedSNA] = useState<SNA | null>(null);
  const [isConsultaDetailOpen, setIsConsultaDetailOpen] = useState(false);
  const [isSNADetailOpen, setIsSNADetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [consultas, setConsultas] = useState<Consulta[]>(initialConsultas);
  const [snas, setSNAs] = useState<SNA[]>(initialSNAs);

  const totalConsultas = consultas.length;
  const pendingConsultas = consultas.filter(v => v.estado === 'Pendiente').length;
  const completedConsultas = consultas.filter(v => v.estado === 'Completa').length;
  const scheduledConsultas = consultas.filter(v => v.estado === 'Agendada').length;

  // Cálculos de SNAs
  const totalSNAs = snas.length;
  const openSNAs = snas.filter(v => v.estado === 'Abierta').length;
  const closedSNAs = snas.filter(v => v.estado === 'Cerrada').length;
  const snasWithLesions = snas.filter(v => v.constatacionLesiones).length;

  // Cálculos adicionales
  const completionRate = totalConsultas > 0 ? (completedConsultas / totalConsultas * 100) : 0;
  const pendingRate = totalConsultas > 0 ? (pendingConsultas / totalConsultas * 100) : 0;
  const monthlyData = generateMonthlyData(consultas);
  const snaMonthlyData = generateSNAMonthlyData(snas);

  const allChartData = useMemo(() => generateChartData(consultas), [consultas]);
  const pendingChartData = useMemo(() => generateChartData(consultas, 'Pendiente'), [consultas]);
  const completedChartData = useMemo(() => generateChartData(consultas, 'Completa'), [consultas]);
  const scheduledChartData = useMemo(() => generateChartData(consultas, 'Agendada'), [consultas]);

  // Consultas del mes actual
  const currentMonthConsultas = useMemo(() => getCurrentMonthConsultas(consultas), [consultas]);
  
  // SNAs del mes actual
  const currentMonthSNAs = useMemo(() => getCurrentMonthSNAs(snas), [snas]);
  
  // Obtener consultas del día seleccionado
  const consultasDelDiaSeleccionado = useMemo(() => {
    if (!selectedDay) return [];
    return currentMonthConsultas.filter(consulta => 
      format(new Date(consulta.fechaConsulta), 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd')
    );
  }, [selectedDay, currentMonthConsultas]);
  
  // Obtener SNAs del día seleccionado
  const snasDelDiaSeleccionado = useMemo(() => {
    if (!selectedDay) return [];
    return currentMonthSNAs.filter(sna => 
      format(new Date(sna.fechaDenuncia), 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd')
    );
  }, [selectedDay, currentMonthSNAs]);

  // Funciones de navegación
  const navigateToConsultas = (statusFilter: string) => {
    router.push(`/consultas?status=${statusFilter}`);
  };

  const navigateToAllConsultas = () => {
    router.push('/consultas');
  };

  const navigateToSNAs = (statusFilter: string) => {
    router.push(`/sna?status=${statusFilter}`);
  };

  const navigateToSNAsWithLesiones = () => {
    router.push('/sna?lesiones=si');
  };

  const navigateToAllSNAs = () => {
    router.push('/sna');
  };

  const handleAddConsulta = () => {
    router.push('/consultas');
  };

  const handleAddSNA = () => {
    router.push('/sna');
  };

  const handleEditConsulta = (consulta: Consulta) => {
    setSelectedConsulta(consulta);
    setIsConsultaDetailOpen(true);
  };

  const handleEditSNA = (sna: SNA) => {
    setSelectedSNA(sna);
    setIsSNADetailOpen(true);
  };

  const handleDeleteConsulta = (id: string) => {
    // En el inicio, redirigir a consultas para eliminar
    router.push('/consultas');
  };

  const handleDeleteSNA = (id: string) => {
    // En el inicio, redirigir a SNAs para eliminar
    router.push('/sna');
  };

  // Funciones de compartir PDF para consultas
  const handleSharePDF = async (consulta: Consulta) => {
    // Importar html2pdf dinámicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Crear el contenido HTML del PDF con diseño optimizado para impresión
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Consulta Médica - ${consulta.nombre}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              margin: 0; 
              line-height: 1.6; 
              color: #1f2937;
              background: white;
              min-height: 100vh;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            
            .header { 
              background: #f8fafc;
              color: #1f2937;
              padding: 20px 30px;
              text-align: center;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .header h1 { 
              font-size: 20px; 
              font-weight: 700; 
              margin-bottom: 4px;
              letter-spacing: -0.025em;
            }
            
            .header h2 { 
              font-size: 14px; 
              font-weight: 500; 
              color: #6b7280;
              margin-bottom: 8px;
            }
            
            .header p { 
              font-size: 12px; 
              color: #6b7280;
            }
            
            .content {
              padding: 30px;
            }
            
            .section { 
              margin-bottom: 24px; 
            }
            
            .section-title { 
              font-size: 14px; 
              font-weight: 600; 
              color: #374151;
              margin-bottom: 12px;
              padding-bottom: 6px;
              border-bottom: 1px solid #e5e7eb;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            
            .field { 
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid #f3f4f6;
            }
            
            .field:last-child {
              border-bottom: none;
            }
            
            .label { 
              font-weight: 500; 
              color: #6b7280;
              font-size: 13px;
            }
            
            .value { 
              color: #1f2937;
              font-weight: 500;
              font-size: 13px;
              text-align: right;
            }
            
            .observations { 
              padding: 16px;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              font-size: 13px;
              line-height: 1.6;
              min-height: 120px;
              background: white;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            
            .observations.empty {
              color: #9ca3af;
              font-style: italic;
              border-style: dashed;
            }
            
            .status-badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            .status-agendada { background: #dbeafe; color: #1e40af; }
            .status-pendiente { background: #fef3c7; color: #d97706; }
            .status-completa { background: #d1fae5; color: #047857; }
            
            .footer { 
              background: #f9fafb;
              padding: 16px 30px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
              margin-bottom: 2px;
            }
            
            .footer p:last-child {
              margin-bottom: 0;
            }
            
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 CAFF CONSULTAS MÉDICAS</h1>
              <h2>📋 INFORME DE CONSULTA MÉDICA</h2>
              <p>📅 Documento generado el: ${format(new Date(), 'dd/MM/yyyy')} a las ${format(new Date(), 'HH:mm')} hrs</p>
            </div>
            
            <div class="content">
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  INFORMACIÓN DEL ADOLESCENTE
                </div>
                <div class="field">
                  <span class="label">Nombre</span>
                  <span class="value">${consulta.nombre}</span>
                </div>
                <div class="field">
                  <span class="label">Cédula</span>
                  <span class="value">${consulta.cedula}</span>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
                    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
                    <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"></path>
                    <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"></path>
                  </svg>
                  DETALLES DE LA CONSULTA
                </div>
                <div class="field">
                  <span class="label">Estudio</span>
                  <span class="value">${consulta.estudio}</span>
                </div>
                <div class="field">
                  <span class="label">Educador/a</span>
                  <span class="value">${consulta.educador}</span>
                </div>
                <div class="field">
                  <span class="label">Fecha Consulta</span>
                  <span class="value">${format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}</span>
                </div>
                <div class="field">
                  <span class="label">Fecha Control</span>
                  <span class="value">${format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}</span>
                </div>
                <div class="field">
                  <span class="label">Estado</span>
                  <span class="value">
                    <span class="status-badge status-${consulta.estado.toLowerCase()}">${consulta.estado}</span>
                  </span>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                  OBSERVACIONES
                </div>
                <div class="observations ${!consulta.observaciones ? 'empty' : ''}">${consulta.observaciones || '📝 Espacio para observaciones médicas:\n\n• Evaluación realizada:\n• Diagnóstico:\n• Tratamiento indicado:\n• Recomendaciones:\n• Seguimiento requerido:'}</div>
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-left">
                <p>🏥 CAFF Consultas Médicas</p>
                <p>Sistema de Gestión Integral</p>
              </div>
              <div class="footer-center">
                <p>📋 Documento Oficial</p>
                <p>Consulta Médica - ${consulta.nombre}</p>
              </div>
              <div class="footer-right">
                <p>📅 ${format(new Date(), 'dd/MM/yyyy')}</p>
                <p>⏰ ${format(new Date(), 'HH:mm')} hrs</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Crear un elemento temporal para el contenido HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);
    
    // Configuración para el PDF
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `consulta_${consulta.nombre.replace(/\s+/g, '_')}_${format(new Date(consulta.fechaConsulta), 'dd-MM-yyyy')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };
    
    // Generar y compartir el PDF
    try {
      // Generar el PDF como blob
      const pdfBlob = await html2pdf().set(opt).from(tempDiv).outputPdf('blob');
      
      // Crear archivo PDF
      const pdfFile = new File([pdfBlob], `consulta_${consulta.nombre.replace(/\s+/g, '_')}_${format(new Date(consulta.fechaConsulta), 'dd-MM-yyyy')}.pdf`, {
        type: 'application/pdf'
      });
      
      // Verificar si el navegador soporta Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        // Usar Web Share API para compartir el PDF
        await navigator.share({
          title: `📋 Informe de Consulta Médica - ${consulta.nombre}`,
          text: `🏥 CAFF CONSULTAS MÉDICAS\n\n📋 INFORME DE CONSULTA MÉDICA\n\n👤 Información del Adolescente:\n• Nombre: ${consulta.nombre}\n• Cédula: ${consulta.cedula}\n\n🏥 Detalles de la Consulta:\n• Estudio: ${consulta.estudio}\n• Educador/a Responsable: ${consulta.educador}\n• Estado: ${consulta.estado}\n\n📅 Fechas Importantes:\n• Fecha de Consulta: ${format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}\n• Fecha de Control: ${format(new Date(consulta.fechaControl), 'dd/MM/yyyy')}\n\n📱 Documento generado desde CAFF Consultas Médicas\n📄 Sistema de Gestión Integral de Consultas`,
          files: [pdfFile]
        });
        
        toast({
          title: 'PDF compartido',
          description: 'El PDF se ha compartido correctamente.',
        });
      } else {
        // Fallback: descargar el PDF
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = pdfFile.name;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'PDF descargado',
          description: 'El PDF se ha descargado correctamente.',
        });
        
        // Limpiar el URL
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el PDF. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      // Limpiar el elemento temporal
      document.body.removeChild(tempDiv);
    }
  };

  // Funciones de compartir PDF para SNAs
  const handleShareSNAPDF = async (sna: SNA) => {
    // Importar html2pdf dinámicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Crear el contenido HTML del PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>SNA - ${sna.nombreAdolescente}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              margin: 0; 
              line-height: 1.6; 
              color: #1f2937;
              background: white;
              min-height: 100vh;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            
            .header { 
              background: #fef2f2;
              color: #1f2937;
              padding: 20px 30px;
              text-align: center;
              border-bottom: 2px solid #fecaca;
            }
            
            .header h1 { 
              font-size: 20px; 
              font-weight: 700; 
              margin-bottom: 4px;
              letter-spacing: -0.025em;
            }
            
            .header h2 { 
              font-size: 14px; 
              font-weight: 500; 
              color: #6b7280;
              margin-bottom: 8px;
            }
            
            .header p { 
              font-size: 12px; 
              color: #6b7280;
            }
            
            .content {
              padding: 30px;
            }
            
            .section { 
              margin-bottom: 24px; 
            }
            
            .section-title { 
              font-size: 14px; 
              font-weight: 600; 
              color: #374151;
              margin-bottom: 12px;
              padding-bottom: 6px;
              border-bottom: 1px solid #e5e7eb;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            
            .field { 
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid #f3f4f6;
            }
            
            .field:last-child {
              border-bottom: none;
            }
            
            .label { 
              font-weight: 500; 
              color: #6b7280;
              font-size: 13px;
            }
            
            .value { 
              color: #1f2937;
              font-weight: 500;
              font-size: 13px;
              text-align: right;
            }
            
            .comments { 
              padding: 16px;
              border: 2px solid #fecaca;
              border-radius: 8px;
              font-size: 13px;
              line-height: 1.6;
              min-height: 120px;
              background: white;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            
            .comments.empty {
              color: #9ca3af;
              font-style: italic;
              border-style: dashed;
            }
            
            .status-badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            .status-abierta { background: #fef3c7; color: #d97706; }
            .status-cerrada { background: #d1fae5; color: #047857; }
            
            .footer { 
              background: #f9fafb;
              padding: 16px 30px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
              margin-bottom: 2px;
            }
            
            .footer p:last-child {
              margin-bottom: 0;
            }
            
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 CAFF CONSULTAS MÉDICAS</h1>
              <h2>⚠️ INFORME DE SALIDA NO ACORDADA (SNA)</h2>
              <p>📅 Documento generado el: ${format(new Date(), 'dd/MM/yyyy')} a las ${format(new Date(), 'HH:mm')} hrs</p>
            </div>
            
            <div class="content">
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  INFORMACIÓN DEL ADOLESCENTE
                </div>
                <div class="field">
                  <span class="label">Nombre</span>
                  <span class="value">${sna.nombreAdolescente}</span>
                </div>
                <div class="field">
                  <span class="label">N° Denuncia</span>
                  <span class="value">${sna.numeroDenuncia}</span>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
                    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
                    <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"></path>
                    <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"></path>
                  </svg>
                  DETALLES DE LA SNA
                </div>
                <div class="field">
                  <span class="label">Fecha Denuncia</span>
                  <span class="value">${format(new Date(sna.fechaDenuncia), 'dd/MM/yyyy')}</span>
                </div>
                ${sna.fechaCierre ? `
                <div class="field">
                  <span class="label">Fecha Cierre</span>
                  <span class="value">${format(new Date(sna.fechaCierre), 'dd/MM/yyyy')}</span>
                </div>
                ` : ''}
                <div class="field">
                  <span class="label">Estado</span>
                  <span class="value">
                    <span class="status-badge status-${sna.estado.toLowerCase()}">${sna.estado}</span>
                  </span>
                </div>
                <div class="field">
                  <span class="label">Constatación Lesiones</span>
                  <span class="value">${sna.constatacionLesiones ? 'Sí' : 'No'}</span>
                </div>
                ${sna.retira ? `
                <div class="field">
                  <span class="label">Retira</span>
                  <span class="value">${sna.retira}</span>
                </div>
                ` : ''}
              </div>
              
              ${sna.comentarios ? `
              <div class="section">
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                  COMENTARIOS
                </div>
                <div class="comments ${!sna.comentarios ? 'empty' : ''}">${sna.comentarios || '📝 Espacio para comentarios y observaciones:\n\n• Circunstancias del incidente:\n• Acciones tomadas:\n• Medidas preventivas:\n• Seguimiento requerido:\n• Observaciones adicionales:'}</div>
              </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <div class="footer-left">
                <p>🏥 CAFF Consultas Médicas</p>
                <p>Sistema de Gestión Integral</p>
              </div>
              <div class="footer-center">
                <p>⚠️ Documento Oficial</p>
                <p>SNA - ${sna.nombreAdolescente}</p>
              </div>
              <div class="footer-right">
                <p>📅 ${format(new Date(), 'dd/MM/yyyy')}</p>
                <p>⏰ ${format(new Date(), 'HH:mm')} hrs</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Crear un elemento temporal para el contenido HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);
    
    // Configuración para el PDF
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `sna_${sna.nombreAdolescente.replace(/\s+/g, '_')}_${format(new Date(sna.fechaDenuncia), 'dd-MM-yyyy')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };
    
    // Generar y compartir el PDF
    try {
      // Generar el PDF como blob
      const pdfBlob = await html2pdf().set(opt).from(tempDiv).outputPdf('blob');
      
      // Crear archivo PDF
      const pdfFile = new File([pdfBlob], `sna_${sna.nombreAdolescente.replace(/\s+/g, '_')}_${format(new Date(sna.fechaDenuncia), 'dd-MM-yyyy')}.pdf`, {
        type: 'application/pdf'
      });
      
      // Verificar si el navegador soporta Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        // Usar Web Share API para compartir el PDF
        await navigator.share({
          title: `⚠️ Informe de SNA - ${sna.nombreAdolescente}`,
          text: `🏥 CAFF CONSULTAS MÉDICAS\n\n⚠️ INFORME DE SALIDA NO ACORDADA (SNA)\n\n👤 Información del Adolescente:\n• Nombre: ${sna.nombreAdolescente}\n• N° Denuncia: ${sna.numeroDenuncia}\n\n⚠️ Detalles del Incidente:\n• Estado: ${sna.estado}\n• Constatación de Lesiones: ${sna.constatacionLesiones ? 'Sí' : 'No'}\n${sna.retira ? `• Retira: ${sna.retira}\n` : ''}\n📅 Fechas Importantes:\n• Fecha de Denuncia: ${format(new Date(sna.fechaDenuncia), 'dd/MM/yyyy')}\n${sna.fechaCierre ? `• Fecha de Cierre: ${format(new Date(sna.fechaCierre), 'dd/MM/yyyy')}\n` : ''}\n📱 Documento generado desde CAFF Consultas Médicas\n📄 Sistema de Gestión Integral de SNAs`,
          files: [pdfFile]
        });
        
        toast({
          title: 'PDF compartido',
          description: 'El PDF se ha compartido correctamente.',
        });
      } else {
        // Fallback: descargar el PDF
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = pdfFile.name;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'PDF descargado',
          description: 'El PDF se ha descargado correctamente.',
        });
        
        // Limpiar el URL
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el PDF. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      // Limpiar el elemento temporal
      document.body.removeChild(tempDiv);
    }
  };

  // Funciones de manejo de datos
  const handleEditConsultaData = async (consulta: Consulta) => {
    setIsLoading(true);
    try {
      await updateConsulta(consulta.id, consulta);
      // Update local state immediately
      setConsultas(prev => prev.map(c => 
        c.id === consulta.id ? { ...c, ...consulta } : c
      ));
      toast({
        title: 'Consulta actualizada',
        description: 'Los datos de la consulta se han actualizado.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'No se pudo actualizar la consulta.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConsultaData = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteConsulta(id);
      // Remove from local state immediately
      setConsultas(prev => prev.filter(consulta => consulta.id !== id));
      toast({
        title: 'Consulta eliminada',
        description: 'El registro de la consulta ha sido eliminado.',
        variant: 'default',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'No se pudo eliminar la consulta.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSNAData = async (sna: SNA) => {
    setIsLoading(true);
    try {
      await updateSNA(sna.id, sna);
      // Update local state immediately
      setSNAs(prev => prev.map(s => 
        s.id === sna.id ? { ...s, ...sna } : s
      ));
      toast({
        title: 'SNA actualizada',
        description: 'Los datos de la SNA se han actualizado.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'No se pudo actualizar la SNA.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSNAData = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteSNA(id);
      // Remove from local state immediately
      setSNAs(prev => prev.filter(sna => sna.id !== id));
      toast({
        title: 'SNA eliminada',
        description: 'El registro de la SNA ha sido eliminado.',
        variant: 'default',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'No se pudo eliminar la SNA.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener el badge de estado de consulta
  const getConsultaStatusBadge = (estado: string) => {
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

  // Función para obtener el badge de estado de SNA
  const getSNAStatusBadge = (estado: string) => {
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

  // Función para obtener el badge de lesiones
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
          <Shield className="h-3 w-3 mr-1" />
          No
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="text-center mb-8 pt-4 md:pt-0">
        <h1 className="text-2xl md:text-2xl lg:text-2xl font-bold tracking-tight font-headline text-gray-900 mb-2">
          Inicio
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto mt-4 rounded-full"></div>
      </div>
      
      {/* Métricas principales - Consultas */}
      <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50/30">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 text-center flex items-center justify-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Resumen de Consultas
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            title="Total de Consultas"
            value={totalConsultas}
            icon={Database}
            color="blue"
            subtitle={`${totalConsultas} consultas atendidas`}
            onClick={navigateToAllConsultas}
          />
          
          <StatCard
            title="Consultas Pendientes"
            value={pendingConsultas}
            icon={AlertCircle}
            color="yellow"
            subtitle={`${pendingRate.toFixed(1)}% requieren seguimiento`}
            onClick={() => navigateToConsultas('Pendiente')}
          />
          
          <StatCard
            title="Consultas Completadas"
            value={completedConsultas}
            icon={FileCheck}
            color="green"
            subtitle={`${completionRate.toFixed(1)}% de efectividad`}
            onClick={() => navigateToConsultas('Completa')}
          />
          
          <StatCard
            title="Consultas Agendadas"
            value={scheduledConsultas}
            icon={CalendarDays}
            color="purple"
            subtitle="Próximas sesiones"
            onClick={() => navigateToConsultas('Agendada')}
          />
        </div>
      </div>

      {/* Métricas de SNAs */}
      <div className="border-2 border-red-500 rounded-lg p-4 bg-red-50/30">
        <h3 className="text-lg font-semibold text-red-800 mb-4 text-center flex items-center justify-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Resumen de SNAs
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatCardSNA
            title="Total de SNAs"
            value={totalSNAs}
            icon={AlertTriangle}
            color="red"
            subtitle={`${totalSNAs} salidas no acordadas`}
            onClick={navigateToAllSNAs}
          />
          
          <StatCardSNA
            title="SNAs Abiertas"
            value={openSNAs}
            icon={Clock}
            color="orange"
            subtitle={`${totalSNAs > 0 ? (openSNAs / totalSNAs * 100).toFixed(1) : 0}% requieren atención`}
            onClick={() => navigateToSNAs('Abierta')}
          />
          
          <StatCardSNA
            title="SNAs Cerradas"
            value={closedSNAs}
            icon={CheckCircle}
            color="green"
            subtitle={`${totalSNAs > 0 ? (closedSNAs / totalSNAs * 100).toFixed(1) : 0}% resueltas`}
            onClick={() => navigateToSNAs('Cerrada')}
          />
          
          <StatCardSNA
            title="Con constatación"
            value={snasWithLesions}
            icon={Shield}
            color="purple"
            subtitle="SNAs con constatación"
            onClick={navigateToSNAsWithLesiones}
          />
        </div>
      </div>

      {/* Métricas adicionales - Consultas */}
      <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50/30">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 text-center flex items-center justify-center gap-2">
          <Activity className="h-5 w-5" />
          Métricas de Rendimiento - Consultas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card 
            className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
            onClick={() => navigateToConsultas('Completa')}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-green-500/20 rounded-xl shadow-sm group-hover:bg-green-500/30 transition-colors">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800 uppercase tracking-wide">Tasa de Éxito</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-700">{completionRate.toFixed(1)}%</p>
                  <p className="text-xs text-green-600 mt-1">Consultas completadas exitosamente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
            onClick={() => navigateToConsultas('Pendiente')}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-yellow-500/20 rounded-xl shadow-sm group-hover:bg-yellow-500/30 transition-colors">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-yellow-800 uppercase tracking-wide">Consultas Activas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-700">{pendingConsultas + scheduledConsultas}</p>
                  <p className="text-xs text-yellow-600 mt-1">Requieren seguimiento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
            onClick={navigateToAllConsultas}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-xl shadow-sm group-hover:bg-blue-500/30 transition-colors">
                  <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Consultas del Mes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-700">{monthlyData.current}</p>
                  <p className="text-xs text-blue-600 mt-1">Evaluaciones realizadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Métricas adicionales - SNAs */}
      <div className="border-2 border-red-500 rounded-lg p-4 bg-red-50/30">
        <h3 className="text-lg font-semibold text-red-800 mb-4 text-center flex items-center justify-center gap-2">
          <Activity className="h-5 w-5" />
          Métricas de Rendimiento - SNAs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card 
            className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
            onClick={navigateToAllSNAs}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-red-500/20 rounded-xl shadow-sm group-hover:bg-red-500/30 transition-colors">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800 uppercase tracking-wide">SNAs del Mes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-700">{snaMonthlyData.current}</p>
                  <p className="text-xs text-red-600 mt-1">Salidas no acordadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
            onClick={() => navigateToSNAs('Abierta')}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-orange-500/20 rounded-xl shadow-sm group-hover:bg-orange-500/30 transition-colors">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-800 uppercase tracking-wide">SNAs Abiertas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-700">{openSNAs}</p>
                  <p className="text-xs text-orange-600 mt-1">Requieren atención inmediata</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calendario del mes actual */}
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-100/30 shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg font-semibold text-gray-900 text-center flex items-center justify-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Calendario de Actividades del Mes
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
                    const snasDelDia = currentMonthSNAs.filter(sna => 
                      format(new Date(sna.fechaDenuncia), 'yyyy-MM-dd') === fechaStr
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
                            
                            {/* Indicadores de consultas y SNAs */}
                            <div className="space-y-1">
                              {/* Consultas */}
                              {consultasDelDia.slice(0, 2).map((consulta, index) => (
                                <div
                                  key={`consulta-${consulta.id}`}
                                  className={cn(
                                    'h-1.5 rounded-full opacity-80 transition-opacity',
                                    consulta.estado === 'Agendada' && 'bg-blue-500',
                                    consulta.estado === 'Pendiente' && 'bg-yellow-500',
                                    consulta.estado === 'Completa' && 'bg-green-500'
                                  )}
                                  title={`${consulta.nombre} - ${consulta.estado}`}
                                />
                              ))}
                              
                              {/* SNAs */}
                              {snasDelDia.slice(0, 2).map((sna, index) => (
                                <div
                                  key={`sna-${sna.id}`}
                                  className={cn(
                                    'h-1.5 rounded-full opacity-80 transition-opacity',
                                    sna.estado === 'Abierta' && 'bg-red-500',
                                    sna.estado === 'Cerrada' && 'bg-purple-500'
                                  )}
                                  title={`${sna.nombreAdolescente} - SNA ${sna.estado}`}
                                />
                              ))}
                              
                              {/* Contador adicional si hay más elementos */}
                              {(consultasDelDia.length + snasDelDia.length) > 4 && (
                                <div className="h-1.5 rounded-full bg-gray-400 opacity-60 text-[6px] text-white flex items-center justify-center">
                                  +{(consultasDelDia.length + snasDelDia.length) - 4}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  },
                }}
              />
            </div>

            {/* Consultas y SNAs del día seleccionado */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">
                {selectedDay ? format(selectedDay, 'EEEE, d MMMM yyyy', { locale: es }) : 'Selecciona una fecha'}
              </h3>
              
              {!selectedDay ? (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Toca un día en el calendario para ver las actividades</p>
                </div>
              ) : (consultasDelDiaSeleccionado.length === 0 && snasDelDiaSeleccionado.length === 0) ? (
                <p className="text-gray-500 text-sm">No hay actividades programadas para este día.</p>
              ) : (
                <div className="space-y-4">
                  {/* Consultas */}
                  {consultasDelDiaSeleccionado.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Consultas ({consultasDelDiaSeleccionado.length})
                      </h4>
                      <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded-md">
                        💡 Toca una consulta para editarla
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
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

                  {/* SNAs */}
                  {snasDelDiaSeleccionado.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-red-700 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        SNAs ({snasDelDiaSeleccionado.length})
                      </h4>
                      <p className="text-xs text-gray-600 bg-red-50 p-2 rounded-md">
                        ⚠️ Toca una SNA para editarla
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {snasDelDiaSeleccionado.map((sna) => (
                          <div
                            key={sna.id}
                            className={cn(
                              'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                              'bg-white border-l-4',
                              sna.estado === 'Abierta' && 'border-l-red-500',
                              sna.estado === 'Cerrada' && 'border-l-purple-500'
                            )}
                            onClick={() => handleEditSNA(sna)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">{sna.nombreAdolescente}</h4>
                                <p className="text-sm text-gray-600">N° {sna.numeroDenuncia}</p>
                                <p className="text-xs text-gray-500">
                                  Lesiones: {sna.constatacionLesiones ? 'Sí' : 'No'}
                                </p>
                              </div>
                              <div className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium text-white',
                                sna.estado === 'Abierta' && 'bg-red-500',
                                sna.estado === 'Cerrada' && 'bg-purple-500'
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
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Consultas del mes actual */}
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-100/30 shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg font-semibold text-gray-900 text-center flex items-center justify-center gap-2">
            <Calendar className="h-5 w-5" />
            Consultas del Mes Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {currentMonthConsultas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay consultas este mes</p>
              <p className="text-sm">Las consultas aparecerán aquí cuando se registren</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Adolescente</TableHead>
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
                            consulta.estado === 'Agendada' ? 'secondary' :
                            consulta.estado === 'Pendiente' ? 'outline' : 'outline'
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

      {/* Tabla de SNAs del mes actual */}
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-100/30 shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg font-semibold text-gray-900 text-center flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            SNAs del Mes Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {currentMonthSNAs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay SNAs este mes</p>
              <p className="text-sm">Las SNAs aparecerán aquí cuando se registren</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Adolescente</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">N° Denuncia</TableHead>
                    <TableHead className="text-xs">F. Denuncia</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">F. Cierre</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Retira</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                    <TableHead className="text-xs">Lesiones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMonthSNAs.map((sna) => (
                    <TableRow 
                      key={sna.id} 
                      className="text-xs cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleEditSNA(sna)}
                    >
                      <TableCell className="font-medium">{sna.nombreAdolescente}</TableCell>
                      <TableCell className="hidden md:table-cell">{sna.numeroDenuncia}</TableCell>
                      <TableCell>{format(new Date(sna.fechaDenuncia), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {sna.fechaCierre ? format(new Date(sna.fechaCierre), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{sna.retira || '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            sna.estado === 'Abierta' ? 'secondary' : 'outline'
                          }
                          className={
                            sna.estado === 'Abierta' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }
                        >
                          {sna.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={sna.constatacionLesiones ? 'destructive' : 'outline'}
                          className={
                            sna.constatacionLesiones ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {sna.constatacionLesiones ? 'Sí' : 'No'}
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

      {/* Modal de detalles de consulta */}
      <Dialog open={isConsultaDetailOpen} onOpenChange={setIsConsultaDetailOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 shadow-lg">
          <DialogHeader className="bg-gradient-to-r from-slate-100 to-gray-100 text-gray-800 rounded-t-lg -mt-6 -mx-6 px-6 py-3 mb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
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
                    <div>{getConsultaStatusBadge(selectedConsulta.estado)}</div>
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
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
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
                    router.push('/consultas');
                    setIsConsultaDetailOpen(false);
                  }}
                  className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Ir a Consultas</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleSharePDF(selectedConsulta);
                    setIsConsultaDetailOpen(false);
                  }}
                  className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Compartir PDF</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres eliminar esta consulta? Esta acción no se puede deshacer.')) {
                      handleDeleteConsultaData(selectedConsulta.id);
                      setIsConsultaDetailOpen(false);
                    }
                  }}
                  className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Eliminar</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de detalles de SNA */}
      <Dialog open={isSNADetailOpen} onOpenChange={setIsSNADetailOpen}>
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
                    <div>{getSNAStatusBadge(selectedSNA.estado)}</div>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    router.push('/sna');
                    setIsSNADetailOpen(false);
                  }}
                  className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Ir a SNAs</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleShareSNAPDF(selectedSNA);
                    setIsSNADetailOpen(false);
                  }}
                  className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Compartir PDF</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres eliminar esta SNA? Esta acción no se puede deshacer.')) {
                      handleDeleteSNAData(selectedSNA.id);
                      setIsSNADetailOpen(false);
                    }
                  }}
                  className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Eliminar</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}