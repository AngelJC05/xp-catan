import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende msgConfigurarSala: en el lobby el creador cambia los tiempos y los puntos para ganar
export function manejarConfigurarSala(
    sala: CatanRoom,
    client: Client,
    mensaje: Record<string, unknown>
): void {
}
