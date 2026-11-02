import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { cerrarOferta } from "../../rooms/acciones/comercio/cerrarOferta.js";
import { registrarLogSistema } from "../../rooms/ayudantes/notificaciones.js";

//? Cuando se acaba el tiempo de la oferta, quien no respondio cuenta como rechazo y la oferta se cierra
export function vencerOferta(sala: CatanRoom): void {
    const oferta = sala.partida.ofertaIntercambio;

    //* Solo hay algo que vencer si la oferta sigue activa
    if (oferta.jugador === "") return;

    //* Los que no respondieron se toman como rechazo
    oferta.respuestas.forEach((respuesta, sessionId) => {
        if (respuesta === 0) oferta.registrarRespuesta(sessionId, -1);
    });

    registrarLogSistema(sala, "Se acabo el tiempo para responder la oferta de intercambio");

    cerrarOferta(sala);
}
