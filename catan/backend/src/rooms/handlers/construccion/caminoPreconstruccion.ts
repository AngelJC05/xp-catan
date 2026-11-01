import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FasePartida, FasePreconstruccion } from "../../../common/enums.js";
import { colocarCaminoPreconstruccion } from "../../acciones/preconstruccion/colocarCaminoPreconstruccion.js";
import { actualizarRelojPreconstruccion } from "../../../timers/preconstruccion/actualizarRelojPreconstruccion.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
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

    const { h, d, p } = mensaje;

    //* Colocar el camino
    const resultado = colocarCaminoPreconstruccion(sala, client.sessionId, h, d, p);

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
        return;
    }

    //* La siguiente pieza empieza con un reloj nuevo
    actualizarRelojPreconstruccion(sala);
}
