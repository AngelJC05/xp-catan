import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende el mensaje msgResponderIntercambio: valida la respuesta y deriva a aceptar o rechazar
export function manejarResponderIntercambio(
    sala: CatanRoom,
    client: Client,
    mensaje: { respuesta: number }
): void {
    throw new Error("Sin implementar");
}
