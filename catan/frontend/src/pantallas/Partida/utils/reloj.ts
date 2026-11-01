import { FASE_PRECONSTRUCCION } from '../../../common/fases';
import type { DatosPartida } from '../tipos/partida';

export interface RelojVisible {
  etiqueta: string;
  fin: number;
}

// Decide que reloj muestra el cronometro y con que texto. Devuelve null si no hay ninguno activo.
export function elegirRelojVisible(partida: DatosPartida | undefined): RelojVisible | null {
  const reloj = partida?.relojes?.preconstruccion;
  if (!partida || !reloj) return null;

  const etiqueta = partida.fasePreconstruccion === FASE_PRECONSTRUCCION.CAMINO
    ? 'Camino'
    : 'Asentamiento';

  return { etiqueta, fin: reloj.fin };
}
