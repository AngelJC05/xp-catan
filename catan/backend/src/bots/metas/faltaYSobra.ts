import type { Jugador } from "../../schemas/Jugador.js";
import type { Costo } from "./costos.js";

//? Compara lo que tiene el jugador con lo que pide un costo: lo que le falta y lo que le sobra
//? Solo aparecen los recursos con cantidad mayor a 0
export function faltaYSobra(jugador: Jugador, costo: Costo): { falta: Costo, sobra: Costo } {
    return { falta: {}, sobra: {} };
}
