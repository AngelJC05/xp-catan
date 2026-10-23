import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { robarJugador } from "../../../functions/robarJugador.js";
import { enviarError, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
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
    const robado = sala.jugadores.get(mensaje.jugadorRobado);
    robarJugador(sala.jugadores.get(client.sessionId), robado);

    registrarLogDeJugador(sala, client.sessionId, ` ha robado un recurso a ${robado?.nombre}`);

    //* Limpiar la lista y volver a las acciones
    sala.partida.jugadoresParaRobar.clear();
    sala.partida.faseJuego = FaseJuego.ACCIONES;
}
