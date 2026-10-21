import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende el mensaje msgCartaMonopolio: el jugador se queda con todo un recurso de los demas
export function manejarCartaMonopolio(
    sala: CatanRoom,
    client: Client,
    mensaje: { recurso: string }
): void {
    throw new Error("Sin implementar");
}
