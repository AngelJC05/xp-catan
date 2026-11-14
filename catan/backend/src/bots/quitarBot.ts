import type { CatanRoom } from "../rooms/CatanRoom.js";
import { actualizarCupoBots } from "./actualizarCupoBots.js";

//? Saca a un bot de la sala; si el jugador no existe o no es un bot devuelve error
export function quitarBot(sala: CatanRoom, sessionId: string): {
    error: boolean,
    mensaje: string
} {
    const jugador = sala.jugadores.get(sessionId);

    if(!jugador){
        return { error: true, mensaje: "No se encontro al bot" };
    }

    if(!jugador.esBot){
        return { error: true, mensaje: "Solo se pueden quitar bots"};
    }

    sala.jugadores.delete(sessionId);
    
    const indice = sala.partida.ordenJugadores.indexOf(sessionId);
    if(indice !== -1){
        sala.partida.ordenJugadores.splice(indice, 1);
    }

    actualizarCupoBots(sala);
    return { error: false, mensaje: "" };
}
