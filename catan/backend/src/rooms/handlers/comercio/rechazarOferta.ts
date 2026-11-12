import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { rechazarOfertaDeJugador } from "../../acciones/comercio/rechazarOfertaDeJugador.js";

//? Registra que un jugador rechazo la oferta de intercambio activa
//? Asume que la respuesta ya fue validada por manejarResponderIntercambio
export function rechazarOferta(sala: CatanRoom, client: Client): void {
    rechazarOfertaDeJugador(sala, client.sessionId);
}
