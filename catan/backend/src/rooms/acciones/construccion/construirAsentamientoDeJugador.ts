import type { CatanRoom } from "../../CatanRoom.js";
import { construirAsentamiento } from "../../../functions/construirAsentamiento.js";
import { verificarVictoria } from "../../../functions/verificarVictoria.js";
import { difundirSonido, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";

//? Construye un asentamiento en juego para un jugador: cobra los recursos y exige un camino propio y la distancia minima
//? Esta separado del mensaje para que tambien lo use el bot
export function construirAsentamientoDeJugador(
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

    const resultado = construirAsentamiento(
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
    difundirSonido(sala, "asentamiento");

    //* Verificar si el jugador ha ganado
    verificarVictoria(sala.partida, jugador, sessionId, sala);

    //* Un asentamiento nuevo puede cortar el camino mas largo de un rival
    sala.revisarCaminoMasLargo();

    return resultado;
}
