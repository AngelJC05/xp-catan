import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { registrarLogSistema } from "../../ayudantes/notificaciones.js";

//? Atiende la vuelta de un cliente que se habia caido (onReconnect): avisa en el log que regreso
export function manejarReconexion(sala: CatanRoom, client: Client): void {
    console.log(`${client.sessionId} reconnected`);

    registrarLogSistema(sala, `${sala.jugadores.get(client.sessionId)?.nombre} se ha reconectado`);
}
