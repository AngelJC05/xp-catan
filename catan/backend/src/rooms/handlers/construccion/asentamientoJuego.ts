import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego, FasePartida } from "../../../common/enums.js";
import { construirAsentamientoDeJugador } from "../../acciones/construccion/construirAsentamientoDeJugador.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, enFasePartida, esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";

//? Atiende msgColocarAsentamiento durante el juego: cuesta recursos y debe conectar con un camino propio
export function manejarAsentamientoJuego(
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

    const resultado = construirAsentamientoDeJugador(sala, client.sessionId, mensaje);

    if (resultado.error) enviarError(client, resultado.mensaje);
}
