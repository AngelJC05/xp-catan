import type { Client, CloseCode } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FasePartida } from "../../../common/enums.js";
import { registrarLogDeJugador } from "../../ayudantes/notificaciones.js";

//? Segundos que tiene un jugador para volver antes de que se le saque de la sala
export const SEGUNDOS_RECONEXION = 60;

//? Atiende la caida de conexion de un cliente (onDrop): avisa en el log y le da tiempo para reconectarse
export function manejarCaidaConexion(sala: CatanRoom, client: Client, codigo: CloseCode): void {
    console.log(`${client.sessionId} dropped with code ${codigo}`);

    //* Avisar en el log que alguien tuvo una caida de conexion, en el lobby no hace falta
    if (sala.partida.fase !== FasePartida.LOBBY) {
        registrarLogDeJugador(
            sala,
            client.sessionId,
            ` perdio la conexion, tiene ${SEGUNDOS_RECONEXION} segundos para reconectarse`
        );
    }

    //* Activar la espera de reconexion
    sala.allowReconnection(client, SEGUNDOS_RECONEXION);
}
