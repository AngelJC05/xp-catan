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
        const candidato = mejorCandidato(jugadores, MINIMO_CAMINO);
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

    //* Si alguien supera al titular, le quita el titulo y los 2 puntos
    const titular = jugadores.get(partida.caminoMasLargo);
    if (titular) {
        const superador = mejorCandidato(
            jugadores,
            Math.max(MINIMO_CAMINO, titular.longitudCamino + 1)
        );
        if (superador !== "") {
            const nuevo = jugadores.get(superador);
            titular.puntuacion -= 2;
            titular.puntosParaGanar += 2;
            nuevo.puntuacion += 2;
            nuevo.puntosParaGanar -= 2;
            partida.caminoMasLargo = superador;
            return {
                error: false,
                mensaje: `${nuevo.nombre} ha quitado el camino mas largo a ${titular.nombre}`
            };
        }
    }

    //! Pendiente: perdida del titulo por un corte
    return {
        error: false,
        mensaje: ""
    };
}

//? Devuelve el sessionId del unico jugador con el camino mas largo, empate devuelve ""
function mejorCandidato(jugadores: MapSchema<Jugador>, minimo: number): string {
    let mejor = "";
    let mayor = 0;
    let empate = false;

    jugadores.forEach((jugador, sessionId) => {
        if (jugador.longitudCamino < minimo) return;

        if (jugador.longitudCamino > mayor) {
            mejor = sessionId;
            mayor = jugador.longitudCamino;
            empate = false;
        } else if (jugador.longitudCamino === mayor) {
            empate = true;
        }
    });

    return empate ? "" : mejor;
}
