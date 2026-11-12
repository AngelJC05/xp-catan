import type { CatanRoom } from "../../rooms/CatanRoom.js";

//? Construye el poblado o la ciudad que es el objetivo del bot, si ya le alcanzan los recursos
//? Devuelve true si construyo algo; con cualquier otro objetivo o sin recursos no hace nada
export function accionConstruir(sala: CatanRoom, sessionId: string, produccion?: Set<string>): boolean {
    return false;
}
