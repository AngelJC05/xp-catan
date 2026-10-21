import { RECURSOS } from './jugador';

export interface DatosPartida {
  creador: string;
  fase: number;
  fasePreconstruccion: number;
  faseJuego: number;
  direccionPreconstruccion: number;
  turnoActual: string;
  ordenJugadores: string[];
  jugadoresParaRobar: string[];
  jugadoresParaDescartar: Record<string, number>;
  cartaJugable: boolean;
  ganador: string;
  ejercitoMasGrande: string;
  caminoMasLargo: string;
  carreterasGratis: number;
  ofertaIntercambio: Oferta;
}

/* schemas/OfertaIntercambio.ts — un jugador propone cambiar recursos y los
   demas votan. */
export interface Oferta {
  jugador: string;
  respuestas: Record<string, number>;
  recursosOfrecidos: Record<string, number>;
  recursosSolicitados: Record<string, number>;
}

// Texto de un lado de la oferta, por ejemplo "1 madera, 2 trigo y 1 lana".
export function describirRecursos(recursos: Record<string, number> | undefined): string {
  const partes = RECURSOS
    .filter((r) => (recursos?.[r] ?? 0) > 0)
    .map((r) => `${recursos?.[r]} ${r}`);
  if (partes.length <= 1) return partes[0] ?? '';
  return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
}