import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { construirCaminoDeJugador } from "../../rooms/acciones/construccion/construirCaminoDeJugador.js";
import { caminosPosibles } from "../criterios/caminosPosibles.js";
import { elegirMejorCamino } from "../criterios/elegirMejorCamino.js";
import { objetivoDelBot } from "../metas/objetivoDelBot.js";

//? Construye un camino con el mejor criterio si su objetivo es un camino y ya le alcanzan los recursos
//? Devuelve true si construyo; con otro objetivo, sin recursos o sin camino posible no hace nada
export function accionConstruirCamino(sala: CatanRoom, sessionId: string, produccion?: Set<string>): boolean {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador) return false;

    const objetivo = objetivoDelBot(sala.tablero, jugador, sessionId, produccion, sala.banca);
    if (objetivo.tipo !== "camino" || Object.keys(objetivo.falta).length > 0) return false;

    const camino = elegirMejorCamino(sala.tablero, sessionId, caminosPosibles(sala.tablero, sessionId));
    if (camino === "") return false;

    const [h, d, p] = camino.split(",").map(Number);
    return !construirCaminoDeJugador(sala, sessionId, { h, d, p }).error;
}
