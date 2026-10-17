import { MapSchema } from "@colyseus/schema";
import { Arista } from "../schemas/Arista.js";
import { Vertice } from "../schemas/Vertices.js";
import { Jugador } from "../schemas/Jugador.js";
import { Partida } from "../schemas/Partida.js";

//? Recalcula quien tiene el titulo de camino mas largo y actualiza puntaje
export function actualizarCaminoMasLargo(
    partida: Partida,
    vertices: MapSchema<Vertice>,
    aristas: MapSchema<Arista>,
    jugadores: MapSchema<Jugador>
): {
    error: boolean,
    mensaje: string
} {
    //* No implementada
   
    return { error: false, mensaje: "" };
}
