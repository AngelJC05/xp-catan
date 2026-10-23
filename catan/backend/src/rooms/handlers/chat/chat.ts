import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { partidaEnCurso, validar } from "../../validaciones/guardias.js";

//? Atiende el mensaje msgChat: reenvia lo que escribe un jugador a toda la sala
export function manejarChat(sala: CatanRoom, client: Client, mensaje: { mensaje: string }): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [partidaEnCurso]
    );
    if (error) {
        enviarError(client, error);
        return;
    }

    //* Un mensaje vacio no se envia ni se avisa
    if (mensaje.mensaje.trim() === "") return;

    //* Reenvia el mensaje a todos los jugadores de la sala
    sala.broadcast("chat", {
        jugador: sala.jugadores.get(client.sessionId)?.nombre,
        mensaje: mensaje.mensaje
    });
}
