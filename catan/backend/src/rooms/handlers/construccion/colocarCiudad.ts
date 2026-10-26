import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego, FasePartida } from "../../../common/enums.js";
import { construirCiudad } from "../../../functions/construirCiudad.js";
import { verificarVictoria } from "../../../functions/verificarVictoria.js";
import { difundirSonido, enviarError, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
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

    //* Obtener al jugador que envio el mensaje
    const jugador = sala.jugadores.get(client.sessionId);
    if (!jugador) return;

    const { h, d, p } = mensaje;

    //* Intentar construir la ciudad
    const resultado = construirCiudad(
        sala.tablero.vertices,
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
    difundirSonido(sala, "ciudad");

    //* Verificar si el jugador ha ganado
    verificarVictoria(sala.partida, jugador, client.sessionId, sala);
}
