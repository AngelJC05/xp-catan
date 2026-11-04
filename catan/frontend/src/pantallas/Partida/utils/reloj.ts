import { FASE_PRECONSTRUCCION } from '../../../common/fases';
import type { DatosPartida } from '../tipos/partida';

export interface RelojVisible {
  etiqueta: string;
  fin: number;
}

// Decide que reloj muestra el cronometro y con que texto. Devuelve null si no hay ninguno activo.
export function elegirRelojVisible(partida: DatosPartida | undefined): RelojVisible | null {
  if (!partida) return null;

  const preconstruccion = partida.relojes?.preconstruccion;
  if (preconstruccion) {
    const etiqueta = partida.fasePreconstruccion === FASE_PRECONSTRUCCION.CAMINO
      ? 'Camino'
      : 'Asentamiento';
    return { etiqueta, fin: preconstruccion.fin };
  }

  const dados = partida.relojes?.dados;
  if (dados) return { etiqueta: 'Dados', fin: dados.fin };

  const descarte = partida.relojes?.descarte;
  if (descarte) return { etiqueta: 'Descarte', fin: descarte.fin };

  const ladron = partida.relojes?.ladron;
  if (ladron) return { etiqueta: 'Ladron', fin: ladron.fin };
  
  const oferta = partida.relojes?.oferta;
  if (oferta) return { etiqueta: 'Oferta', fin: oferta.fin };

  return null;
}
