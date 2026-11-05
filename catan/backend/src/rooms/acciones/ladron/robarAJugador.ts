import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { robarJugador } from "../../../functions/robarJugador.js";
import { registrarLogDeJugador } from "../../ayudantes/notificaciones.js";

//? El jugador del turno le roba un recurso al azar al jugador elegido y se vuelve a las acciones
//? Es el unico lugar donde se roba: lo usan el robo con un solo rival, la eleccion a mano y el reloj de robo
export function robarAJugador(sala: CatanRoom, sessionId: string, sessionIdRobado: string): void {
    const robado = sala.jugadores.get(sessionIdRobado);
    robarJugador(sala.jugadores.get(sessionId), robado);

    registrarLogDeJugador(sala, sessionId, ` ha robado un recurso a ${robado?.nombre}`);

    //* Limpiar la lista y volver a las acciones
    sala.partida.jugadoresParaRobar.clear();
    sala.partida.faseJuego = FaseJuego.ACCIONES;
    sala.temporizador.cancelar("robo");
}
