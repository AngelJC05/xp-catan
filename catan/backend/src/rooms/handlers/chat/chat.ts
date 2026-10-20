import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende el mensaje msgChat: reenvia lo que escribe un jugador a toda la sala
export function manejarChat(sala: CatanRoom, client: Client, mensaje: { mensaje: string }): void {
    throw new Error("Sin implementar");
}
