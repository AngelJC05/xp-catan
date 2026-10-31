import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego, FasePartida } from "../../../common/enums.js";
import { moverLadron } from "../../../functions/moverLadron.js";
import { difundirSonido, enviarError, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, enFasePartida, esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";
import { resolverRobo } from "./resolverRobo.js";

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

    //* Mover al ladron y obtener los jugadores involucrados
    const { h, d } = mensaje;
    const resultado = moverLadron(
        sala.tablero,
        sala.jugadores,
        client.sessionId,
        h, d
    );

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
        return;
    }

    registrarLogDeJugador(sala, client.sessionId, resultado.mensaje);
    difundirSonido(sala, "ladron");

    //* Segun los jugadores involucrados se pasa a las acciones, se roba o se elige a quien
    resolverRobo(sala, client.sessionId, resultado.jugadoresInvolucrados);
}
