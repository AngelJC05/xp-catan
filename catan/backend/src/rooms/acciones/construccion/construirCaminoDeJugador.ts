import type { CatanRoom } from "../../CatanRoom.js";
import { construirCamino } from "../../../functions/construirCaminos.js";
import { difundirSonido, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";

//? Construye un camino en juego para un jugador: cobra madera y ladrillo y exige conectar con algo propio
//? Esta separado del mensaje para que tambien lo use el bot; las validaciones del turno van antes de llamarla
export function construirCaminoDeJugador(
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

    //* El nuevo camino puede cambiar quien tiene el camino mas largo
    sala.revisarCaminoMasLargo();

    return resultado;
}
