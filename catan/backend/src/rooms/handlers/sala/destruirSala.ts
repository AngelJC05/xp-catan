import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende la destruccion de la sala (onDispose)
export function manejarDestruccion(sala: CatanRoom): void {
    sala.temporizador.limpiar();
    console.log("room", sala.roomId, "disposing...");
}
