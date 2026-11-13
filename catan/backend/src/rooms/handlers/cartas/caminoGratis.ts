import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { construirCaminoGratisDeJugador } from "../../acciones/construccion/construirCaminoGratisDeJugador.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";

//? Atiende el mensaje msgCaminoGratis: un camino de la carta de carreteras, sin cobrar recursos
export function manejarCaminoGratis(
    sala: CatanRoom,
    client: Client,
    mensaje: { h: number, d: number, p: number }
): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [partidaEnCurso, esSuTurno, enFaseJuego(FaseJuego.CARRETERAS)]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    const resultado = construirCaminoGratisDeJugador(sala, client.sessionId, mensaje);
    if (resultado.error) enviarError(client, resultado.mensaje);
}
