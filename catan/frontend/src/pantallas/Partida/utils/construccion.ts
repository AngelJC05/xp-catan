import type { TipoConstruccion } from '../componentes/Construir/Construir';

export const MENSAJE_CONSTRUIR: Partial<Record<TipoConstruccion, string>> = {
  poblado: 'msgColocarAsentamiento',
  camino: 'msgColocarCamino',
  ciudad: 'msgColocarCiudad',
};
