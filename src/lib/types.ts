export type ConsultaStatus = 'Agendada' | 'Pendiente' | 'Completa';

export type Consulta = {
  id: string;
  nombre: string;
  cedula: string;
  fechaConsulta: string;
  fechaControl: string;
  estudio: string;
  educador: string;
  observaciones?: string;
  estado: ConsultaStatus;
};
