import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { ACCIONES_BOT, type AccionBot } from "../acciones/accionesBot.js";

//? Prueba las acciones del bot en orden de prioridad y, si ninguna hizo algo, pasa el turno
export function decidirAcciones(sala: CatanRoom, sessionId: string, acciones: AccionBot[] = ACCIONES_BOT): void {
}
