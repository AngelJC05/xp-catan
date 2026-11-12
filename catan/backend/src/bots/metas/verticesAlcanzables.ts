import type { Tablero } from "../../schemas/Tablero.js";
import { aristasDelVertice, extremosDeArista } from "../../functions/aristas.js";

//? Devuelve a cuantos caminos nuevos esta cada vertice al que el bot puede llegar desde lo que ya tiene
//? Un camino propio no cuenta como nuevo, uno libre suma 1, y los de un rival o sus construcciones bloquean el paso
export function verticesAlcanzables(tablero: Tablero, sessionId: string, maxCaminosNuevos: number): Map<string, number> {
    const costos = new Map<string, number>();
    const porRevisar: string[] = [];

    //? Anota el vertice si se puede llegar a el y si es la forma mas barata encontrada hasta ahora
    function alcanzar(vertice: string, caminosNuevos: number): void {
        if (caminosNuevos > maxCaminosNuevos) return;

        const dueno = tablero.vertices.get(vertice)?.propietario;
        if (dueno === undefined || (dueno !== "" && dueno !== sessionId)) return;
        if ((costos.get(vertice) ?? Infinity) <= caminosNuevos) return;

        costos.set(vertice, caminosNuevos);
        porRevisar.push(vertice);
    }

    for (const [clave, vertice] of tablero.vertices) {
        if (vertice.propietario === sessionId) alcanzar(clave, 0);
    }

    for (const [clave, arista] of tablero.aristas) {
        if (arista.propietario !== sessionId) continue;
        for (const extremo of extremosDeArista(clave)) alcanzar(extremo, 0);
    }

    while (porRevisar.length > 0) {
        const vertice = porRevisar.shift() as string;
        const caminosNuevos = costos.get(vertice) as number;

        for (const clave of aristasDelVertice(vertice)) {
            const arista = tablero.aristas.get(clave);
            if (!arista || (arista.propietario !== "" && arista.propietario !== sessionId)) continue;

            const [a, b] = extremosDeArista(clave);
            const suma = arista.propietario === sessionId ? 0 : 1;
            alcanzar(a === vertice ? b : a, caminosNuevos + suma);
        }
    }

    return costos;
}
