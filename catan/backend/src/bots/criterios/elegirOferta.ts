import type { Costo } from "../metas/costos.js";

//? Cuantas cartas como maximo intercambia el bot en una oferta
export const MAXIMO_POR_OFERTA = 2;

//? Una oferta de intercambio del bot: lo que da y lo que pide
export interface OfertaDelBot {
    ofrecidos: Record<string, number>;
    solicitados: Record<string, number>;
}

//? Elige la oferta que el bot propone a los demas: pide lo que le falta y da lo que le sobra, parejo y con pocas cartas
//? Salta las que ya intento antes en el turno; devuelve null si no hay nada que ofrecer o ya probo todo
export function elegirOferta(_falta: Costo, _sobra: Costo, _intentadas: OfertaDelBot[]): OfertaDelBot | null {
    return null;
}
