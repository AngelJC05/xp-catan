import type { Client } from "colyseus";
import type { CatanRoom } from "../CatanRoom.js";

//? Avisa solo a un cliente que su accion no se pudo realizar
export function enviarError(client: Client, mensajeError: string): void {
    client.send("error", { mensajeError });
}

//? Avisa a toda la sala de algo que hizo un jugador, mostrando su nombre
export function registrarLogDeJugador(sala: CatanRoom, sessionId: string, mensaje: string): void {
    sala.broadcast("log", {
        jugador: sala.jugadores.get(sessionId)?.nombre,
        mensaje
    });
}

//? Avisa a toda la sala de algo que paso en la partida, sin ser de un jugador
export function registrarLogSistema(sala: CatanRoom, mensaje: string): void {
    sala.broadcast("log", {
        jugador: "Sistema: ",
        mensaje
    });
}

export type NombreSonido =
    | "asentamiento"
    | "ciudad"
    | "camino"
    | "comprarCarta"
    | "ladron"
    | "monopolio"
    | "abundancia";

//? Avisa a toda la sala de un sonido que se debe reproducir
export function difundirSonido(sala: CatanRoom, nombre: NombreSonido): void {
    sala.broadcast("sonido", { nombre });
}
