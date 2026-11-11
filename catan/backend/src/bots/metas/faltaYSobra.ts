import type { Jugador } from "../../schemas/Jugador.js";
import type { Costo } from "./costos.js";

//? Compara lo que tiene el jugador con lo que pide un costo: lo que le falta y lo que le sobra
//? Solo aparecen los recursos con cantidad mayor a 0
export function faltaYSobra(jugador: Jugador, costo: Costo): { falta: Costo, sobra: Costo } {
    const falta: Costo = {};
    const sobra: Costo = {};

    const recursos = new Set([...jugador.recursos.keys(), ...Object.keys(costo)]);

    for (const recurso of recursos) {
        const diferencia = (jugador.recursos.get(recurso) ?? 0) - (costo[recurso] ?? 0);

        if (diferencia < 0) falta[recurso] = -diferencia;
        if (diferencia > 0) sobra[recurso] = diferencia;
    }

    return { falta, sobra };
}
