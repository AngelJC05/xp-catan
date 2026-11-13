import type { CatanRoom } from "../../CatanRoom.js";
import { Desarrollo, FaseJuego } from "../../../common/enums.js";
import { registrarLogDeJugador } from "../../ayudantes/notificaciones.js";

//? Usa la carta de carreteras de un jugador: pasa a la fase de carreteras con dos caminos gratis y ya no puede usar otra carta
//? Esta separado del mensaje para que tambien lo pueda usar un bot; las validaciones van antes de llamarla
export function usarCartaCarreteras(
    sala: CatanRoom,
    sessionId: string
): {
    error: boolean,
    mensaje: string
} {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador) return { error: true, mensaje: "No se encontro al jugador" };

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

    registrarLogDeJugador(sala, sessionId, " ha jugado una carta de carreteras");

    return { error: false, mensaje: "" };
}
