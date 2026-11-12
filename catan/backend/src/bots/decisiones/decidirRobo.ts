import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { robarAJugador } from "../../rooms/acciones/ladron/robarAJugador.js";
import { jugadorParaRobar } from "../criterios/jugadorParaRobar.js";

//? Elige a quien le roba el bot: el de mas puntos, luego el de mas recursos y luego al azar
export function decidirRobo(sala: CatanRoom, sessionId: string): void {
    const robado = jugadorParaRobar(sala.jugadores, Array.from(sala.partida.jugadoresParaRobar));
    if (robado === "") return;

    robarAJugador(sala, sessionId, robado);
}
