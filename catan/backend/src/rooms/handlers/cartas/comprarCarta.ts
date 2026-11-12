import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { comprarCartaDeJugador } from "../../acciones/cartas/comprarCartaDeJugador.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";

//? Atiende el mensaje msgComprarCarta: el jugador paga trigo, lana y mineral por una carta de desarrollo
export function manejarComprarCarta(sala: CatanRoom, client: Client): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [partidaEnCurso, esSuTurno, enFaseJuego(FaseJuego.ACCIONES)]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    const resultado = comprarCartaDeJugador(sala, client.sessionId);

    if (resultado.error) enviarError(client, resultado.mensaje);
}
