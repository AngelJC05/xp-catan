import type { CatanRoom } from "../../CatanRoom.js";
import { intercambiarRecursosMixtos } from "../../../functions/intercambiarRecursos.js";
import { registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
import { cerrarOferta } from "./cerrarOferta.js";

//? Un jugador acepta la oferta de intercambio activa y se mueven los recursos
//? Esta separado del mensaje para que tambien lo pueda usar un bot; devuelve el error para avisarle al jugador
export function aceptarOfertaDeJugador(
    sala: CatanRoom,
    sessionId: string
): {
    error: boolean,
    mensaje: string
} {
    const oferta = sala.partida.ofertaIntercambio;

    //* Intercambiar los recursos, solo se mueven si ambos tienen lo necesario
    const resultado = intercambiarRecursosMixtos(
        oferta.jugador,
        sessionId,
        sala.jugadores,
        oferta
    );

    //* Si a quien ofrecio ya no le alcanza, la oferta se cancela
    if (resultado.faltaA === "oferente") {
        cerrarOferta(sala);
        return { error: true, mensaje: "Oferta cancelada, el negociante no tiene ya recursos" };
    }

    //* Si a quien acepta le faltan recursos, pasa automaticamente a rechazo
    if (resultado.faltaA === "aceptante") {
        oferta.registrarRespuesta(sessionId, -1);
        if (oferta.todosRechazaron()) {
            cerrarOferta(sala);
        }
        return { error: false, mensaje: "" };
    }

    if (resultado.error) {
        return { error: true, mensaje: resultado.mensaje };
    }

    registrarLogDeJugador(sala, sessionId, " ha aceptado la oferta de intercambio");

    //* El intercambio ya se hizo, la oferta termina
    cerrarOferta(sala);
    return { error: false, mensaje: "" };
}
