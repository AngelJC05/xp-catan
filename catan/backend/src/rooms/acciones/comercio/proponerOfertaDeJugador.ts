import type { CatanRoom } from "../../CatanRoom.js";
import { registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
import { iniciarRelojOferta } from "../../../timers/oferta/iniciarRelojOferta.js";

//? Un jugador publica una oferta de intercambio con recursos de cada lado y los demas tienen un tiempo para responder
//? Esta separado del mensaje para que tambien lo pueda usar un bot; las validaciones del turno van antes de llamarla
//? Si la oferta no es valida devuelve el error y no modifica nada
export function proponerOfertaDeJugador(
    sala: CatanRoom,
    sessionId: string,
    ofrecidos: Record<string, number>,
    solicitados: Record<string, number>
): {
    error: boolean,
    mensaje: string
} {
    const resultado = sala.partida.ofertaIntercambio.setOfertaMixta(
        sessionId,
        sala.jugadores,
        ofrecidos,
        solicitados
    );

    if (resultado.error) return resultado;

    registrarLogDeJugador(sala, sessionId, " ha hecho una oferta de intercambio");

    //* Los demas tienen un tiempo limite para responder
    iniciarRelojOferta(sala);

    return resultado;
}
