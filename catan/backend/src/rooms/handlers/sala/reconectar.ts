import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende la vuelta de un cliente que se habia caido (onReconnect): avisa en el log que regreso
export function manejarReconexion(sala: CatanRoom, client: Client): void {
    throw new Error("Sin implementar");
}
