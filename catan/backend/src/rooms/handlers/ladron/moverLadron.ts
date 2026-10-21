import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende el mensaje msgMoverLadron: mueve al ladron despues de un 7 y resuelve el robo
export function manejarMoverLadron(
    sala: CatanRoom,
    client: Client,
    mensaje: { h: number, d: number }
): void {
    throw new Error("Sin implementar");
}
