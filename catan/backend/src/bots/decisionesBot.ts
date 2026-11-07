import type { CatanRoom } from "../rooms/CatanRoom.js";
import type { SituacionBot } from "./situacionDelBot.js";

//? Lo que hace un bot en una situacion, recibe la sala y el sessionId del bot
export type DecisionBot = (sala: CatanRoom, sessionId: string) => void;
export type DecisionesBot = Partial<Record<SituacionBot, DecisionBot>>;

//? Decisiones de los bots por situacion, cada issue de bots agrega la suya
export const DECISIONES_BOT: DecisionesBot = {};
