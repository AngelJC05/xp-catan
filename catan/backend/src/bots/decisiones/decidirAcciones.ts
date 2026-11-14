import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { terminarTurno } from "../../rooms/acciones/turno/terminarTurno.js";
import { ACCIONES_BOT, type AccionBot } from "../acciones/accionesBot.js";

//? Prueba las acciones del bot en orden de prioridad y, si ninguna hizo algo, pasa el turno
//? Hace una sola accion por vez: el bot se despierta de nuevo y vuelve a empezar desde la primera
//? Si su propia oferta de intercambio sigue activa espera a que se resuelva: no hace nada y se despierta de nuevo
export function decidirAcciones(sala: CatanRoom, sessionId: string, acciones: AccionBot[] = ACCIONES_BOT): void {
    if (sala.partida.ofertaIntercambio.jugador === sessionId) return;

    for (const accion of acciones) {
        if (accion(sala, sessionId)) return;
    }

    terminarTurno(sala, sessionId);
}
