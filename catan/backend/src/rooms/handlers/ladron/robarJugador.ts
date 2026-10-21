import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende el mensaje msgRobarJugador: el jugador elige a quien robar cuando hay dos o mas posibles
export function manejarRobarJugador(
    sala: CatanRoom,
    client: Client,
    mensaje: { jugadorRobado: string }
): void {
    throw new Error("Sin implementar");
}
