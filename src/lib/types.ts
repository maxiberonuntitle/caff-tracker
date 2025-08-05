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

export type SNAStatus = 'Abierta' | 'Cerrada';

export type SNA = {
  id: string;
  nombreAdolescente: string;
  numeroDenuncia: string;
  fechaDenuncia: string;
  fechaCierre?: string;
  estado: SNAStatus;
  constatacionLesiones: boolean;
  retira?: string;
  comentarios?: string;
};
