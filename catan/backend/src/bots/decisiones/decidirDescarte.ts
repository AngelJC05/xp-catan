import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { descartarRecursoDeJugador } from "../../rooms/acciones/descarte/descartarRecursoDeJugador.js";
import { recursoParaDescartar } from "../criterios/recursoParaDescartar.js";
import { objetivoDelBot } from "../metas/objetivoDelBot.js";

//? Descarta lo que el bot debe despues de un 7 cuidando lo que le sirve para su objetivo
export function decidirDescarte(sala: CatanRoom, sessionId: string): void {
    const jugador = sala.jugadores.get(sessionId);
    const cantidad = sala.partida.jugadoresParaDescartar.get(sessionId);
    if (!jugador || !cantidad) return;

    //* El objetivo no cambia mientras descarta; lo que le sobra se recalcula con cada carta
    const { costo } = objetivoDelBot(sala.tablero, jugador, sessionId, undefined, sala.banca);

    for (let i = 0; i < cantidad; i++) {
        const recurso = recursoParaDescartar(jugador, costo);
        if (recurso === "") break;

        descartarRecursoDeJugador(sala, sessionId, recurso);
    }
}
