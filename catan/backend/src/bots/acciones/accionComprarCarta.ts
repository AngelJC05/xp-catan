import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { comprarCartaDeJugador } from "../../rooms/acciones/cartas/comprarCartaDeJugador.js";
import { COSTOS } from "../metas/costos.js";
import { objetivoDelBot } from "../metas/objetivoDelBot.js";

const RECURSOS_DE_LA_CARTA = Object.keys(COSTOS.carta);

//? Compra una carta de desarrollo si es su objetivo o si pagarla no le quita nada de lo que necesita para su objetivo
//? Devuelve true si compro; sin recursos o con el mazo vacio no hace nada
export function accionComprarCarta(sala: CatanRoom, sessionId: string, produccion?: Set<string>): boolean {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador || sala.banca.cartas.length === 0) return false;

    const objetivo = objetivoDelBot(sala.tablero, jugador, sessionId, produccion);

    //* Con otro objetivo solo compra con lo que le sobra de el, para no quitarle nada
    const puedeComprar = objetivo.tipo === "carta"
        ? Object.keys(objetivo.falta).length === 0
        : RECURSOS_DE_LA_CARTA.every((recurso) => (objetivo.sobra[recurso] ?? 0) >= 1);

    return puedeComprar && !comprarCartaDeJugador(sala, sessionId).error;
}
