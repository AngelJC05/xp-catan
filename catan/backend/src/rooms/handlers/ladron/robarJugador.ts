import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { robarAJugador } from "../../acciones/ladron/robarAJugador.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, esSuTurno, jugadorRobable, partidaEnCurso, validar } from "../../validaciones/guardias.js";

//? Atiende el mensaje msgRobarJugador: el jugador elige a quien robar cuando hay dos o mas posibles
export function manejarRobarJugador(
    sala: CatanRoom,
    client: Client,
    mensaje: { jugadorRobado: string }
): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [
            partidaEnCurso,
            esSuTurno,
            enFaseJuego(FaseJuego.ROBO),
            jugadorRobable(mensaje.jugadorRobado)
        ]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    //* Robar un recurso al azar al jugador elegido
    robarAJugador(sala, client.sessionId, mensaje.jugadorRobado);
}
