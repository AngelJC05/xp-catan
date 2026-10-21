import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego, FasePartida } from "../../../common/enums.js";
import { construirCamino } from "../../../functions/construirCaminos.js";
import { enviarError, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
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

    //* Obtener el jugador que envio el mensaje
    const jugador = sala.jugadores.get(client.sessionId);
    if (!jugador) return;

    const { h, d, p } = mensaje;

    //* Intentar construir el camino
    const resultado = construirCamino(
        sala.tablero.vertices,
        sala.tablero.aristas,
        sala.partida,
        h, d, p,
        jugador,
        sala.banca,
        client.sessionId
    );

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
        return;
    }

    registrarLogDeJugador(sala, client.sessionId, resultado.mensaje);

    //* El nuevo camino puede cambiar quien tiene el camino mas largo
    sala.revisarCaminoMasLargo();
}
