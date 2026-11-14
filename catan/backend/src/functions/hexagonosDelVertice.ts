import { MapSchema } from "@colyseus/schema";
import { Vertice } from "../schemas/Vertices.js";
import { Hexagono } from "../schemas/Hexagono.js";

//? Devuelve los hexagonos que toca un vertice: 3 dentro del tablero y 1 o 2 en la orilla
//? Es lo contrario de verticesDelHexagono, con las mismas coordenadas
export function hexagonosDelVertice(
    hexagonos: MapSchema<Hexagono>,
    vertice: Vertice
): Hexagono[] {
    const { h, d, p } = vertice;

    //* El vertice de arriba (p = 0) y el de abajo (p = 1) tocan hexagonos distintos
    const keys = p === 0
        ? [`${h},${d}`, `${h + 1},${d - 1}`, `${h},${d - 1}`]
        : [`${h},${d}`, `${h},${d - 1}`, `${h - 1},${d}`];

    //* Si existe el hexagono se agrega al arreglo
    const hexagonosEncontrados: Hexagono[] = [];
    keys.forEach((key) => {
        const hexagono = hexagonos.get(key);
        if (hexagono) hexagonosEncontrados.push(hexagono);
    });

    return hexagonosEncontrados;
}
