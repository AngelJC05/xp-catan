import type { CatanRoom } from "../../CatanRoom.js";
import { jugarMonopolio } from "../../../functions/jugarMonopolio.js";
import { difundirSonido, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";

//? Usa la carta de monopolio de un jugador: se queda con todo un recurso de los demas y ya no puede usar otra carta
//? Esta separado del mensaje para que tambien lo pueda usar un bot; las validaciones van antes de llamarla
export function usarCartaMonopolio(
    sala: CatanRoom,
    sessionId: string,
    recurso: string
): {
    error: boolean,
    mensaje: string
} {
    if (!sala.jugadores.has(sessionId)) return { error: true, mensaje: "No se encontro al jugador" };

    //* Intentar jugar la carta de monopolio
    const resultado = jugarMonopolio(sala.jugadores, sessionId, recurso);
    if (resultado.error) return resultado;

    registrarLogDeJugador(sala, sessionId, resultado.mensaje);
    difundirSonido(sala, "monopolio");

    //* Marcar que ya se uso una carta en este turno
    sala.partida.cartaJugable = false;

    return { error: false, mensaje: "" };
}
