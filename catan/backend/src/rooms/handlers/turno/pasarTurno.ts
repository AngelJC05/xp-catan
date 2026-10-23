import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";
import { terminarTurno } from "./terminarTurno.js";

//? Atiende el mensaje msgPasarTurno: el jugador termina voluntariamente su turno
export function manejarPasarTurno(sala: CatanRoom, client: Client): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [partidaEnCurso, esSuTurno, enFaseJuego(FaseJuego.ACCIONES)]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    terminarTurno(sala, client.sessionId);
}
