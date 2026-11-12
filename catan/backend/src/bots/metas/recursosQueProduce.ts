import { recursoTexto } from "../../common/recursoTexto.js";
import { hexagonosDelVertice } from "../../functions/hexagonosDelVertice.js";
import type { Tablero } from "../../schemas/Tablero.js";
import { puntosDelNumero } from "../criterios/puntuarVertice.js";

//? Puntos minimos de un numero para considerar que un terreno produce de verdad: deja fuera 2, 3, 11 y 12
export const PUNTOS_MINIMOS_PRODUCCION = 3;

//? Devuelve los recursos que producen las construcciones del jugador con un numero que salga lo suficiente
//? Los asentamientos y las ciudades cuentan igual; el desierto y el ladron no se toman en cuenta
export function recursosQueProduce(tablero: Tablero, sessionId: string): Set<string> {
    const recursos = new Set<string>();

    for (const vertice of tablero.vertices.values()) {
        if (vertice.propietario !== sessionId) continue;

        for (const hexagono of hexagonosDelVertice(tablero.hexagonos, vertice)) {
            if (puntosDelNumero(hexagono.numero) < PUNTOS_MINIMOS_PRODUCCION) continue;
            recursos.add(recursoTexto(hexagono.terreno));
        }
    }

    return recursos;
}
