import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { Desarrollo, FaseJuego } from "../../../common/enums.js";
import { enviarError, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
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

    //* Gastar la carta de carreteras del jugador
    jugador.cartas_usables.set(
        `${Desarrollo.CARRETERA}`,
        jugador.cartas_usables.get(`${Desarrollo.CARRETERA}`) - 1
    );

    //* Activar el efecto: dos caminos gratis
    sala.partida.carreterasGratis = 2;
    sala.partida.faseJuego = FaseJuego.CARRETERAS;

    //* No se puede usar otra carta este turno
    sala.partida.cartaJugable = false;

    registrarLogDeJugador(sala, client.sessionId, " ha jugado una carta de carreteras");
}
