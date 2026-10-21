import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende el mensaje msgIntercambiarJugador: el jugador del turno publica una oferta con recursos de cada lado
export function manejarOfrecerIntercambio(
    sala: CatanRoom,
    client: Client,
    mensaje: { ofrecidos: Record<string, number>, solicitados: Record<string, number> }
): void {
    throw new Error("Sin implementar");
}
