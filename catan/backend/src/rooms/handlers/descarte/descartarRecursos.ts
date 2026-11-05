import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { descartarRecursoDeJugador } from "../../acciones/descarte/descartarRecursoDeJugador.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
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

    const resultado = descartarRecursoDeJugador(sala, client.sessionId, mensaje.recurso);

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
    }
}
