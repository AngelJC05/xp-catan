import type { Tablero } from "../../schemas/Tablero.js";

//? Devuelve a cuantos caminos nuevos esta cada vertice al que el bot puede llegar desde lo que ya tiene
//? Un camino propio no cuenta como nuevo, uno libre suma 1, y los de un rival o sus construcciones bloquean el paso
export function verticesAlcanzables(tablero: Tablero, sessionId: string, maxCaminosNuevos: number): Map<string, number> {
    return new Map();
}
