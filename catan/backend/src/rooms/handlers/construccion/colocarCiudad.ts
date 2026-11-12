import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego, FasePartida } from "../../../common/enums.js";
import { construirCiudadDeJugador } from "../../acciones/construccion/construirCiudadDeJugador.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, enFasePartida, esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";

//? Atiende el mensaje msgColocarCiudad: mejora un asentamiento propio a ciudad
export function manejarColocarCiudad(
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

    const resultado = construirCiudadDeJugador(sala, client.sessionId, mensaje);

    if (resultado.error) enviarError(client, resultado.mensaje);
}
