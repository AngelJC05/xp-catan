import { MapSchema } from "@colyseus/schema";
import { Arista } from "../schemas/Arista.js";
import { Vertice } from "../schemas/Vertices.js";
import { Jugador } from "../schemas/Jugador.js";
import { Partida } from "../schemas/Partida.js";
import { longitudCaminoMasLargo } from "./caminoMasLargo.js";

//? Longitud minima de camino para poder tener el titulo
const MINIMO_CAMINO = 5;

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
    

    //* Si nadie tiene el titulo, lo recibe quien tenga el camino mas largo
    if (partida.caminoMasLargo === "") {
        const candidato = mejorCandidato(jugadores);
        if (candidato !== "") {
            const jugador = jugadores.get(candidato);
            partida.caminoMasLargo = candidato;
            jugador.puntuacion += 2;
            jugador.puntosParaGanar -= 2;
            return {
                error: false,
                mensaje: `${jugador.nombre} ha obtenido el camino mas largo`
            };
        }
    }

    //! Pendiente: superacion por otro jugador y perdida por corte
    return {
        error: false,
        mensaje: ""
    };
}

//? Devuelve el sessionId del unico jugador con el camino mas largo de 5 o mas
function mejorCandidato(jugadores: MapSchema<Jugador>): string {
    let mejor = "";
    let mayor = MINIMO_CAMINO - 1;
    let empate = false;

    jugadores.forEach((jugador, sessionId) => {
        if (jugador.longitudCamino > mayor) {
            mejor = sessionId;
            mayor = jugador.longitudCamino;
            empate = false;
        } else if (jugador.longitudCamino === mayor && mejor !== "") {
            empate = true;
        }
    });

    return empate ? "" : mejor;
}
