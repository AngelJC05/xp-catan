import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { proponerOfertaDeJugador } from "../../acciones/comercio/proponerOfertaDeJugador.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, esSuTurno, partidaEnCurso, sinOfertaActiva, validar } from "../../validaciones/guardias.js";

//? Atiende el mensaje msgIntercambiarJugador: el jugador del turno publica una oferta con recursos de cada lado
//? Si un cliente manda el mensaje sin alguno de los lados se trata como vacio, para que avise el error en vez de fallar
export function manejarOfrecerIntercambio(
    sala: CatanRoom,
    client: Client,
    mensaje: { ofrecidos: Record<string, number>, solicitados: Record<string, number> }
): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [partidaEnCurso, esSuTurno, enFaseJuego(FaseJuego.ACCIONES), sinOfertaActiva]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    const resultado = proponerOfertaDeJugador(
        sala,
        client.sessionId,
        mensaje.ofrecidos ?? {},
        mensaje.solicitados ?? {}
    );

    if (resultado.error) enviarError(client, resultado.mensaje);
}
