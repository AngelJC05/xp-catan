import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FasePartida } from "../../../common/enums.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";
import { manejarAsentamientoPreconstruccion } from "./asentamientoPreconstruccion.js";
import { manejarAsentamientoJuego } from "./asentamientoJuego.js";

//? Atiende msgColocarAsentamiento: revisa lo comun y deriva al handler de la fase actual
export function manejarColocarAsentamiento(
    sala: CatanRoom,
    client: Client,
    mensaje: { h: number, d: number, p: number }
): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [partidaEnCurso, esSuTurno]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    if (sala.partida.fase === FasePartida.PRECONSTRUCCION) {
        manejarAsentamientoPreconstruccion(sala, client, mensaje);
    } else if (sala.partida.fase === FasePartida.JUEGO) {
        manejarAsentamientoJuego(sala, client, mensaje);
    }
}
