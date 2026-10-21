import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { robarJugador } from "../../../functions/robarJugador.js";
import { registrarLogDeJugador } from "../../ayudantes/notificaciones.js";

//? Decide que pasa despues de mover al ladron segun los jugadores que se pueden robar
//? Lo usan el ladron del 7 y la carta de caballero, y tambien podra usarlo un temporizador
export function resolverRobo(
    sala: CatanRoom,
    sessionId: string,
    involucrados: string[]
): void {
    //* Si no hay jugadores involucrados se pasa a las acciones
    if (involucrados.length === 0) {
        sala.partida.faseJuego = FaseJuego.ACCIONES;
        return;
    }

    //* Si solo hay un jugador se le roba automaticamente
    if (involucrados.length === 1) {
        const robado = sala.jugadores.get(involucrados[0]);
        robarJugador(sala.jugadores.get(sessionId), robado);
        sala.partida.faseJuego = FaseJuego.ACCIONES;

        registrarLogDeJugador(sala, sessionId, ` ha robado un recurso a ${robado?.nombre}`);
        return;
    }

    //* Si hay 2 o mas se guarda la lista y el jugador elige a quien robar
    sala.partida.jugadoresParaRobar.clear();
    sala.partida.jugadoresParaRobar.push(...involucrados);
    sala.partida.faseJuego = FaseJuego.ROBO;
}
