import { MapSchema } from "@colyseus/schema";
import { Arista } from "../schemas/Arista.js";
import { Vertice } from "../schemas/Vertices.js";

//? Devuelve la longitud del camino mas largo de un jugador
export function longitudCaminoMasLargo(
    vertices: MapSchema<Vertice>,
    aristas: MapSchema<Arista>,
    sessionId: string
): number {
    
    //* Claves de los caminos propios del jugador
    const mias = new Set<string>();
    aristas.forEach((arista, clave) => {
        if (arista.propietario === sessionId) mias.add(clave);
    });
    if (mias.size === 0) return 0;  //? Caso de 0 caminos

    //* Se prueba cada camino propio como inicio y se queda el recorrido mas largo
    let mayor = 0;
    for (const inicial of mias) {
        const usadas = new Set<string>([inicial]);
        const [a, b] = extremos(inicial);

        const largo = 1 + Math.max(
            explorar(a, vertices, sessionId, mias, usadas),
            explorar(b, vertices, sessionId, mias, usadas)
        );
        mayor = Math.max(mayor, largo);
        
        if(mayor === mias.size) return mayor; //? No puede haber uno que supere
    }
    return mayor;
}


function explorar(
    vertice: string,
    vertices: MapSchema<Vertice>,
    sessionId: string,
    mias: Set<string>,
    usadas: Set<string>
): number {

    //* Una construccion rival en el vertice corta la cadena
    const construccion = vertices.get(vertice);
    if (construccion && construccion.propietario !== "" && construccion.propietario !== sessionId) {
        return 0;
    }

    let mejor = 0;
    for (const clave of aristasDelVertice(vertice)) {
        if (!mias.has(clave) || usadas.has(clave)) continue;

        usadas.add(clave);
        const [a, b] = extremos(clave);
        const otroExtremo = a === vertice ? b : a;
        mejor = Math.max(mejor, 1 + explorar(otroExtremo, vertices, sessionId, mias, usadas));
        usadas.delete(clave);
    }
    return mejor;
}

//* Devuelve clave de los 2 vertices que une una carretera
function extremos(clave: string): [string, string] {
    const [h, d, p] = clave.split(",").map(Number);
    if (p === 0) return [`${h},${d},0`, `${h + 1},${d},1`];
    if (p === 1) return [`${h},${d},0`, `${h},${d},1`];
    return [`${h},${d},1`, `${h - 1},${d + 1},0`];
}

//* Devuelve las claves de las carreteras que tocan un vertice
function aristasDelVertice(clave: string): string[] {
    const [h, d, p] = clave.split(",").map(Number);
    if (p === 0) return [`${h},${d},0`, `${h},${d},1`, `${h + 1},${d - 1},2`];
    return [`${h},${d},1`, `${h},${d},2`, `${h - 1},${d},0`];
}
