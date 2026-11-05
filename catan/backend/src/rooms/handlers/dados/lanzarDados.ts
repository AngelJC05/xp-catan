import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego, FasePartida } from "../../../common/enums.js";
import { lanzarDados } from "../../../functions/lanzarDados.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, enFasePartida, esSuTurno, partidaEnCurso, validar } from "../../validaciones/guardias.js";
import { aplicarTirada } from "../../acciones/dados/aplicarTirada.js";

//? Atiende el mensaje msgLanzarDados: valida, tira los dados y aplica la tirada
export function manejarLanzarDados(sala: CatanRoom, client: Client): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [
            partidaEnCurso,
            esSuTurno,
            enFasePartida(FasePartida.JUEGO),
            enFaseJuego(FaseJuego.DADOS)
        ]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    //* Ya tiro a tiempo, asi que su reloj se cancela
    sala.temporizador.cancelar("dados");

    aplicarTirada(sala, lanzarDados());
}
