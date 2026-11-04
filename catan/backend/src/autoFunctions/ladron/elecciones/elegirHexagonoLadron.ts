import { Tablero } from "../../../schemas/Tablero.js";

//? Elige al azar cualquier terreno distinto al que tiene el ladron y devuelve su posicion [h, d]
export function elegirHexagonoLadron(tablero: Tablero, azar: () => number = Math.random): [number, number] {
    //* Todos los terrenos menos el actual, incluido el desierto
    const opciones = Array.from(tablero.hexagonos.values()).filter((hexagono) =>
        hexagono.h !== tablero.ladron.h || hexagono.d !== tablero.ladron.d
    );

    const elegido = opciones[Math.floor(azar() * opciones.length)];
    return [elegido.h, elegido.d];
}
