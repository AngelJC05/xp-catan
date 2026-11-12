import type { CatanRoom } from "../../CatanRoom.js";
import { registrarLogDeJugador, registrarLogSistema } from "../../ayudantes/notificaciones.js";
import { cerrarOferta } from "./cerrarOferta.js";

//? Un jugador rechaza la oferta de intercambio activa; si ya todos la rechazaron se cancela
//? Esta separado del mensaje para que tambien lo pueda usar un bot
export function rechazarOfertaDeJugador(sala: CatanRoom, sessionId: string): void {
    const oferta = sala.partida.ofertaIntercambio;

    oferta.registrarRespuesta(sessionId, -1);
    registrarLogDeJugador(sala, sessionId, " ha rechazado la oferta de intercambio");

    //* Si todos rechazaron la oferta se cancela
    if (oferta.todosRechazaron()) {
        cerrarOferta(sala);
        registrarLogSistema(sala, "Todos los jugadores han rechazado la oferta de intercambio");
    }
}
