import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { descartarRecurso } from "../../../functions/descartarRecurso.js";
import { enviarError, registrarLogDeJugador, registrarLogSistema } from "../../ayudantes/notificaciones.js";
import { debeDescartar, enFaseJuego, validar } from "../../validaciones/guardias.js";

//? Atiende el mensaje msgDescartarRecursos: un recurso por mensaje, sin importar de quien sea el turno
export function manejarDescartarRecursos(
    sala: CatanRoom,
    client: Client,
    mensaje: { recurso: string }
): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [enFaseJuego(FaseJuego.DESCARTE), debeDescartar]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    //* Intentar descartar
    const resultado = descartarRecurso(
        sala.jugadores.get(client.sessionId),
        sala.banca,
        mensaje.recurso
    );

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
        return;
    }

    //* Actualizar la cantidad de recursos que le faltan por descartar
    const pendientes = sala.partida.jugadoresParaDescartar.get(client.sessionId) - 1;
    sala.partida.jugadoresParaDescartar.set(client.sessionId, pendientes);

    //* Eliminarlo de la lista si ya no tiene que descartar
    if (pendientes === 0) {
        sala.partida.jugadoresParaDescartar.delete(client.sessionId);
        registrarLogDeJugador(sala, client.sessionId, " ha terminado de descartar");
    }

    //* Si ya nadie debe descartar se pasa a mover al ladron
    if (sala.partida.jugadoresParaDescartar.size === 0) {
        sala.partida.faseJuego = FaseJuego.LADRON;
        registrarLogSistema(sala, "Todos los jugadores han terminado de descartar");
    }
}
