import type { CatanRoom } from "../../CatanRoom.js";
import { jugarCaballero } from "../../../functions/jugarCaballero.js";
import { moverLadron } from "../../../functions/moverLadron.js";
import { verificarVictoria } from "../../../functions/verificarVictoria.js";
import { difundirSonido, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
import { resolverRobo } from "../ladron/resolverRobo.js";

//? Juega la carta de caballero de un jugador: mueve al ladron, gasta la carta y resuelve el robo
//? Esta separado del mensaje para que tambien lo pueda usar un bot; las validaciones van antes de llamarla
export function jugarCartaCaballero(
    sala: CatanRoom,
    sessionId: string,
    h: number,
    d: number
): {
    error: boolean,
    mensaje: string
} {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador) return { error: true, mensaje: "No se encontro al jugador" };

    //* Mover al ladron y obtener los jugadores involucrados
    const resultado = moverLadron(
        sala.tablero,
        sala.jugadores,
        sessionId,
        h, d
    );

    //* Si no se puede mover el ladron, la carta no se gasta
    if (resultado.error) return { error: true, mensaje: resultado.mensaje };

    registrarLogDeJugador(sala, sessionId, " ha jugado una carta de caballero");
    difundirSonido(sala, "ladron");

    //* Gastar la carta, contar el caballero y revisar el ejercito mas grande
    jugarCaballero(sala.jugadores, sessionId, sala.partida, sala);

    //* Verificar si el jugador ha ganado
    verificarVictoria(sala.partida, jugador, sessionId, sala);

    //* Deshabilitar el uso de otra carta este turno
    sala.partida.cartaJugable = false;

    //* Segun los jugadores involucrados se pasa a las acciones, se roba o se elige a quien
    resolverRobo(sala, sessionId, resultado.jugadoresInvolucrados);

    return { error: false, mensaje: "" };
}
