//* Datos de un jugador tal como los muestra la sala de espera

export interface JugadorVista {
  sessionId: string;
  nombre: string;
  color: number;
  score: number;
  esUsuarioActual: boolean;
  esSuTurno: boolean;
}
