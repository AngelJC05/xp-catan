import type { CatanRoom } from "../rooms/CatanRoom.js";

//? Saca a un bot de la sala; si el jugador no existe o no es un bot devuelve error
export function quitarBot(sala: CatanRoom, sessionId: string): {
    error: boolean,
    mensaje: string
} {
    return { error: false, mensaje: "" };
}
