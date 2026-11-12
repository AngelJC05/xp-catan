import type { Jugador } from "../../schemas/Jugador.js";
import type { Tablero } from "../../schemas/Tablero.js";
import type { Costo, TipoObjetivo } from "./costos.js";

//? Lo que el bot quiere conseguir: que es, en que vertice (vacio para la carta), lo que cuesta y lo que le falta y sobra
export interface Objetivo {
    tipo: TipoObjetivo;
    vertice: string;
    costo: Costo;
    falta: Costo;
    sobra: Costo;
}

//? Devuelve el primer objetivo posible segun la prioridad: ciudad, poblado, camino y carta
//? Se calcula con el tablero de ese momento, asi que si un rival invalida un vertice la siguiente vez sale otro
export function objetivoDelBot(tablero: Tablero, jugador: Jugador, sessionId: string): Objetivo {
    return { tipo: "carta", vertice: "", costo: {}, falta: {}, sobra: {} };
}
