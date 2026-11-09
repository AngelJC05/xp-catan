import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { roboAutomatico } from "../../autoFunctions/robo/roboAutomatico.js";

//? Elige al azar a quien le roba el bot
export function decidirRobo(sala: CatanRoom, sessionId: string): void {
    roboAutomatico(sala);
}
