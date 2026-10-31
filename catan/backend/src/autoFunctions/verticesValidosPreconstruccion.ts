import { MapSchema } from "@colyseus/schema";
import { Vertice } from "../schemas/Vertices.js";

//? Devuelve las posiciones de los vertices donde se puede colocar un asentamiento en la preconstruccion
export function verticesValidosPreconstruccion(vertices: MapSchema<Vertice>): string[] {
    //* Todos los vertices son validos por defecto
    const verticesValidos: string[] = Array.from(vertices.keys());

    //* Eliminar los vertices que no son validos por los existentes
    vertices.forEach((vertice, key) => {
        //* Vertices sin propietario no afectan
        if(vertice.propietario === "") return;

        //* Elimiar el vertice ocupado
        if(verticesValidos.indexOf(key) === -1) return;
        verticesValidos.splice(verticesValidos.indexOf(key), 1);

        //* Eliminar los vertices vecinos
        getVerticesVecinos(key).forEach((vecino) => {
            const index = verticesValidos.indexOf(vecino);
            if(index !== -1) verticesValidos.splice(index, 1);
        })
    })
    return verticesValidos;
}

function getVerticesVecinos(vertice: string): string[] {
    const [h,d,p] = vertice.split(",").map(Number);
    switch(p) {
        case 0: return [`${h},${d},1`, `${h+1},${d},1`, `${h+1},${d-1},1`];
        case 1: return [`${h},${d},0`, `${h-1},${d},0`, `${h-1},${d+1},0`];
        default: return [];
    }
}