import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { comprarCarta } from "../../../functions/comprarCarta.js";
import { verificarVictoria } from "../../../functions/verificarVictoria.js";
import { enviarError, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";

//? Atiende el mensaje msgComprarCarta: el jugador paga trigo, lana y mineral por una carta de desarrollo
export function manejarComprarCarta(sala: CatanRoom, client: Client): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [partidaEnCurso, esSuTurno, enFaseJuego(FaseJuego.ACCIONES)]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    //* Obtener al jugador que envio el menasje
    const jugador = sala.jugadores.get(client.sessionId);
    if (!jugador) return;

    //* Intentar comprar la carta
    const resultado = comprarCarta(jugador, sala.banca);

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
        return;
    }

    registrarLogDeJugador(sala, client.sessionId, resultado.mensaje);

    //* Una carta de puntos de victoria puede dar la victoria
    verificarVictoria(sala.partida, jugador, client.sessionId, sala);
}
