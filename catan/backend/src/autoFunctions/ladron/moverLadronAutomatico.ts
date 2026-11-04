import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { FaseJuego, FasePartida } from "../../common/enums.js";
import type { Tablero } from "../../schemas/Tablero.js";
import { colocarLadron } from "../../rooms/acciones/ladron/colocarLadron.js";
import { registrarLogDeJugador } from "../../rooms/ayudantes/notificaciones.js";
import { elegirHexagonoLadron } from "./elecciones/elegirHexagonoLadron.js";

//? Mueve al ladron por el jugador del turno a un terreno al azar y resuelve el robo como si lo hubiera movido el
//? Recibe la forma de elegir el terreno para poder probar un destino fijo
export function moverLadronAutomatico(
    sala: CatanRoom,
    elegir: (tablero: Tablero) => [number, number] = elegirHexagonoLadron
): void {
    //* Solo se mueve si la partida sigue esperando al ladron
    if (sala.partida.fase !== FasePartida.JUEGO) return;
    if (sala.partida.faseJuego !== FaseJuego.LADRON) return;

    const sessionId = sala.partida.turnoActual;
    const [h, d] = elegir(sala.tablero);

    registrarLogDeJugador(sala, sessionId, " no movio al ladron a tiempo, el juego lo movio al azar");

    colocarLadron(sala, sessionId, h, d);
}
