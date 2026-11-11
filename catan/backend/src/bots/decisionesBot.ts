import type { CatanRoom } from "../rooms/CatanRoom.js";
import type { SituacionBot } from "./situacionDelBot.js";
import { decidirAcciones } from "./decisiones/decidirAcciones.js";
import { decidirDados } from "./decisiones/decidirDados.js";
import { decidirDescarte } from "./decisiones/decidirDescarte.js";
import { decidirLadron } from "./decisiones/decidirLadron.js";
import { decidirPreconstruccion } from "./decisiones/decidirPreconstruccion.js";
import { decidirRobo } from "./decisiones/decidirRobo.js";

//? Lo que hace un bot en una situacion, recibe la sala y el sessionId del bot
export type DecisionBot = (sala: CatanRoom, sessionId: string) => void;
export type DecisionesBot = Partial<Record<SituacionBot, DecisionBot>>;

//? Decisiones de los bots por situacion, cada issue de bots agrega la suya
export const DECISIONES_BOT: DecisionesBot = {
    asentamientoInicial: decidirPreconstruccion,
    caminoInicial: decidirPreconstruccion,
    acciones: decidirAcciones,
    dados: decidirDados,
    descarte: decidirDescarte,
    ladron: decidirLadron,
    robo: decidirRobo
};
