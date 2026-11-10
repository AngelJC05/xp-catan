import { MapSchema } from "@colyseus/schema";
import { Hexagono } from "../../schemas/Hexagono.js";
import { Vertice } from "../../schemas/Vertices.js";
import { hexagonosDelVertice } from "../../functions/hexagonosDelVertice.js";

//? Valor desde el que un vertice vale la pena para el bot
export const VALOR_INTERES = 6;

//? Puntos de cada numero segun que tan probable es que salga en los dados; el desierto (0) no tiene
const PUNTOS_POR_NUMERO: Readonly<Record<number, number>> = {
    6: 5, 8: 5,
    5: 4, 9: 4,
    4: 3, 10: 3,
    3: 2, 11: 2,
    2: 1, 12: 1
};

//? Devuelve los puntos que da un numero de hexagono, o 0 si no da nada
export function puntosDelNumero(numero: number): number {
    return PUNTOS_POR_NUMERO[numero] ?? 0;
}

//? Suma los puntos de los hexagonos que toca un vertice
//? No toma en cuenta al ladron porque cambia de lugar; el valor del vertice es fijo
export function puntuarVertice(hexagonos: MapSchema<Hexagono>, vertice: Vertice): number {
    return hexagonosDelVertice(hexagonos, vertice)
        .reduce((suma, hexagono) => suma + puntosDelNumero(hexagono.numero), 0);
}

//? Indica si un vertice vale la pena: su valor llega a la constante de interes
export function esVerticeRelevante(hexagonos: MapSchema<Hexagono>, vertice: Vertice): boolean {
    return puntuarVertice(hexagonos, vertice) >= VALOR_INTERES;
}
