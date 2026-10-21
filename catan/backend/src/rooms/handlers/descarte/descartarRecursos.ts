import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Atiende el mensaje msgDescartarRecursos: un recurso por mensaje, sin importar de quien sea el turno
export function manejarDescartarRecursos(
    sala: CatanRoom,
    client: Client,
    mensaje: { recurso: string }
): void {
    throw new Error("Sin implementar");
}
