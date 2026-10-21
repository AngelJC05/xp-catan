import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { aunNoRespondio, hayOfertaActiva, puedeResponderOferta, respuestaValida, validar } from "../../validaciones/guardias.js";
import { aceptarOferta } from "./aceptarOferta.js";
import { rechazarOferta } from "./rechazarOferta.js";

//? Atiende el mensaje msgResponderIntercambio: valida la respuesta y deriva a aceptar o rechazar
export function manejarResponderIntercambio(
    sala: CatanRoom,
    client: Client,
    mensaje: { respuesta: number }
): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [
            hayOfertaActiva,
            puedeResponderOferta,
            aunNoRespondio,
            respuestaValida(mensaje.respuesta)
        ]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    if (mensaje.respuesta === -1) {
        rechazarOferta(sala, client);
    } else {
        aceptarOferta(sala, client);
    }
}
