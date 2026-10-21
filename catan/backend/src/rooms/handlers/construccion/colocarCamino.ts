import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FasePartida } from "../../../common/enums.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";
import { manejarCaminoPreconstruccion } from "./caminoPreconstruccion.js";
import { manejarCaminoJuego } from "./caminoJuego.js";

//? Atiende msgColocarCamino: revisa lo comun y deriva al handler de la fase actual
export function manejarColocarCamino(
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
        manejarCaminoPreconstruccion(sala, client, mensaje);
    } else if (sala.partida.fase === FasePartida.JUEGO) {
        manejarCaminoJuego(sala, client, mensaje);
    }
}
