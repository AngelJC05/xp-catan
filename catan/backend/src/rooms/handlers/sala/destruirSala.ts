import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende la destruccion de la sala (onDispose); aqui se limpiaran los temporizadores de la partida cuando existan
export function manejarDestruccion(sala: CatanRoom): void {
    console.log("room", sala.roomId, "disposing...");
}
