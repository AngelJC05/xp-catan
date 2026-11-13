import type { CatanRoom } from "../../CatanRoom.js";
import { jugarAbundancia } from "../../../functions/jugarAbundancia.js";
import { difundirSonido, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";

//? Usa la carta de abundancia de un jugador: toma dos recursos de la banca y ya no puede usar otra carta este turno
//? Esta separado del mensaje para que tambien lo pueda usar un bot; las validaciones van antes de llamarla
export function usarCartaAbundancia(
    sala: CatanRoom,
    sessionId: string,
    recurso1: string,
    recurso2: string
): {
    error: boolean,
    mensaje: string
} {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador) return { error: true, mensaje: "No se encontro al jugador" };

    //* Intentar jugar la carta de abundancia
    const resultado = jugarAbundancia(jugador, sala.banca, recurso1, recurso2);
    if (resultado.error) return resultado;

    registrarLogDeJugador(sala, sessionId, resultado.mensaje);
    difundirSonido(sala, "abundancia");

    //* Marcar que ya se uso una carta en este turno
    sala.partida.cartaJugable = false;

    return { error: false, mensaje: "" };
}
