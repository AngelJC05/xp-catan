import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Registra que un jugador rechazo la oferta de intercambio activa
//? Asume que la respuesta ya fue validada por manejarResponderIntercambio
export function rechazarOferta(sala: CatanRoom, client: Client): void {
    throw new Error("Sin implementar");
}
