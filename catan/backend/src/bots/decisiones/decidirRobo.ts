import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { robarAJugador } from "../../rooms/acciones/ladron/robarAJugador.js";
import { elegirJugadorRobo } from "../../autoFunctions/robo/elecciones/elegirJugadorRobo.js";

//? Elige al azar a quien le roba el bot
export function decidirRobo(sala: CatanRoom, sessionId: string): void {
    const robado = elegirJugadorRobo(Array.from(sala.partida.jugadoresParaRobar));
    if (robado === "") return;

    robarAJugador(sala, sessionId, robado);
}
