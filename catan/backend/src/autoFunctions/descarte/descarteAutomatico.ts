import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { FaseJuego, FasePartida } from "../../common/enums.js";
import { descartarRecursoDeJugador } from "../../rooms/acciones/descarte/descartarRecursoDeJugador.js";
import { registrarLogDeJugador } from "../../rooms/ayudantes/notificaciones.js";
import { elegirRecursoDescarte } from "./elecciones/elegirRecursoDescarte.js";

//? Descarta al azar lo que le falta a cada jugador que no descarto a tiempo, y sigue a mover al ladron
export function descarteAutomatico(sala: CatanRoom): void {
    //* Solo se descarta si la partida sigue esperando los descartes
    if (sala.partida.fase !== FasePartida.JUEGO) return;
    if (sala.partida.faseJuego !== FaseJuego.DESCARTE) return;

    //* Se copia la lista porque se va vaciando mientras se descarta
    const pendientes = Array.from(sala.partida.jugadoresParaDescartar.entries());

    for (const [sessionId, cantidad] of pendientes) {
        const jugador = sala.jugadores.get(sessionId);
        if (!jugador) continue;

        registrarLogDeJugador(sala, sessionId, ` no descarto a tiempo, se le descartaron ${cantidad} recursos al azar`);

        for (let i = 0; i < cantidad; i++) {
            const recurso = elegirRecursoDescarte(jugador);
            if (recurso === "") break;

            descartarRecursoDeJugador(sala, sessionId, recurso);
        }
    }
}
