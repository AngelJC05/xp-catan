import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende el mensaje msgCartaAbundancia: el jugador toma dos recursos de la banca con la carta
export function manejarCartaAbundancia(
    sala: CatanRoom,
    client: Client,
    mensaje: { recurso1: string, recurso2: string }
): void {
    throw new Error("Sin implementar");
}
