import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FasePartida, FasePreconstruccion } from "../../../common/enums.js";
import { construirCamino } from "../../../functions/construirCaminos.js";
import { siguienteTurnoPreconstruccion } from "../../../functions/siguienteTurnoPreconstruccion.js";
import { difundirSonido, enviarError, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
import { enFasePartida, enFasePreconstruccion, esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";

//? Atiende msgColocarCamino durante la preconstruccion: el camino es gratis y avanza el turno
export function manejarCaminoPreconstruccion(
    sala: CatanRoom,
    client: Client,
    mensaje: { h: number, d: number, p: number }
): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [
            partidaEnCurso,
            esSuTurno,
            enFasePartida(FasePartida.PRECONSTRUCCION),
            enFasePreconstruccion(FasePreconstruccion.CAMINO)
        ]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    //* Obtener el jugador que envio el mensaje
    const jugador = sala.jugadores.get(client.sessionId);
    if (!jugador) return;

    const { h, d, p } = mensaje;

    //* Intentar construir el camino
    const resultado = construirCamino(
        sala.tablero.vertices,
        sala.tablero.aristas,
        sala.partida,
        h, d, p,
        jugador,
        sala.banca,
        client.sessionId
    );

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
        return;
    }

    registrarLogDeJugador(sala, client.sessionId, resultado.mensaje);
    difundirSonido(sala, "camino");

    //* Ahora le toca al siguiente jugador poner un asentamiento
    sala.partida.fasePreconstruccion = FasePreconstruccion.ASENTAMIENTO;
    siguienteTurnoPreconstruccion(sala.partida);
}
