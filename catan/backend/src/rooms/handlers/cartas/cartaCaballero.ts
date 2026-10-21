import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende el mensaje msgCartaCaballero: mueve al ladron con la carta y resuelve el robo
export function manejarCartaCaballero(
    sala: CatanRoom,
    client: Client,
    mensaje: { h: number, d: number }
): void {
    throw new Error("Sin implementar");
}
