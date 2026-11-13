import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { accionAbundancia } from "./accionAbundancia.js";
import { accionComercioBanca } from "./accionComercioBanca.js";
import { accionCaballero } from "./accionCaballero.js";
import { accionComprarCarta } from "./accionComprarCarta.js";
import { accionConstruir } from "./accionConstruir.js";
import { accionMonopolio } from "./accionMonopolio.js";
import { accionConstruirCamino } from "./accionConstruirCamino.js";

//? Una accion del turno del bot: intenta hacer algo y devuelve true si lo hizo
export type AccionBot = (sala: CatanRoom, sessionId: string) => boolean;

//? Acciones del bot en la fase de acciones, de mayor a menor prioridad
export const ACCIONES_BOT: AccionBot[] = [
    accionCaballero,
    accionAbundancia,
    accionMonopolio,
    accionComercioBanca,
    accionConstruir,
    accionConstruirCamino,
    accionComprarCarta
];
