import { Client } from "colyseus";
import { CatanRoom } from "../../CatanRoom.js";

//? Atiende msgElegirColor: durante la fase de lobby el jugador elige color y se lo asigna si cumple condiciones
export function manejarElegirColor(
    sala: CatanRoom, 
    client: Client, 
    mensaje: { color: number}
): void {
    throw new Error("Sin implementar");
}