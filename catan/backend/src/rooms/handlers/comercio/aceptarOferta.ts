import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Registra que un jugador acepto la oferta de intercambio activa y mueve los recursos
//? Asume que la respuesta ya fue validada por manejarResponderIntercambio
export function aceptarOferta(sala: CatanRoom, client: Client): void {
    throw new Error("Sin implementar");
}
