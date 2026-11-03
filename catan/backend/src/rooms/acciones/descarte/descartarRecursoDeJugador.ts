import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { descartarRecurso } from "../../../functions/descartarRecurso.js";
import { registrarLogDeJugador, registrarLogSistema } from "../../ayudantes/notificaciones.js";

//? Descarta un recurso de un jugador que debe descartar y, si ya nadie falta, pasa a mover al ladron
//? Esta separado del mensaje para que tambien lo pueda usar el reloj de descarte
export function descartarRecursoDeJugador(
    sala: CatanRoom,
    sessionId: string,
    recurso: string
): {
    error: boolean,
    mensaje: string
} {
    //* Intentar descartar
    const resultado = descartarRecurso(
        sala.jugadores.get(sessionId),
        sala.banca,
        recurso
    );

    if (resultado.error) return resultado;

    //* Actualizar la cantidad de recursos que le faltan por descartar
    const pendientes = sala.partida.jugadoresParaDescartar.get(sessionId) - 1;
    sala.partida.jugadoresParaDescartar.set(sessionId, pendientes);

    //* Eliminarlo de la lista si ya no tiene que descartar
    if (pendientes === 0) {
        sala.partida.jugadoresParaDescartar.delete(sessionId);
        registrarLogDeJugador(sala, sessionId, " ha terminado de descartar");
    }

    //* Si ya nadie debe descartar se pasa a mover al ladron
    if (sala.partida.jugadoresParaDescartar.size === 0) {
        sala.partida.faseJuego = FaseJuego.LADRON;
        registrarLogSistema(sala, "Todos los jugadores han terminado de descartar");
    }

    return resultado;
}
