import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { comerciarBanca } from "../../../functions/comerciarBanca.js";
import { enviarError, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";

//? Atiende el mensaje msgIntercambiarBanca: el jugador cambia recursos con la banca segun su tasa de comercio
export function manejarIntercambiarBanca(
    sala: CatanRoom,
    client: Client,
    mensaje: { recursoEntregado: string, recursoRecibido: string }
): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [partidaEnCurso, esSuTurno, enFaseJuego(FaseJuego.ACCIONES)]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    //* Obtener el jugador que envio el mensaje
    const jugador = sala.jugadores.get(client.sessionId);
    if (!jugador) return;

    //* Intentar realizar el intercambio con la banca
    const resultado = comerciarBanca(
        jugador,
        sala.banca,
        client.sessionId,
        sala.tablero.vertices,
        sala.tablero.puertos,
        mensaje.recursoEntregado,
        mensaje.recursoRecibido
    );

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
        return;
    }

    registrarLogDeJugador(sala, client.sessionId, resultado.mensaje);
}
