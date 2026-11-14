import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { colocarLadron } from "../../rooms/acciones/ladron/colocarLadron.js";
import { hexagonoParaLadron } from "../criterios/hexagonoParaLadron.js";

//? Mueve al ladron por el bot: lejos de lo suyo, contra el rival con mas puntos y en el numero mas probable
export function decidirLadron(sala: CatanRoom, sessionId: string): void {
    const [h, d] = hexagonoParaLadron(sala.tablero, sala.jugadores, sessionId);

    colocarLadron(sala, sessionId, h, d);
}
