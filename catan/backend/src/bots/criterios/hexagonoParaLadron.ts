import { MapSchema } from "@colyseus/schema";
import { Hexagono } from "../../schemas/Hexagono.js";
import { Jugador } from "../../schemas/Jugador.js";
import { Tablero } from "../../schemas/Tablero.js";
import { verticesDelHexagono } from "../../functions/verticesDelHexagono.js";
import { puntosDelNumero } from "./puntuarVertice.js";

//? Elige donde pone el bot al ladron, siguiendo los criterios en orden:
//? 1. un terreno sin construcciones propias, 2. que afecte al rival con mas puntos, 3. el de numero mas probable
//? Devuelve la posicion [h, d]; nunca es donde ya esta el ladron
export function hexagonoParaLadron(
    tablero: Tablero,
    jugadores: MapSchema<Jugador>,
    sessionId: string
): [number, number] {
    //* Todos los terrenos menos donde ya esta el ladron
    let opciones = Array.from(tablero.hexagonos.values()).filter((hexagono) =>
        hexagono.h !== tablero.ladron.h || hexagono.d !== tablero.ladron.d
    );

    //* 1. Sin construcciones propias; si todos tienen, se queda con todos
    opciones = filtrarSiQueda(opciones, (hexagono) =>
        !propietariosDe(tablero, hexagono).has(sessionId));

    //* 2. Que toque al rival con mas puntos (o a los que empaten); si ninguno lo toca, se queda con todos
    const lideres = rivalesConMasPuntos(jugadores, sessionId);
    opciones = filtrarSiQueda(opciones, (hexagono) =>
        [...propietariosDe(tablero, hexagono)].some((propietario) => lideres.has(propietario)));

    //* 3. El de numero mas probable; en un empate el primero
    const elegido = opciones.reduce((mejor, hexagono) =>
        puntosDelNumero(hexagono.numero) > puntosDelNumero(mejor.numero) ? hexagono : mejor);

    return [elegido.h, elegido.d];
}

//? Aplica un criterio solo si deja alguna opcion, para que el bot siempre tenga donde poner al ladron
function filtrarSiQueda(opciones: Hexagono[], criterio: (hexagono: Hexagono) => boolean): Hexagono[] {
    const filtradas = opciones.filter(criterio);
    return filtradas.length > 0 ? filtradas : opciones;
}

//? Los jugadores con construcciones alrededor de un terreno
function propietariosDe(tablero: Tablero, hexagono: Hexagono): Set<string> {
    return new Set(verticesDelHexagono(tablero.vertices, hexagono)
        .map((vertice) => vertice.propietario)
        .filter((propietario) => propietario !== ""));
}

//? Los rivales que tienen la puntuacion mas alta, sin contar al bot
function rivalesConMasPuntos(jugadores: MapSchema<Jugador>, sessionId: string): Set<string> {
    const rivales = [...jugadores.entries()].filter(([id]) => id !== sessionId);
    const maximo = Math.max(...rivales.map(([, jugador]) => jugador.puntuacion));

    return new Set(rivales
        .filter(([, jugador]) => jugador.puntuacion === maximo)
        .map(([id]) => id));
}
