/*
 * Copiado de backend/src/timers/tiempos.ts y backend/src/rooms/configuracion/puntosParaGanar.ts.
 *
 * El backend solo acepta estas opciones al configurar la sala (msgConfigurarSala).
 * Si cambias una lista o un valor por defecto en el backend, actualiza este
 * archivo para mantener ambos lados sincronizados.
 */

// Segundos que se pueden elegir para cada temporizador. Los que tienen una sola
// opcion no se pueden cambiar.
export const TIEMPOS_PERMITIDOS = {
  preconstruccion: [20, 40, 45, 60],
  dados: [15],
  acciones: [30, 60, 90, 120, 150],
  oferta: [20],
  ladron: [20],
  robo: [20],
  descarte: [15, 30],
} as const;

export const PUNTOS_MINIMOS = 5;
export const PUNTOS_MAXIMOS = 15;

// schemas/Configuracion.ts: lo que elige el creador en la sala de espera.
export interface ConfiguracionSala {
  preconstruccion: number;
  dados: number;
  acciones: number;
  oferta: number;
  ladron: number;
  robo: number;
  descarte: number;
  puntos: number;
}

// Valores que trae toda sala nueva, mientras llega el estado del servidor.
export const CONFIGURACION_POR_DEFECTO: ConfiguracionSala = {
  preconstruccion: 45,
  dados: 15,
  acciones: 90,
  oferta: 20,
  ladron: 20,
  robo: 20,
  descarte: 30,
  puntos: 10,
};
