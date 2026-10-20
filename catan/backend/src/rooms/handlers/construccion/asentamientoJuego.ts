import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende msgColocarAsentamiento durante el juego: cuesta recursos y debe conectar con un camino propio
export function manejarAsentamientoJuego(
    sala: CatanRoom,
    client: Client,
    mensaje: { h: number, d: number, p: number }
): void {
    throw new Error("Sin implementar");
}
