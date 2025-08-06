import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Sparkles,
  CalendarDays,
  Activity,
  FileText,
  Search,
  Share,
  AlertCircle,
  ShieldCheck,
  UserPlus,
  Clock,
  Eye,
  Plus,
  Edit,
  CheckCircle,
  Heart,
  Target,
  BookOpen,
  Lightbulb,
  Users,
  BarChart3,
  AlertTriangle,
  Shield,
  Download,
  Zap,
  Smartphone,
  Rocket,
  Star,
  Award,
  TrendingUp,
  Globe,
  Lock,
  Sparkles as Magic,
  CalendarDays as Calendar,
  Activity as Pulse,
  FileText as Document,
  Search as MagnifyingGlass,
  Share as ShareIcon,
  AlertCircle as Warning,
  ShieldCheck as Security,
  UserPlus as AddUser,
  Clock as Time,
  FileText as Notes,
  Eye as View,
  Plus as Add,
  Edit as Pencil,
  CheckCircle as Check,
  Search as Find,
  Heart as Love,
  Target as Aim,
  BookOpen as Book,
  Lightbulb as Idea,
  Users as Group,
  BarChart3 as Stats,
  AlertTriangle as Alert,
  Shield as Secure,
  Download as Save,
  Zap as Lightning,
  Smartphone as Mobile,
  Rocket as Launch,
  Star as Favorite,
  Award as Trophy,
  TrendingUp as Growth,
  Globe as World,
  Lock as Privacy,
  Stethoscope,
  AlertTriangle as WarningIcon,
  Lightbulb as Bulb,
  Sparkles as Shine,
  Handshake,
  HelpCircle
} from 'lucide-react';

export default function ComoFuncionaPage() {
  const consultasFeatures = [
    {
      icon: <Magic className="h-6 w-6 text-blue-600" />,
      title: 'Registrar Consulta',
      description: 'Agrega una nueva consulta médica con todos los datos del adolescente: nombre, cédula, estudio y educador responsable.',
      action: 'Toca el botón "Nueva" en la página de Consultas'
    },
    {
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      title: 'Fechas Importantes',
      description: 'Establece la fecha de la consulta y la fecha de control para seguimiento.',
      action: 'Selecciona las fechas en el formulario'
    },
    {
      icon: <Pulse className="h-6 w-6 text-yellow-600" />,
      title: 'Estados de Consulta',
      description: 'Marca el estado: Agendada (programada), Pendiente (en proceso), Completa (finalizada).',
      action: 'Cambia el estado según avance la consulta'
    },
    {
      icon: <Document className="h-6 w-6 text-purple-600" />,
      title: 'Observaciones Médicas',
      description: 'Escribe las observaciones, diagnósticos, tratamientos y recomendaciones del médico.',
      action: 'Completa el campo de observaciones con detalles'
    },
    {
      icon: <MagnifyingGlass className="h-6 w-6 text-indigo-600" />,
      title: 'Buscar Consultas',
      description: 'Encuentra consultas por nombre del adolescente, educador o estado.',
      action: 'Usa los filtros en la parte superior'
    },
    {
      icon: <ShareIcon className="h-6 w-6 text-teal-600" />,
      title: 'Compartir Informe',
      description: 'Genera un PDF profesional de la consulta para compartir con otros profesionales.',
      action: 'Toca el botón de compartir en cada consulta'
    }
  ];

  const snasFeatures = [
    {
      icon: <Warning className="h-6 w-6 text-red-600" />,
      title: 'Registrar SNA',
      description: 'Documenta una Salida No Acordada con el nombre del adolescente y número de denuncia.',
      action: 'Toca el botón "Nueva" en la página de SNAs'
    },
    {
      icon: <Security className="h-6 w-6 text-orange-600" />,
      title: 'Constatación de Lesiones',
      description: 'Indica si se realizó constatación de lesiones (muy importante para el seguimiento).',
      action: 'Marca Sí o No según corresponda'
    },
    {
      icon: <AddUser className="h-6 w-6 text-emerald-600" />,
      title: 'Quien Retira',
      description: 'Registra el nombre de la persona que retira al adolescente (familiar, autoridad, etc.).',
      action: 'Completa el campo "Retira" con el nombre'
    },
    {
      icon: <Time className="h-6 w-6 text-yellow-600" />,
      title: 'Estados de SNA',
      description: 'Marca el estado: Abierta (en proceso), Cerrada (resuelta).',
      action: 'Actualiza el estado cuando se resuelva'
    },
    {
      icon: <Notes className="h-6 w-6 text-purple-600" />,
      title: 'Comentarios del Incidente',
      description: 'Describe las circunstancias, acciones tomadas y medidas preventivas.',
      action: 'Escribe detalles en el campo de comentarios'
    },
    {
      icon: <ShareIcon className="h-6 w-6 text-teal-600" />,
      title: 'Compartir Informe',
      description: 'Genera un PDF oficial de la SNA para autoridades o seguimiento.',
      action: 'Toca el botón de compartir en cada SNA'
    }
  ];

  const quickStartSteps = [
    {
      step: "1",
      icon: <Globe className="h-5 w-5" />,
      title: "Revisar el Inicio",
      description: "Ve a la página principal para ver un resumen de consultas y SNAs del mes actual."
    },
    {
      step: "2", 
      icon: <Rocket className="h-5 w-5" />,
      title: "Crear Nuevo Registro",
      description: "Toca 'Nueva' en Consultas o SNAs según lo que necesites registrar."
    },
    {
      step: "3",
      icon: <Star className="h-5 w-5" />,
      title: "Completar Información", 
      description: "Llena todos los campos del formulario con la información disponible."
    },
    {
      step: "4",
      icon: <Award className="h-5 w-5" />,
      title: "Guardar y Revisar",
      description: "Guarda el registro y verifica que la información esté correcta."
    },
    {
      step: "5", 
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Buscar cuando Necesites",
      description: "Usa los filtros para encontrar registros específicos rápidamente."
    },
    {
      step: "6",
      icon: <Lock className="h-5 w-5" />,
      title: "Compartir Informes",
      description: "Genera PDFs para compartir con otros profesionales o autoridades."
    }
  ];

  const tipsForEducators = [
    {
      icon: <Love className="h-5 w-5 text-red-500" />,
      title: "Mantén la Información Actualizada",
      description: "Actualiza los estados de consultas y SNAs regularmente para tener datos precisos."
    },
    {
      icon: <Aim className="h-5 w-5 text-blue-500" />,
      title: "Usa los Filtros",
      description: "Los filtros te ayudan a encontrar información específica sin revisar todo el listado."
    },
    {
      icon: <Book className="h-5 w-5 text-green-500" />,
      title: "Completa Todos los Campos",
      description: "Mientras más información registres, mejor será el seguimiento y los reportes."
    },
    {
      icon: <Idea className="h-5 w-5 text-yellow-500" />,
      title: "Revisa el Calendario",
      description: "El calendario te muestra visualmente las consultas y SNAs programadas por fecha."
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <PageHeader title="¿Cómo funciona el sistema?" showBackButton={true} backUrl="/" />

        {/* Inicio Rápido */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center flex items-center justify-center gap-2">
            <Launch className="h-8 w-8 text-blue-600" />
            Inicio Rápido - 6 Pasos Sencillos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickStartSteps.map((step, index) => (
              <Card key={index} className="bg-white/90 backdrop-blur-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {step.icon}
                        <h3 className="font-semibold text-gray-900 text-base">{step.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Funcionalidades de Consultas */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              Gestión de Consultas Médicas
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Aquí puedes registrar y gestionar todas las consultas médicas de los adolescentes.
            </p>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {consultasFeatures.map((feature, index) => (
              <Card key={index} className="bg-white/90 backdrop-blur-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center rounded-full bg-blue-50 p-2">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{feature.description}</p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-800 font-medium flex items-center gap-1">
                      <Bulb className="h-3 w-3" />
                      {feature.action}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Funcionalidades de SNAs */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <WarningIcon className="h-8 w-8 text-red-600" />
              Gestión de Salidas No Acordadas (SNAs)
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Documenta y da seguimiento a las salidas no acordadas de los adolescentes.
            </p>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {snasFeatures.map((feature, index) => (
              <Card key={index} className="bg-white/90 backdrop-blur-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center rounded-full bg-red-50 p-2">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{feature.description}</p>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs text-red-800 font-medium flex items-center gap-1">
                      <Bulb className="h-3 w-3" />
                      {feature.action}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Consejos para Educadores */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6 flex items-center justify-center gap-2">
              <Bulb className="h-8 w-8 text-yellow-600" />
              Consejos Útiles para Educadores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tipsForEducators.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 bg-white/70 p-4 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {tip.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
                    <p className="text-sm text-gray-600">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Beneficios */}
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200/50">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6 flex items-center justify-center gap-2">
              <Shine className="h-8 w-8 text-purple-600" />
              ¿Por qué usar este sistema?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center bg-white/70 p-4 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lightning className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Ahorra Tiempo</h3>
                <p className="text-sm text-gray-600">Todo en un solo lugar, sin papeles ni archivos físicos</p>
              </div>
              <div className="text-center bg-white/70 p-4 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Group className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Trabajo en Equipo</h3>
                <p className="text-sm text-gray-600">Todos los educadores pueden ver y actualizar la información</p>
              </div>
              <div className="text-center bg-white/70 p-4 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Stats className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Reportes Automáticos</h3>
                <p className="text-sm text-gray-600">Genera informes y estadísticas automáticamente</p>
              </div>
              <div className="text-center bg-white/70 p-4 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Alert className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Seguimiento Completo</h3>
                <p className="text-sm text-gray-600">Control total de consultas y SNAs en tiempo real</p>
              </div>
              <div className="text-center bg-white/70 p-4 rounded-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Privacy className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Información Segura</h3>
                <p className="text-sm text-gray-600">Datos protegidos y respaldados automáticamente</p>
              </div>
              <div className="text-center bg-white/70 p-4 rounded-lg">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Save className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">PDFs Profesionales</h3>
                <p className="text-sm text-gray-600">Genera informes en PDF para autoridades y seguimiento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacto de Soporte */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200/50">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
              <Handshake className="h-6 w-6 text-orange-600" />
              ¿Necesitas Ayuda?
            </h2>
            <p className="text-gray-700 mb-4">
              Si tienes dudas sobre cómo usar el sistema o encuentras algún problema, 
              no dudes en contactar al equipo técnico.
            </p>
            <div className="bg-white/70 p-4 rounded-lg inline-block">
              <p className="text-sm text-gray-600">
                <strong>Recuerda:</strong> El sistema está diseñado para ser fácil de usar. 
                Tómate tu tiempo para explorar las funciones.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
