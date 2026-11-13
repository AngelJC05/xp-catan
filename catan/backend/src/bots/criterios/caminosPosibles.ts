import { aristasDelVertice, extremosDeArista } from "../../functions/aristas.js";
import type { Tablero } from "../../schemas/Tablero.js";

//? Los caminos libres que tocan una construccion propia o el final de un camino propio
//? Un vertice con una construccion rival no sirve para seguir: ese camino estaria bloqueado
export function caminosPosibles(tablero: Tablero, sessionId: string): string[] {
    const puntos = new Set<string>();

    for (const [clave, vertice] of tablero.vertices) {
        if (vertice.propietario === sessionId) puntos.add(clave);
    }

    for (const [clave, arista] of tablero.aristas) {
        if (arista.propietario !== sessionId) continue;

        for (const extremo of extremosDeArista(clave)) {
            const dueno = tablero.vertices.get(extremo)?.propietario;
            if (dueno === "" || dueno === sessionId) puntos.add(extremo);
        }
    }

    const posibles = new Set<string>();
    for (const punto of puntos) {
        for (const clave of aristasDelVertice(punto)) {
            if (tablero.aristas.get(clave)?.propietario === "") posibles.add(clave);
        }
    }

    return [...posibles];
}
