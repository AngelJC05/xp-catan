import type { CatanRoom } from "../../CatanRoom.js";

//? Aplica el resultado de una tirada de dados a la partida: reparte recursos o activa el 7
//? Recibe la tirada ya hecha para que tambien la pueda usar un temporizador
export function aplicarTirada(
    sala: CatanRoom,
    tirada: { dado1: number, dado2: number, suma: number }
): void {
    throw new Error("Sin implementar");
}
