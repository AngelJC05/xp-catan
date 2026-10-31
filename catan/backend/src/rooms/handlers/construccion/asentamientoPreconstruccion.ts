import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FasePartida, FasePreconstruccion } from "../../../common/enums.js";
import { colocarAsentamientoPreconstruccion } from "../../acciones/colocarAsentamientoPreconstruccion.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
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

    const { h, d, p } = mensaje;

    //* Colocar el asentamiento
    const resultado = colocarAsentamientoPreconstruccion(sala, client.sessionId, h, d, p);

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
    }
}
