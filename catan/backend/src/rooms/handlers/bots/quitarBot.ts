import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FasePartida } from "../../../common/enums.js";
import { quitarBot } from "../../../bots/quitarBot.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { enFasePartida, esCreador, validar } from "../../validaciones/guardias.js";

//? Atiende msgQuitarBot: en el lobby el creador saca a un bot de la sala
export function manejarQuitarBot(sala: CatanRoom, client: Client, mensaje: { sessionId: string }): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [esCreador, enFasePartida(FasePartida.LOBBY)]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    const resultado = quitarBot(sala, mensaje.sessionId);

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
    }
}
