import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende msgColocarCamino durante el juego: cuesta recursos y debe conectar con una construccion propia
export function manejarCaminoJuego(
    sala: CatanRoom,
    client: Client,
    mensaje: { h: number, d: number, p: number }
): void {
    throw new Error("Sin implementar");
}
