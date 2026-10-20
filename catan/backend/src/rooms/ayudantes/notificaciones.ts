import type { Client } from "colyseus";
import type { CatanRoom } from "../CatanRoom.js";

//? Avisa solo a un cliente que su accion no se pudo realizar
export function enviarError(client: Client, mensajeError: string): void {
    throw new Error("Sin implementar");
}

//? Avisa a toda la sala de algo que hizo un jugador, mostrando su nombre
export function registrarLogDeJugador(sala: CatanRoom, sessionId: string, mensaje: string): void {
    throw new Error("Sin implementar");
}

//? Avisa a toda la sala de algo que paso en la partida, sin ser de un jugador
export function registrarLogSistema(sala: CatanRoom, mensaje: string): void {
    throw new Error("Sin implementar");
}
