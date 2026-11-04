import type { CatanRoom } from "../../CatanRoom.js";
import { moverLadron } from "../../../functions/moverLadron.js";
import { difundirSonido, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
import { resolverRobo } from "./resolverRobo.js";

//? Coloca al ladron despues de un 7 y resuelve el robo segun los jugadores involucrados
//? Esta separado del mensaje para que tambien lo pueda usar el reloj del ladron
export function colocarLadron(
    sala: CatanRoom,
    sessionId: string,
    h: number,
    d: number
): {
    error: boolean,
    mensaje: string
} {
    //* Mover al ladron y obtener los jugadores involucrados
    const resultado = moverLadron(
        sala.tablero,
        sala.jugadores,
        sessionId,
        h, d
    );

    if (resultado.error) return resultado;

    registrarLogDeJugador(sala, sessionId, resultado.mensaje);
    difundirSonido(sala, "ladron");

    //* Segun los jugadores involucrados se pasa a las acciones, se roba o se elige a quien
    resolverRobo(sala, sessionId, resultado.jugadoresInvolucrados);

    return resultado;
}
