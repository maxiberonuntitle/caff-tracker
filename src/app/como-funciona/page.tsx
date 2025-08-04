import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, CalendarPlus, Edit, Trash2, Clock, CheckCircle, Share2, Search, BarChart3, Printer, Calendar, TrendingUp, Users, ArrowUp, Filter, Smartphone, Zap, FileText } from 'lucide-react';

export default function ComoFuncionaPage() {
  const features = [
    {
      icon: <ClipboardList className="h-6 w-6 text-primary" />,
      title: 'Dashboard Interactivo',
      description: 'Vista general con métricas en tiempo real: total de consultas, pendientes, completas y agendadas. Incluye gráficos de tendencias y tasas de completación.',
    },
    {
      icon: <Calendar className="h-6 w-6 text-blue-500" />,
      title: 'Calendario Visual del Mes',
      description: 'Calendario interactivo que muestra todas las consultas del mes actual con indicadores de color por estado. Panel lateral con resumen de consultas por estado.',
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-green-500" />,
      title: 'Tabla de Consultas del Mes',
      description: 'Tabla completa con todas las consultas del mes actual, ordenable por cualquier columna. Muestra paciente, cédula, estudio, educador/a, fechas y estado.',
    },
    {
      icon: <CalendarPlus className="h-6 w-6 text-emerald-500" />,
      title: 'Gestión de Consultas',
              description: 'Registra nuevas consultas con datos completos: paciente, cédula, estudio, educador/a, fechas de consulta y control, observaciones y estado.',
    },
    {
      icon: <Clock className="h-6 w-6 text-yellow-500" />,
      title: 'Estados de Consultas',
      description: 'Sistema de estados: Agendada (azul), Pendiente (amarillo) y Completa (verde). Seguimiento visual del progreso de cada consulta.',
    },
    {
      icon: <Edit className="h-6 w-6 text-purple-500" />,
      title: 'Edición Flexible',
      description: 'Modifica cualquier consulta existente: cambia fechas, actualiza estados, edita observaciones o corrige datos del paciente.',
    },
    {
      icon: <Trash2 className="h-6 w-6 text-red-500" />,
      title: 'Eliminación Segura',
      description: 'Elimina consultas canceladas o registradas por error. Confirmación requerida para evitar eliminaciones accidentales.',
    },
    {
      icon: <Search className="h-6 w-6 text-indigo-500" />,
      title: 'Búsqueda y Filtros Avanzados',
              description: 'Filtra por paciente, educador/a, estado, tipo de estudio y rango de fechas. Búsqueda en tiempo real con resultados instantáneos.',
    },
    {
      icon: <Filter className="h-6 w-6 text-orange-500" />,
      title: 'Vistas Múltiples',
      description: 'Visualiza consultas en tres formatos: tarjetas para vista rápida, calendario para programación y tabla para análisis detallado.',
    },
    {
      icon: <Share2 className="h-6 w-6 text-teal-500" />,
      title: 'Compartir por WhatsApp',
      description: 'Comparte resúmenes de consultas directamente por WhatsApp con formato profesional. Ideal para comunicación con otros profesionales.',
    },
    {
      icon: <FileText className="h-6 w-6 text-blue-500" />,
      title: 'Generar PDF',
      description: 'Crea documentos PDF profesionales de consultas con formato médico. Incluye toda la información estructurada para impresión o archivo.',
    },
    {
      icon: <Printer className="h-6 w-6 text-cyan-500" />,
      title: 'Reportes Imprimibles',
      description: 'Genera e imprime reportes completos de consultas. Formato optimizado para impresión con todas las columnas visibles.',
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-pink-500" />,
      title: 'Métricas y Tendencias',
      description: 'Gráficos de tendencias de los últimos 6 meses. Análisis de tasas de completación y comparativas mes a mes.',
    },
    {
      icon: <Users className="h-6 w-6 text-lime-500" />,
              title: 'Seguimiento por Educador/a',
        description: 'Filtra y analiza consultas por educador/a específico. Dashboard muestra métricas individuales y de equipo.',
    },
    {
      icon: <Zap className="h-6 w-6 text-amber-500" />,
      title: 'Actualización en Tiempo Real',
      description: 'Datos sincronizados automáticamente. Cambios reflejados inmediatamente en dashboard, calendario y tablas.',
    }
  ];

  const workflowSteps = [
    {
      step: "1",
      title: "Acceso al Sistema",
      description: "Ingresa con tu usuario y contraseña para acceder al sistema de gestión de consultas."
    },
    {
      step: "2", 
      title: "Dashboard General",
      description: "Revisa métricas del día: consultas pendientes, completadas, agendadas y tendencias del mes."
    },
    {
      step: "3",
      title: "Gestión de Consultas", 
      description: "Ve al módulo de consultas para agregar nuevas, editar existentes o eliminar registros."
    },
    {
      step: "4",
      title: "Vistas Especializadas",
      description: "Usa tarjetas para vista rápida, calendario para programación o tabla para análisis detallado."
    },
    {
      step: "5", 
      title: "Filtros y Búsqueda",
              description: "Encuentra consultas específicas usando filtros por paciente, educador/a, estado o fechas."
    },
    {
      step: "6",
      title: "Compartir y Reportar",
      description: "Comparte consultas por WhatsApp, genera PDFs profesionales o crea reportes imprimibles para documentación."
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-12">
        <PageHeader title="¿Cómo funciona?" showBackButton={true} backUrl="/" />

        {/* Introducción */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-gray-700 max-w-2xl mx-auto text-lg leading-relaxed">
                Gestión de consultas médicas para equipos colaborativos.
              </p>
              <div className="flex justify-center items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Equipo colaborativo
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Tiempo real
                </span>
                <span className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Multi-dispositivo
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flujo de Trabajo */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">¿Cómo Empezar?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowSteps.map((step, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Características */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Características Principales</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="flex flex-col text-center items-center p-6 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border border-gray-100">
                <div className="mb-4 flex items-center justify-center rounded-full bg-primary/10 p-3">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-headline text-base font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600 flex-grow leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Beneficios */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Beneficios del Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Ahorro de Tiempo</h3>
                <p className="text-sm text-gray-600">Gestión centralizada y automatizada reduce el tiempo administrativo</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Colaboración Eficiente</h3>
                <p className="text-sm text-gray-600">Acceso compartido permite trabajo en equipo sin duplicaciones</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Análisis de Datos</h3>
                <p className="text-sm text-gray-600">Métricas y reportes para toma de decisiones informadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
