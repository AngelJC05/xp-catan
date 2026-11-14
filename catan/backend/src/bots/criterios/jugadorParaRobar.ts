import { MapSchema } from "@colyseus/schema";
import { Jugador } from "../../schemas/Jugador.js";

//? Elige a quien le roba el bot de los que se pueden robar:
//? el de mas puntos, si empatan el de mas recursos y si siguen empatados al azar
//? Devuelve "" si no hay nadie a quien robar
export function jugadorParaRobar(
    jugadores: MapSchema<Jugador>,
    posibles: string[],
    azar: () => number = Math.random
): string {
    if (posibles.length === 0) return "";

    const puntos = (id: string) => jugadores.get(id)?.puntuacion ?? 0;
    const recursos = (id: string) => totalRecursos(jugadores.get(id));

    let empatados = mejores(posibles, puntos);
    empatados = mejores(empatados, recursos);

    return empatados[Math.floor(azar() * empatados.length)];
}

//? Los que tienen el valor mas alto segun una medida
function mejores(ids: string[], medida: (id: string) => number): string[] {
    const maximo = Math.max(...ids.map(medida));
    return ids.filter((id) => medida(id) === maximo);
}

//? Cuantas cartas de recurso tiene un jugador
function totalRecursos(jugador: Jugador | undefined): number {
    let total = 0;
    jugador?.recursos.forEach((cantidad) => { total += cantidad; });
    return total;
}
