import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, CalendarPlus, Edit, Clock, CheckCircle, Share2, Search, BarChart3, Calendar, Users, ArrowUp, Filter, Smartphone, Zap, AlertTriangle, Shield, UserCheck } from 'lucide-react';

export default function ComoFuncionaPage() {
  const features = [
    {
      icon: <ClipboardList className="h-6 w-6 text-primary" />,
      title: 'Página de Inicio',
      description: 'Vista general con métricas de consultas médicas y SNAs del mes.',
    },
    {
      icon: <Calendar className="h-6 w-6 text-blue-500" />,
      title: 'Calendario',
      description: 'Visualiza consultas y SNAs organizados por fecha.',
    },
    {
      icon: <CalendarPlus className="h-6 w-6 text-emerald-500" />,
      title: 'Consultas Médicas',
      description: 'Registra y gestiona consultas con datos completos del paciente.',
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
      title: 'SNAs',
      description: 'Gestiona Salidas No Acordadas con información detallada.',
    },
    {
      icon: <Clock className="h-6 w-6 text-yellow-500" />,
      title: 'Estados',
      description: 'Seguimiento visual: Agendada, Pendiente, Completa para consultas. Abierta, Cerrada para SNAs.',
    },
    {
      icon: <Search className="h-6 w-6 text-indigo-500" />,
      title: 'Búsqueda y Filtros',
      description: 'Encuentra información rápidamente por paciente, educador o estado.',
    },
    {
      icon: <Share2 className="h-6 w-6 text-teal-500" />,
      title: 'Compartir',
      description: 'Comparte información por WhatsApp y genera PDFs.',
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-green-500" />,
      title: 'Reportes',
      description: 'Métricas y análisis de tendencias mensuales.',
    }
  ];

  const workflowSteps = [
    {
      step: "1",
      title: "Acceso",
      description: "Ingresa al sistema con tu usuario."
    },
    {
      step: "2", 
      title: "Página de Inicio",
      description: "Revisa las métricas del mes en la página principal."
    },
    {
      step: "3",
      title: "Gestionar", 
      description: "Accede a consultas médicas o SNAs según necesites."
    },
    {
      step: "4",
      title: "Visualizar",
      description: "Usa tarjetas, calendario o tabla para ver los datos."
    },
    {
      step: "5", 
      title: "Buscar",
      description: "Filtra por paciente, educador o estado."
    },
    {
      step: "6",
      title: "Compartir",
      description: "Comparte información o genera reportes PDF."
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <PageHeader title="¿Cómo funciona?" showBackButton={true} backUrl="/" />

        {/* Introducción */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-4">
              <p className="text-gray-700 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
                Sistema de gestión integral para centros CAFF que combina consultas médicas y Salidas No Acordadas (SNAs) en una plataforma unificada.
              </p>
              <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
                <span className="flex items-center gap-1 sm:gap-2">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Colaborativo</span>
                </span>
                <span className="flex items-center gap-1 sm:gap-2">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Tiempo real</span>
                </span>
                <span className="flex items-center gap-1 sm:gap-2">
                  <Smartphone className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Móvil</span>
                </span>
                <span className="flex items-center gap-1 sm:gap-2">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Integral</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flujo de Trabajo */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">¿Cómo Empezar?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowSteps.map((step, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Características */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">Características Principales</h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="flex flex-col text-center items-center p-4 sm:p-6 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border border-gray-100">
                <div className="mb-3 sm:mb-4 flex items-center justify-center rounded-full bg-primary/10 p-2 sm:p-3">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-headline text-sm sm:text-base font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 flex-grow leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Beneficios */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4 sm:mb-6">Beneficios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Ahorro de Tiempo</h3>
                <p className="text-xs sm:text-sm text-gray-600">Gestión centralizada reduce tareas administrativas</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Trabajo en Equipo</h3>
                <p className="text-xs sm:text-sm text-gray-600">Acceso compartido para colaboración eficiente</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Análisis de Datos</h3>
                <p className="text-xs sm:text-sm text-gray-600">Métricas para tomar decisiones informadas</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Gestión Unificada</h3>
                <p className="text-xs sm:text-sm text-gray-600">Una plataforma para consultas y SNAs</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Seguimiento Especializado</h3>
                <p className="text-xs sm:text-sm text-gray-600">Sistema para casos con constatación de lesiones</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Control de Retiro</h3>
                <p className="text-xs sm:text-sm text-gray-600">Seguimiento completo del proceso de retiro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
