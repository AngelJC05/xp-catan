import { MapSchema } from "@colyseus/schema";
import { Vertice } from "../schemas/Vertices.js";
import { verticesValidosPreconstruccion } from "./verticesValidosPreconstruccion.js";

//? Elige al azar un vertice valido para el asentamiento
export function elegirAsentamientoPreconstruccion(vertices: MapSchema<Vertice>): string {
    //* Obtener todos los vertices validos para el asentamiento
    const verticesValidos = verticesValidosPreconstruccion(vertices);

    //* Vacio si no hay opciones de vertices validos
    if(verticesValidos.length === 0) return ""; 

    //* Obtener aleatoriamente uno
    return verticesValidos[Math.floor(Math.random() * verticesValidos.length)];
}
