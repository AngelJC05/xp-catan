import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { registrarLogDeJugador, registrarLogSistema } from "../../ayudantes/notificaciones.js";

//? Registra que un jugador rechazo la oferta de intercambio activa
//? Asume que la respuesta ya fue validada por manejarResponderIntercambio
export function rechazarOferta(sala: CatanRoom, client: Client): void {
    const oferta = sala.partida.ofertaIntercambio;

    oferta.registrarRespuesta(client.sessionId, -1);
    registrarLogDeJugador(sala, client.sessionId, " ha rechazado la oferta de intercambio");

    //* Si todos rechazaron la oferta se cancela
    if (oferta.todosRechazaron()) {
        oferta.limpiarOferta();
        registrarLogSistema(sala, "Todos los jugadores han rechazado la oferta de intercambio");
    }
}
