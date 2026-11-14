import type { CatanRoom } from "../../CatanRoom.js";
import { comprarCarta } from "../../../functions/comprarCarta.js";
import { verificarVictoria } from "../../../functions/verificarVictoria.js";
import { difundirSonido, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";

//? Compra una carta de desarrollo para un jugador: cobra trigo, lana y mineral
//? Esta separado del mensaje para que tambien lo use el bot; las validaciones del turno van antes de llamarla
export function comprarCartaDeJugador(
    sala: CatanRoom,
    sessionId: string
): {
    error: boolean,
    mensaje: string
} {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador) return { error: true, mensaje: "No se encontro al jugador" };

    const resultado = comprarCarta(jugador, sala.banca);
    if (resultado.error) return resultado;

    registrarLogDeJugador(sala, sessionId, resultado.mensaje);
    difundirSonido(sala, "comprarCarta");

    //* Una carta de puntos de victoria puede dar la victoria
    verificarVictoria(sala.partida, jugador, sessionId, sala);

    return resultado;
}
