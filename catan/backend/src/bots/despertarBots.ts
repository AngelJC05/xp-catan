import type { CatanRoom } from "../rooms/CatanRoom.js";
import type { RelojSala } from "../timers/Temporizador.js";
import { DECISIONES_BOT, type DecisionesBot } from "./decisionesBot.js";
import { situacionDelBot } from "./situacionDelBot.js";

//? Pausa entre que un bot detecta que le toca y actua, para que parezca que piensa
export const PAUSA_BOT_MS = 2500;

//? Lo que cada sala tiene programado por bot, no se publica a los clientes
const programados = new WeakMap<
    CatanRoom, 
    Map<string, { clear(): void }>
>();

//? Programa la accion de cada bot que tenga algo que hacer y una decision para ello
export function despertarBots(
    sala: CatanRoom, 
    reloj: RelojSala, 
    decisiones: DecisionesBot = DECISIONES_BOT
): void {
    const pendientes = programados.get(sala) ?? new Map<string, { clear(): void }>();
    programados.set(sala, pendientes);

    for (const [sessionId, jugador] of sala.jugadores) {
        if (!jugador.esBot || pendientes.has(sessionId)) continue;

        const situacion = situacionDelBot(sala, sessionId);
        if (!situacion || !decisiones[situacion]) continue;

        const espera = reloj.setTimeout(() => {
            pendientes.delete(sessionId);
            actuar(sala, reloj, decisiones, sessionId);
        }, PAUSA_BOT_MS);
        pendientes.set(sessionId, espera);
    }
}

//? Cancela todo lo que los bots tengan programado en la sala
export function limpiarRelojesBots(sala: CatanRoom): void {
    for (const espera of programados.get(sala)?.values() ?? []) espera.clear();
    programados.delete(sala);
}

//? Ejecuta la decision del bot si todavia le toca y despierta a quien siga con algo pendiente
function actuar(sala: CatanRoom, reloj: RelojSala, decisiones: DecisionesBot, sessionId: string): void {
    const situacion = situacionDelBot(sala, sessionId);
    if (situacion) decisiones[situacion]?.(sala, sessionId);

    //* El turno pudo pasar a otro bot o este puede tener mas por hacer
    despertarBots(sala, reloj, decisiones);
}
