import type { CatanRoom } from "../CatanRoom.js";
import { FasePreconstruccion } from "../../common/enums.js";
import { construirCamino } from "../../functions/construirCaminos.js";
import { siguienteTurnoPreconstruccion } from "../../functions/siguienteTurnoPreconstruccion.js";
import { difundirSonido, registrarLogDeJugador } from "../ayudantes/notificaciones.js";

//? Coloca el camino gratis de un jugador en la preconstruccion y pasa el turno al siguiente
export function colocarCaminoPreconstruccion(
    sala: CatanRoom,
    sessionId: string,
    h: number,
    d: number,
    p: number
): { error: boolean, mensaje: string } {
    //* Obtener el jugador que va a construir
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador) return { error: true, mensaje: "Jugador no encontrado" };

    //* Intentar construir el camino
    const resultado = construirCamino(
        sala.tablero.vertices,
        sala.tablero.aristas,
        sala.partida,
        h, d, p,
        jugador,
        sala.banca,
        sessionId
    );

    if (resultado.error) return resultado;

    registrarLogDeJugador(sala, sessionId, resultado.mensaje);
    difundirSonido(sala, "camino");

    //* Ahora le toca al siguiente jugador poner un asentamiento
    sala.partida.fasePreconstruccion = FasePreconstruccion.ASENTAMIENTO;
    siguienteTurnoPreconstruccion(sala.partida);

    return resultado;
}
