import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { FaseJuego, FasePartida } from "../../common/enums.js";
import { robarAJugador } from "../../rooms/acciones/ladron/robarAJugador.js";
import { registrarLogDeJugador } from "../../rooms/ayudantes/notificaciones.js";
import { elegirJugadorRobo } from "./elecciones/elegirJugadorRobo.js";

//? Elige al azar a quien robar por el jugador del turno y le roba como si lo hubiera elegido el
//? Recibe la forma de elegir para poder probar un jugador fijo
export function roboAutomatico(
    sala: CatanRoom,
    elegir: (posibles: string[]) => string = elegirJugadorRobo
): void {
    //* Solo se roba si la partida sigue esperando que elija
    if (sala.partida.fase !== FasePartida.JUEGO) return;
    if (sala.partida.faseJuego !== FaseJuego.ROBO) return;

    const sessionId = sala.partida.turnoActual;
    const robado = elegir(Array.from(sala.partida.jugadoresParaRobar));
    if (robado === "") return;

    registrarLogDeJugador(sala, sessionId, " no eligio a quien robar a tiempo, el juego eligio al azar");

    robarAJugador(sala, sessionId, robado);
}
