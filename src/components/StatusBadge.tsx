import { Badge } from '@/components/ui/badge';
import type { Consulta, SNA } from '@/lib/types';

type StatusBadgeProps = {
  status: Consulta['estado'] | SNA['estado'];
};

export function StatusBadge({ status }: StatusBadgeProps) {
  // Mapeo para estados de consultas
  const consultaVariants = {
    Agendada: 'default',
    Pendiente: 'secondary',
    Completa: 'outline',
  };

  // Mapeo para estados de SNAs
  const snaVariants = {
    Abierta: 'secondary',
    Cerrada: 'outline',
  };

  const variant = consultaVariants[status as keyof typeof consultaVariants] || 
                  snaVariants[status as keyof typeof snaVariants] || 
                  'default';

  // Estilos para estados de consultas
  const consultaStyles = {
    Agendada: 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-500/30',
    Pendiente: 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-500/30',
    Completa: 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30',
  };

  // Estilos para estados de SNAs
  const snaStyles = {
    Abierta: 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-500/30',
    Cerrada: 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 border-gray-500/30',
  };

  const className = consultaStyles[status as keyof typeof consultaStyles] || 
                    snaStyles[status as keyof typeof snaStyles] || 
                    'bg-gray-500/20 text-gray-700';

  return <Badge variant={variant as any} className={className}>{status}</Badge>;
}
