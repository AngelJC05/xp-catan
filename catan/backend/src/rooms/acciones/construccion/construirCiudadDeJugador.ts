import type { CatanRoom } from "../../CatanRoom.js";
import { construirCiudad } from "../../../functions/construirCiudad.js";
import { verificarVictoria } from "../../../functions/verificarVictoria.js";
import { difundirSonido, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";

//? Mejora un asentamiento de un jugador a ciudad y cobra los recursos
//? Esta separado del mensaje para que tambien lo use el bot
export function construirCiudadDeJugador(
    sala: CatanRoom,
    sessionId: string,
    posicion: { h: number, d: number, p: number }
): {
    error: boolean,
    mensaje: string
} {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador) return { error: true, mensaje: "No se encontro al jugador" };

    const { h, d, p } = posicion;

    const resultado = construirCiudad(
        sala.tablero.vertices,
        h, d, p,
        jugador,
        sala.banca,
        sessionId
    );

    if (resultado.error) return resultado;

    registrarLogDeJugador(sala, sessionId, resultado.mensaje);
    difundirSonido(sala, "ciudad");

    //* Verificar si el jugador ha ganado
    verificarVictoria(sala.partida, jugador, sessionId, sala);

    return resultado;
}
