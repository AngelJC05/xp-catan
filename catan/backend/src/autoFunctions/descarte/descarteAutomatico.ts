import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { FaseJuego, FasePartida } from "../../common/enums.js";
import { registrarLogDeJugador } from "../../rooms/ayudantes/notificaciones.js";
import { descarteAutomaticoDeJugador } from "./descarteAutomaticoDeJugador.js";

//? Descarta al azar lo que le falta a cada jugador que no descarto a tiempo, y sigue a mover al ladron
export function descarteAutomatico(sala: CatanRoom): void {
    //* Solo se descarta si la partida sigue esperando los descartes
    if (sala.partida.fase !== FasePartida.JUEGO) return;
    if (sala.partida.faseJuego !== FaseJuego.DESCARTE) return;

    //* Se copia la lista porque se va vaciando mientras se descarta
    const pendientes = Array.from(sala.partida.jugadoresParaDescartar.entries());

    for (const [sessionId, cantidad] of pendientes) {
        if (!sala.jugadores.has(sessionId)) continue;

        registrarLogDeJugador(sala, sessionId, ` no descarto a tiempo, se le descartaron ${cantidad} recursos al azar`);
        descarteAutomaticoDeJugador(sala, sessionId);
    }
}
