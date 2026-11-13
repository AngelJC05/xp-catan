import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { construirCamino } from "../../../functions/construirCaminos.js";
import { difundirSonido } from "../../ayudantes/notificaciones.js";

//? Construye un camino de la carta de carreteras para un jugador, sin cobrar recursos
//? Esta separado del mensaje para que tambien lo use el bot; las validaciones de la fase van antes de llamarla
export function construirCaminoGratisDeJugador(
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

    //* Cualquier error no gasta el camino gratis, salvo quedarse sin caminos
    //* disponibles: ahi se gasta igual para no quedarse atascado en la fase
    if (resultado.error && resultado.mensaje !== "No tienes caminos disponibles") return resultado;

    //* Si el camino se construyo puede cambiar quien tiene el camino mas largo
    if (!resultado.error) {
        sala.revisarCaminoMasLargo();
        difundirSonido(sala, "camino");
    }

    //* Reducir los caminos gratis restantes y volver a las acciones al terminar
    sala.partida.carreterasGratis -= 1;

    if (sala.partida.carreterasGratis === 0) {
        sala.partida.faseJuego = FaseJuego.ACCIONES;
    }

    return { error: false, mensaje: "" };
}
