import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { moverLadronAutomatico } from "../../autoFunctions/ladron/moverLadronAutomatico.js";

//? Mueve al ladron por el bot
export function decidirLadron(sala: CatanRoom, sessionId: string): void {
    moverLadronAutomatico(sala);
}
