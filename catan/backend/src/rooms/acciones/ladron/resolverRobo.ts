import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { iniciarRelojAcciones } from "../../../timers/acciones/iniciarRelojAcciones.js";
import { iniciarRelojRobo } from "../../../timers/robo/iniciarRelojRobo.js";
import { robarAJugador } from "./robarAJugador.js";

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
        iniciarRelojAcciones(sala);
        return;
    }

    //* Si solo hay un jugador se le roba automaticamente
    if (involucrados.length === 1) {
        robarAJugador(sala, sessionId, involucrados[0]);
        return;
    }

    //* Si hay 2 o mas se guarda la lista y el jugador elige a quien robar
    sala.partida.jugadoresParaRobar.clear();
    sala.partida.jugadoresParaRobar.push(...involucrados);
    sala.partida.faseJuego = FaseJuego.ROBO;

    //* El jugador del turno tiene un tiempo limite para elegir
    iniciarRelojRobo(sala);
}
