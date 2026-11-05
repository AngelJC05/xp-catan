import { FASE_PRECONSTRUCCION } from '../../../common/fases';
import type { DatosPartida } from '../tipos/partida';

export interface RelojVisible {
  nombre: string;
  etiqueta: string;
  fin: number;
}

// Decide que relojes muestran los cronometros y con que texto. Devuelve una lista vacia si no hay ninguno activo.
// El de acciones va primero porque dura todo el turno; debajo se apila el especifico (robo u oferta) que corre sobre el.
export function elegirRelojesVisibles(partida: DatosPartida | undefined): RelojVisible[] {
  if (!partida) return [];

  const relojes: RelojVisible[] = [];

  const acciones = partida.relojes?.acciones;
  if (acciones) relojes.push({ nombre: 'acciones', etiqueta: 'Acciones', fin: acciones.fin });

  const especifico = elegirRelojEspecifico(partida);
  if (especifico) relojes.push(especifico);

  return relojes;
}

// Decide que reloj de una accion concreta se muestra. Devuelve null si no hay ninguno activo.
function elegirRelojEspecifico(partida: DatosPartida): RelojVisible | null {
  const preconstruccion = partida.relojes?.preconstruccion;
  if (preconstruccion) {
    const etiqueta = partida.fasePreconstruccion === FASE_PRECONSTRUCCION.CAMINO
      ? 'Camino'
      : 'Asentamiento';
    return { nombre: 'preconstruccion', etiqueta, fin: preconstruccion.fin };
  }

  const dados = partida.relojes?.dados;
  if (dados) return { nombre: 'dados', etiqueta: 'Dados', fin: dados.fin };

  const descarte = partida.relojes?.descarte;
  if (descarte) return { nombre: 'descarte', etiqueta: 'Descarte', fin: descarte.fin };

  const ladron = partida.relojes?.ladron;
  if (ladron) return { nombre: 'ladron', etiqueta: 'Ladron', fin: ladron.fin };

  const robo = partida.relojes?.robo;
  if (robo) return { nombre: 'robo', etiqueta: 'Robo', fin: robo.fin };

  const oferta = partida.relojes?.oferta;
  if (oferta) return { nombre: 'oferta', etiqueta: 'Oferta', fin: oferta.fin };

  return null;
}
