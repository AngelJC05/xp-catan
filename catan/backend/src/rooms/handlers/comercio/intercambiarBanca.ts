import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende el mensaje msgIntercambiarBanca: el jugador cambia recursos con la banca segun su tasa de comercio
export function manejarIntercambiarBanca(
    sala: CatanRoom,
    client: Client,
    mensaje: { recursoEntregado: string, recursoRecibido: string }
): void {
    throw new Error("Sin implementar");
}
