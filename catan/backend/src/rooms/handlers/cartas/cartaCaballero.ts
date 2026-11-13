import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { Desarrollo, FaseJuego } from "../../../common/enums.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { jugarCartaCaballero } from "../../acciones/cartas/jugarCartaCaballero.js";
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

    const resultado = jugarCartaCaballero(sala, client.sessionId, mensaje.h, mensaje.d);
    if (resultado.error) enviarError(client, resultado.mensaje);
}
