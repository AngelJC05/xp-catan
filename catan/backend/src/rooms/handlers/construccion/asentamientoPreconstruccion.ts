import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FasePartida, FasePreconstruccion } from "../../../common/enums.js";
import { construirAsentamiento } from "../../../functions/construirAsentamiento.js";
import { darMaterialInicial } from "../../../functions/darMaterialInicial.js";
import { enviarError, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
import { enFasePartida, enFasePreconstruccion, esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";

//? Atiende msgColocarAsentamiento durante la preconstruccion: el asentamiento es gratis
export function manejarAsentamientoPreconstruccion(
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
            enFasePreconstruccion(FasePreconstruccion.ASENTAMIENTO)
        ]
    );

    if (error) {
        enviarError(client, error);
        return;
    }
1
    //* Obtener el jugador que envio el mensaje
    const jugador = sala.jugadores.get(client.sessionId);
    if (!jugador) return;

    const { h, d, p } = mensaje;

    //* Intentar construir el asentamiento
    const resultado = construirAsentamiento(
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

    //* En la vuelta de regreso el segundo asentamiento da material inicial
    if (sala.partida.direccionPreconstruccion === -1) {
        darMaterialInicial(sala.tablero.hexagonos, jugador, h, d, p, sala.banca);
    }

    sala.partida.fasePreconstruccion = FasePreconstruccion.CAMINO;
}
