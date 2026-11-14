import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { aceptarOfertaDeJugador } from "../../rooms/acciones/comercio/aceptarOfertaDeJugador.js";
import { rechazarOfertaDeJugador } from "../../rooms/acciones/comercio/rechazarOfertaDeJugador.js";
import { convieneOferta } from "../criterios/convieneOferta.js";
import { objetivoDelBot } from "../metas/objetivoDelBot.js";

//? Responde la oferta de intercambio activa: la acepta si le sirve para su objetivo y solo da lo que le sobra
export function decidirOferta(sala: CatanRoom, sessionId: string): void {
    const jugador = sala.jugadores.get(sessionId);
    const oferta = sala.partida.ofertaIntercambio;

    //* Solo responde si hay una oferta esperando su respuesta
    if (!jugador || oferta.jugador === "" || oferta.respuestas.get(sessionId) !== 0) return;

    const { falta, sobra } = objetivoDelBot(sala.tablero, jugador, sessionId, undefined, sala.banca);
    const ofrecidos = Object.fromEntries(oferta.recursosOfrecidos.entries());
    const solicitados = Object.fromEntries(oferta.recursosSolicitados.entries());

    if (convieneOferta(falta, sobra, ofrecidos, solicitados)) {
        aceptarOfertaDeJugador(sala, sessionId);
    } else {
        rechazarOfertaDeJugador(sala, sessionId);
    }
}
