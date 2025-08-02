import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, CalendarPlus, Edit, Trash2, Clock, CheckCircle, Share2, Search, BarChart3, Printer } from 'lucide-react';

export default function ComoFuncionaPage() {
  const features = [
    {
      icon: <ClipboardList className="h-6 w-6 text-primary" />,
      title: 'Gestión Centralizada',
      description: 'Registra y organiza todas las consultas médicas en un solo lugar. Accede al historial completo de cada joven de forma rápida y segura.',
    },
    {
      icon: <CalendarPlus className="h-6 w-6 text-green-500" />,
      title: 'Agendar y Registrar',
      description: 'Programa citas futuras, registra consultas ya realizadas y actualiza el estado (Agendada, Pendiente, Completa) para un seguimiento preciso.',
    },
    {
      icon: <Clock className="h-6 w-6 text-yellow-500" />,
      title: 'Fechas de Control',
      description: 'Establece y modifica una "fecha de control" como un recordatorio personal para el educador, asegurando que ningún seguimiento importante se pierda.',
    },
    {
      icon: <Edit className="h-6 w-6 text-blue-500" />,
      title: 'Edita con Facilidad',
      description: '¿Hubo un cambio de fecha o un error en el registro? Modifica los detalles de cualquier consulta médica en segundos para mantener la información siempre actualizada.',
    },
    {
      icon: <Trash2 className="h-6 w-6 text-destructive" />,
      title: 'Elimina Registros',
      description: 'Si una consulta se cancela o se registró por error, puedes eliminarla permanentemente del sistema para mantener la base de datos limpia y precisa.',
    },
     {
      icon: <Search className="h-6 w-6 text-purple-500" />,
      title: 'Búsqueda y Filtrado Avanzado',
      description: 'Encuentra rápidamente la información que necesitas utilizando filtros por estado, tipo de estudio, fecha, educador o nombre de la paciente.',
    },
    {
      icon: <Share2 className="h-6 w-6 text-teal-500" />,
      title: 'Comparte Información',
      description: 'Comparte un resumen detallado de la consulta a través de WhatsApp con un solo clic, facilitando la comunicación con otros profesionales o responsables.',
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-orange-500" />,
      title: 'Dashboard Interactivo',
      description: 'Visualiza un resumen rápido de las métricas más importantes, como el total de consultas y su estado, con gráficos intuitivos que muestran tendencias a lo largo del tiempo.',
    },
    {
      icon: <Printer className="h-6 w-6 text-indigo-500" />,
      title: 'Reportes Flexibles',
      description: 'Genera e imprime reportes personalizados. Elige entre una vista de tarjetas para un resumen visual o una tabla detallada para informes completos.',
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <PageHeader title="¿Cómo funciona?" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col text-center items-center p-4 hover:shadow-lg transition-shadow duration-300">
                <div className="mb-3 flex items-center justify-center rounded-full bg-primary/10 p-2.5">
                    {feature.icon}
                </div>
                <h3 className="mb-1.5 font-headline text-sm font-semibold">{feature.title}</h3>
                <p className="text-xs text-muted-foreground flex-grow">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
