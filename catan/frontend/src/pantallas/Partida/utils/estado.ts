import type { Room } from '@colyseus/sdk';
import type { EstadoCatan } from '../tipos/estado';

// room.state es un Schema de Colyseus: toJSON() lo vuelve un objeto plano con las claves de common/.
// Devuelve null mientras el estado no haya llegado completo.
export function leerEstado(sala: Room): EstadoCatan | null {
  const raiz = sala.state as { toJSON?: () => EstadoCatan } | undefined;
  if (!raiz?.toJSON) return null;
  const estado = raiz.toJSON();
  if (!estado.tablero || !estado.jugadores || !estado.partida || !estado.banca) return null;
  return estado;
}
