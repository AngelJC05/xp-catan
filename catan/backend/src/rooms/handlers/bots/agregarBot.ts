import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FasePartida } from "../../../common/enums.js";
import { registrarBot } from "../../../bots/registrarBot.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { MAX_JUGADORES } from "../../configuracion/limitesSala.js";
import { enFasePartida, esCreador, validar } from "../../validaciones/guardias.js";

//? Atiende msgAgregarBot: en el lobby el creador agrega un bot a la sala
export function manejarAgregarBot(sala: CatanRoom, client: Client): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [esCreador, enFasePartida(FasePartida.LOBBY)]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    if (sala.jugadores.size >= MAX_JUGADORES) {
        enviarError(client, "La sala esta llena");
        return;
    }

    registrarBot(sala);
}
