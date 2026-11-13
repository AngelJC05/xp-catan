import type { CatanRoom } from "../../rooms/CatanRoom.js";

//? Cuantas ofertas de intercambio puede proponer un bot en un turno
export const MAXIMO_OFERTAS_POR_TURNO = 3;

//? Propone una oferta de intercambio a los demas con lo que le falta y le sobra para su objetivo
//? Devuelve true si la propuso
export function accionOfertar(_sala: CatanRoom, _sessionId: string, _produccion?: Set<string>): boolean {
    return false;
}
