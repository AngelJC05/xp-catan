import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende el mensaje msgCaminoGratis: un camino de la carta de carreteras, sin cobrar recursos
export function manejarCaminoGratis(
    sala: CatanRoom,
    client: Client,
    mensaje: { h: number, d: number, p: number }
): void {
    throw new Error("Sin implementar");
}
