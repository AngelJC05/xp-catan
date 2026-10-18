import { MapSchema } from "@colyseus/schema";
import { Arista } from "../schemas/Arista.js";
import { Vertice } from "../schemas/Vertices.js";
import { Jugador } from "../schemas/Jugador.js";
import { Partida } from "../schemas/Partida.js";
import { longitudCaminoMasLargo } from "./caminoMasLargo.js";

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
    
    //* Guardar en cada jugador la longitud de su camino mas largo
    jugadores.forEach((jugador, sessionId) => {
        jugador.longitudCamino = longitudCaminoMasLargo(vertices, aristas, sessionId);
    });
    
    

    //! Pendiente: decidir quien tiene el titulo
    return { error: false, mensaje: "" };
}
