import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { intercambiarRecursosMixtos } from "../../../functions/intercambiarRecursos.js";
import { enviarError, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";

//? Registra que un jugador acepto la oferta de intercambio activa y mueve los recursos
//? Asume que la respuesta ya fue validada por manejarResponderIntercambio
export function aceptarOferta(sala: CatanRoom, client: Client): void {
    const oferta = sala.partida.ofertaIntercambio;

    //* Intercambiar los recursos, solo se mueven si ambos tienen lo necesario
    const resultado = intercambiarRecursosMixtos(
        oferta.jugador,
        client.sessionId,
        sala.jugadores,
        oferta
    );

    //* Si a quien ofrecio ya no le alcanza, la oferta se cancela
    if (resultado.faltaA === "oferente") {
        oferta.limpiarOferta();
        enviarError(client, "Oferta cancelada, el negociante no tiene ya recursos");
        return;
    }

    //* Si a quien acepta le faltan recursos, pasa automaticamente a rechazo
    if (resultado.faltaA === "aceptante") {
        oferta.registrarRespuesta(client.sessionId, -1);
        if (oferta.todosRechazaron()) {
            oferta.limpiarOferta();
        }
        return;
    }

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
        return;
    }

    registrarLogDeJugador(sala, client.sessionId, " ha aceptado la oferta de intercambio");

    //* El intercambio ya se hizo, la oferta termina
    oferta.limpiarOferta();
}
