import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Datos que manda el cliente al unirse a la sala
export interface OpcionesUnirse {
    nombre?: string;
    codigoAcceso?: string;
}

//? Atiende la entrada de un cliente (onJoin): valida que pueda entrar y lo registra en la partida
//! Si no puede entrar lanza un Error, que es la forma en que Colyseus rechaza la conexion
export function manejarUnirse(
    sala: CatanRoom,
    client: Client,
    opciones: OpcionesUnirse
): void {
    throw new Error("Sin implementar");
}
