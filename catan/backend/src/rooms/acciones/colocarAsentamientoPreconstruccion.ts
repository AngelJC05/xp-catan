import type { CatanRoom } from "../CatanRoom.js";
import { FasePreconstruccion } from "../../common/enums.js";
import { construirAsentamiento } from "../../functions/construirAsentamiento.js";
import { darMaterialInicial } from "../../functions/darMaterialInicial.js";
import { difundirSonido, registrarLogDeJugador } from "../ayudantes/notificaciones.js";

//? Coloca el asentamiento gratis de un jugador en la preconstruccion y pasa al paso del camino
export function colocarAsentamientoPreconstruccion(
    sala: CatanRoom,
    sessionId: string,
    h: number,
    d: number,
    p: number
): { error: boolean, mensaje: string } {
    //* Obtener el jugador que va a construir
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador) return { error: true, mensaje: "Jugador no encontrado" };

    //* Intentar construir el asentamiento
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

    //* En la vuelta de regreso el segundo asentamiento da material inicial
    if (sala.partida.direccionPreconstruccion === -1) {
        darMaterialInicial(sala.tablero.hexagonos, jugador, h, d, p, sala.banca);
    }

    sala.partida.fasePreconstruccion = FasePreconstruccion.CAMINO;

    return resultado;
}
