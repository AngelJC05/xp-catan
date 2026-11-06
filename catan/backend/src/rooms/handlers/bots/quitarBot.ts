import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende msgQuitarBot: en el lobby el creador puede quitar un bot
export function manejarQuitarBot(sala: CatanRoom, client: Client, mensaje: { sessionId: string }): void {
}
