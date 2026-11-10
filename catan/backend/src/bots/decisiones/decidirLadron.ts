import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { colocarLadron } from "../../rooms/acciones/ladron/colocarLadron.js";
import { elegirHexagonoLadron } from "../../autoFunctions/ladron/elecciones/elegirHexagonoLadron.js";

//? Mueve al ladron por el bot a un terreno al azar
export function decidirLadron(sala: CatanRoom, sessionId: string): void {
    const [h, d] = elegirHexagonoLadron(sala.tablero);

    colocarLadron(sala, sessionId, h, d);
}
