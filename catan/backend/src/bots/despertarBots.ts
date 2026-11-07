import type { CatanRoom } from "../rooms/CatanRoom.js";
import type { RelojSala } from "../timers/Temporizador.js";
import { DECISIONES_BOT, type DecisionesBot } from "./decisionesBot.js";

//? Pausa entre que un bot detecta que le toca y actua solo para dar algo mas de realismo
export const PAUSA_BOT_MS = 5000;

//? Programa la accion de cada bot que tenga algo que hacer y una decision para ello
export function despertarBots(sala: CatanRoom, reloj: RelojSala, decisiones: DecisionesBot = DECISIONES_BOT): void {
}

//? Cancela todo lo que los bots tengan programado en la sala
export function limpiarRelojesBots(sala: CatanRoom): void {
}
