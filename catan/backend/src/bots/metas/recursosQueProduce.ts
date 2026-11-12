import type { Tablero } from "../../schemas/Tablero.js";

//? Puntos minimos de un numero para considerar que un terreno produce de verdad: deja fuera 2, 3, 11 y 12
export const PUNTOS_MINIMOS_PRODUCCION = 3;

//? Devuelve los recursos que producen las construcciones del jugador con un numero que salga lo suficiente
//? Los asentamientos y las ciudades cuentan igual; el desierto y el ladron no se toman en cuenta
export function recursosQueProduce(tablero: Tablero, sessionId: string): Set<string> {
    return new Set<string>();
}
