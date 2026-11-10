import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { tiradaAutomatica } from "../../autoFunctions/dados/tiradaAutomatica.js";

//? Tira los dados por el bot
export function decidirDados(sala: CatanRoom, sessionId: string): void {
    sala.temporizador.cancelar("dados");

    tiradaAutomatica(sala);
}
