import type { Tablero } from "../../schemas/Tablero.js";
import { aristasDelVertice, extremosDeArista } from "../../functions/aristas.js";

//? Se puede construir en un vertice libre que no tenga construcciones en los vertices vecinos
export function esConstruible(tablero: Tablero, vertice: string): boolean {
    if (tablero.vertices.get(vertice)?.propietario !== "") return false;

    return aristasDelVertice(vertice).every((clave) => {
        if (!tablero.aristas.has(clave)) return true;
        const [a, b] = extremosDeArista(clave);
        const vecino = tablero.vertices.get(a === vertice ? b : a);
        return !vecino || vecino.propietario === "";
    });
}
