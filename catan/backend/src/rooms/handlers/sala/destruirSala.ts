import type { CatanRoom } from "../../CatanRoom.js";
import { limpiarRelojesBots } from "../../../bots/despertarBots.js";

//? Atiende la destruccion de la sala (onDispose)
export function manejarDestruccion(sala: CatanRoom): void {
    sala.temporizador.limpiar();
    limpiarRelojesBots(sala);
    console.log("room", sala.roomId, "disposing...");
}
