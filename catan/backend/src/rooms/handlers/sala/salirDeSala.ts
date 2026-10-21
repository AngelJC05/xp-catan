import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende la salida definitiva de un cliente (onLeave): en el lobby solo lo borra, en partida lo elimina por completo
export function manejarSalida(sala: CatanRoom, client: Client): void {
    throw new Error("Sin implementar");
}
