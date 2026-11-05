import { MapSchema } from "@colyseus/schema";
import { Arista } from "../../../schemas/Arista.js";

//? Elige al azar una arista libre pegada al ultimo asentamiento
export function elegirCaminoPreconstruccion(
    aristas: MapSchema<Arista>,
    ultimoAsentamiento: string
): string {
    //* Obtener las aristas pegadas al asentamiento que estan libres
    const aristasAdyacentes = getAristasAdyacentes(ultimoAsentamiento)
        .filter((arista) => aristas.get(arista)?.propietario === "");

    //* Si no hay ninguna se retorna vacio
    if(aristasAdyacentes.length === 0) return "";

    //* Elegir una al azar
    const index = Math.floor(Math.random() * aristasAdyacentes.length);
    return aristasAdyacentes[index];
}

function getAristasAdyacentes(vertice: string): string[] {
    const [h,d,p] = vertice.split(",").map(Number);
    switch(p) {
        case 0: 
            return [`${h},${d},0`, `${h},${d},1`, `${h+1},${d-1},2`];
        case 1:
            return [`${h},${d},1`, `${h},${d},2`, `${h-1},${d},0`];
        default:
            return [];
    }
}