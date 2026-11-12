import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { accionCaballero } from "./accionCaballero.js";
import { accionComprarCarta } from "./accionComprarCarta.js";
import { accionConstruir } from "./accionConstruir.js";

//? Una accion del turno del bot: intenta hacer algo y devuelve true si lo hizo
export type AccionBot = (sala: CatanRoom, sessionId: string) => boolean;

//? Acciones del bot en la fase de acciones, de mayor a menor prioridad
export const ACCIONES_BOT: AccionBot[] = [accionCaballero, accionConstruir, accionComprarCarta];
