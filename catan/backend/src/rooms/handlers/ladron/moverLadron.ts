import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego, FasePartida } from "../../../common/enums.js";
import { colocarLadron } from "../../acciones/ladron/colocarLadron.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, enFasePartida, esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";

//? Atiende el mensaje msgMoverLadron: mueve al ladron despues de un 7 y resuelve el robo
export function manejarMoverLadron(
    sala: CatanRoom,
    client: Client,
    mensaje: { h: number, d: number }
): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [
            partidaEnCurso,
            esSuTurno,
            enFasePartida(FasePartida.JUEGO),
            enFaseJuego(FaseJuego.LADRON)
        ]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    const { h, d } = mensaje;
    const resultado = colocarLadron(sala, client.sessionId, h, d);

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
    }
}
