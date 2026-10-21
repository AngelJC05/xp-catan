import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { Desarrollo, FaseJuego } from "../../../common/enums.js";
import { jugarCaballero } from "../../../functions/jugarCaballero.js";
import { moverLadron } from "../../../functions/moverLadron.js";
import { verificarVictoria } from "../../../functions/verificarVictoria.js";
import { enviarError, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
import { resolverRobo } from "../ladron/resolverRobo.js";
import { enFaseJuego, esSuTurno, partidaEnCurso, puedeUsarCarta, tieneCarta, validar } from "../../validaciones/guardias.js";

//? Atiende el mensaje msgCartaCaballero: mueve al ladron con la carta y resuelve el robo
export function manejarCartaCaballero(
    sala: CatanRoom,
    client: Client,
    mensaje: { h: number, d: number }
): void {
    //* Obtiene al jugador que envio el mensaje
    const jugador = sala.jugadores.get(client.sessionId);

    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId, jugador },
        [
            partidaEnCurso,
            esSuTurno,
            enFaseJuego(FaseJuego.ACCIONES),
            puedeUsarCarta,
            tieneCarta(Desarrollo.CABALLERO)
        ]
    );

    if (error || !jugador) {
        enviarError(client, error ?? "No se encontro al jugador");
        return;
    }

    //* Mover al ladron y obtener los jugadores involucrados
    const { h, d } = mensaje;
    const resultado = moverLadron(
        sala.tablero,
        sala.jugadores,
        client.sessionId,
        h, d
    );

    //* Si no se puede mover el ladron, la carta no se gasta
    if (resultado.error) {
        enviarError(client, resultado.mensaje);
        return;
    }

    registrarLogDeJugador(sala, client.sessionId, " ha jugado una carta de caballero");

    //* Gastar la carta, contar el caballero y revisar el ejercito mas grande
    jugarCaballero(sala.jugadores, client.sessionId, sala.partida, sala);

    //* Verificar si el jugador ha ganado
    verificarVictoria(sala.partida, jugador, client.sessionId, sala);

    //* Deshabilitar el uso de otra carta este turno
    sala.partida.cartaJugable = false;

    //* Segun los jugadores involucrados se pasa a las acciones, se roba o se elige a quien
    resolverRobo(sala, client.sessionId, resultado.jugadoresInvolucrados);
}
