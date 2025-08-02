import { Badge } from '@/components/ui/badge';
import type { Consulta } from '@/lib/types';

type StatusBadgeProps = {
  status: Consulta['estado'];
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = {
    Agendada: 'default',
    Pendiente: 'secondary',
    Completa: 'outline',
  }[status];

  const className = {
    Agendada: 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-500/30',
    Pendiente: 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-500/30',
    Completa: 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30',
  }[status];

  return <Badge variant={variant as any} className={className}>{status}</Badge>;
}
