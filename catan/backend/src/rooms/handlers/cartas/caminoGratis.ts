import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { construirCamino } from "../../../functions/construirCaminos.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";

//? Atiende el mensaje msgCaminoGratis: un camino de la carta de carreteras, sin cobrar recursos
export function manejarCaminoGratis(
    sala: CatanRoom,
    client: Client,
    mensaje: { h: number, d: number, p: number }
): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [partidaEnCurso, esSuTurno, enFaseJuego(FaseJuego.CARRETERAS)]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    //* Obtener al jugador que envio el mensaje
    const jugador = sala.jugadores.get(client.sessionId);
    if (!jugador) return;

    const { h, d, p } = mensaje;

    //* Intentar construir el camino gratis
    const resultado = construirCamino(
        sala.tablero.vertices,
        sala.tablero.aristas,
        sala.partida,
        h, d, p,
        jugador,
        sala.banca,
        client.sessionId
    );

    //* Cualquier error avisa y no gasta el camino gratis, salvo quedarse sin caminos
    //* disponibles: ahi se gasta igual para no quedarse atascado en la fase
    if (resultado.error && resultado.mensaje !== "No tienes caminos disponibles") {
        enviarError(client, resultado.mensaje);
        return;
    }

    //* Si el camino se construyo puede cambiar quien tiene el camino mas largo
    if (!resultado.error) {
        sala.revisarCaminoMasLargo();
    }

    //* Reducir los caminos gratis restantes y volver a las acciones al terminar
    sala.partida.carreterasGratis -= 1;

    if (sala.partida.carreterasGratis === 0) {
        sala.partida.faseJuego = FaseJuego.ACCIONES;
    }
}
