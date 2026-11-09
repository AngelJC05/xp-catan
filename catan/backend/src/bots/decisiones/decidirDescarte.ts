import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { descarteAutomaticoDeJugador } from "../../autoFunctions/descarte/descarteAutomaticoDeJugador.js";

//? Descarta al azar lo que el bot debe descartar despues de un 7
export function decidirDescarte(sala: CatanRoom, sessionId: string): void {
    descarteAutomaticoDeJugador(sala, sessionId);
}
