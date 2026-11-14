import type { Banca } from "../../schemas/Banca.js";
import type { Jugador } from "../../schemas/Jugador.js";

//? Cartas de cada recurso en todo el juego: empiezan todas en la banca
const RECURSOS_POR_TIPO = 19;

//? Cuantas cartas de un recurso tienen los demas jugadores juntos: lo que no esta en la banca ni en la mano del jugador
//? Se calcula viendo la banca, sin mirar las manos de los demas, como lo haria cualquier jugador
export function recursosDeLosDemas(banca: Banca, jugador: Jugador, recurso: string): number {
    return RECURSOS_POR_TIPO - (banca.recursos.get(recurso) ?? 0) - (jugador.recursos.get(recurso) ?? 0);
}
