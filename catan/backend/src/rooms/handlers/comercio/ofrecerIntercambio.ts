import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { enviarError, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
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

    //* Validar y llenar la oferta, si hay error no se modifica nada
    const resultado = sala.partida.ofertaIntercambio.setOfertaMixta(
        client.sessionId,
        sala.jugadores,
        mensaje.ofrecidos ?? {},
        mensaje.solicitados ?? {}
    );

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
        return;
    }

    registrarLogDeJugador(sala, client.sessionId, " ha hecho una oferta de intercambio");
}
