import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { Desarrollo, FaseJuego, FasePartida } from "../../common/enums.js";
import { verticesDelHexagono } from "../../functions/verticesDelHexagono.js";
import { jugarCartaCaballero } from "../../rooms/acciones/cartas/jugarCartaCaballero.js";
import { hexagonoParaLadron } from "../criterios/hexagonoParaLadron.js";

//? Probabilidad de que el bot juegue el caballero en un turno aunque el ladron no lo afecte
export const PROBABILIDAD_CABALLERO = 0.3;

//? Bots de cada sala que ya probaron el 30% en este turno; se olvida al tirar los dados del siguiente
const yaProbaron = new WeakMap<CatanRoom, Set<string>>();

//? Juega la carta de caballero si el ladron afecta al bot o, si no, con un 30% una vez por turno
//? Mueve al ladron con criterio (#97); devuelve true si la jugo
export function accionCaballero(sala: CatanRoom, sessionId: string, azar: () => number = Math.random): boolean {
    if (!puedeJugarla(sala, sessionId)) return false;

    if (!ladronLoAfecta(sala, sessionId)) {
        //* El 30% se prueba una sola vez por turno, aunque el bot se despierte varias veces
        const probados = yaProbaron.get(sala) ?? new Set<string>();
        yaProbaron.set(sala, probados);

        if (probados.has(sessionId)) return false;
        probados.add(sessionId);

        if (azar() >= PROBABILIDAD_CABALLERO) return false;
    }

    const [h, d] = hexagonoParaLadron(sala.tablero, sala.jugadores, sessionId);
    return !jugarCartaCaballero(sala, sessionId, h, d).error;
}

//? Olvida que el bot ya probo el 30% para que lo vuelva a intentar en su nuevo turno
export function olvidarDecisionCaballero(sala: CatanRoom, sessionId: string): void {
    yaProbaron.get(sala)?.delete(sessionId);
}

//? Las mismas reglas que un jugador: su turno, la fase de acciones, sin otra carta usada y con la carta
function puedeJugarla(sala: CatanRoom, sessionId: string): boolean {
    const { partida } = sala;
    if (partida.fase !== FasePartida.JUEGO || partida.faseJuego !== FaseJuego.ACCIONES) return false;
    if (partida.turnoActual !== sessionId || !partida.cartaJugable) return false;

    const cartas = sala.jugadores.get(sessionId)?.cartas_usables.get(`${Desarrollo.CABALLERO}`) ?? 0;
    return cartas > 0;
}

//? El ladron afecta al bot si esta en un terreno que toca alguna de sus construcciones
function ladronLoAfecta(sala: CatanRoom, sessionId: string): boolean {
    const { tablero } = sala;
    const hexagono = tablero.hexagonos.get(`${tablero.ladron.h},${tablero.ladron.d}`);
    if (!hexagono) return false;

    return verticesDelHexagono(tablero.vertices, hexagono)
        .some((vertice) => vertice.propietario === sessionId);
}
