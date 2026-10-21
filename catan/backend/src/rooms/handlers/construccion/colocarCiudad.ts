import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende el mensaje msgColocarCiudad: mejora un asentamiento propio a ciudad
export function manejarColocarCiudad(
    sala: CatanRoom,
    client: Client,
    mensaje: { h: number, d: number, p: number }
): void {
    throw new Error("Sin implementar");
}
