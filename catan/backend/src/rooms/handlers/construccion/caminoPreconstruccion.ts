import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende msgColocarCamino durante la preconstruccion: el camino es gratis y avanza el turno
export function manejarCaminoPreconstruccion(
    sala: CatanRoom,
    client: Client,
    mensaje: { h: number, d: number, p: number }
): void {
    throw new Error("Sin implementar");
}
