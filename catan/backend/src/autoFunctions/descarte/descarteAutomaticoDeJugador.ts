import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { descartarRecursoDeJugador } from "../../rooms/acciones/descarte/descartarRecursoDeJugador.js";
import { elegirRecursoDescarte } from "./elecciones/elegirRecursoDescarte.js";

//? Descarta al azar lo que le falta a un solo jugador, los demas pendientes no se tocan
export function descarteAutomaticoDeJugador(sala: CatanRoom, sessionId: string): void {
    const jugador = sala.jugadores.get(sessionId);
    const cantidad = sala.partida.jugadoresParaDescartar.get(sessionId);
    if (!jugador || !cantidad) return;

    for (let i = 0; i < cantidad; i++) {
        const recurso = elegirRecursoDescarte(jugador);
        if (recurso === "") break;

        descartarRecursoDeJugador(sala, sessionId, recurso);
    }
}
