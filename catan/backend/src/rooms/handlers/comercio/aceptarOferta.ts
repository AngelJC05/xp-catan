import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { aceptarOfertaDeJugador } from "../../acciones/comercio/aceptarOfertaDeJugador.js";

//? Registra que un jugador acepto la oferta de intercambio activa y mueve los recursos
//? Asume que la respuesta ya fue validada por manejarResponderIntercambio
export function aceptarOferta(sala: CatanRoom, client: Client): void {
    const resultado = aceptarOfertaDeJugador(sala, client.sessionId);

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
    }
}
