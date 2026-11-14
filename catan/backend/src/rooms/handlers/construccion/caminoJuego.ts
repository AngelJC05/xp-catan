import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego, FasePartida } from "../../../common/enums.js";
import { construirCaminoDeJugador } from "../../acciones/construccion/construirCaminoDeJugador.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, enFasePartida, esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";

//? Atiende msgColocarCamino durante el juego: cuesta recursos y debe conectar con una construccion propia
export function manejarCaminoJuego(
    sala: CatanRoom,
    client: Client,
    mensaje: { h: number, d: number, p: number }
): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [
            partidaEnCurso,
            esSuTurno,
            enFasePartida(FasePartida.JUEGO),
            enFaseJuego(FaseJuego.ACCIONES)
        ]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    const resultado = construirCaminoDeJugador(sala, client.sessionId, mensaje);

    if (resultado.error) enviarError(client, resultado.mensaje);
}
