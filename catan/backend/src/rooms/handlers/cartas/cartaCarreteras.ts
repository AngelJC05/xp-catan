import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { Desarrollo, FaseJuego } from "../../../common/enums.js";
import { usarCartaCarreteras } from "../../acciones/cartas/usarCartaCarreteras.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, esSuTurno, partidaEnCurso, puedeUsarCarta, tieneCarta, validar } from "../../validaciones/guardias.js";

//? Atiende el mensaje msgCartaCarreteras: la carta da dos caminos gratis en la fase de carreteras
export function manejarCartaCarreteras(sala: CatanRoom, client: Client): void {
    const jugador = sala.jugadores.get(client.sessionId);

    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId, jugador },
        [
            partidaEnCurso,
            esSuTurno,
            puedeUsarCarta,
            enFaseJuego(FaseJuego.ACCIONES),
            tieneCarta(Desarrollo.CARRETERA)
        ]
    );

    if (error || !jugador) {
        enviarError(client, error ?? "No se encontro al jugador");
        return;
    }

    const resultado = usarCartaCarreteras(sala, client.sessionId);
    if (resultado.error) enviarError(client, resultado.mensaje);
}
