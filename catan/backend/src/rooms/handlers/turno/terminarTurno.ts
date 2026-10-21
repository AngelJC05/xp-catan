import type { CatanRoom } from "../../CatanRoom.js";
import { activarCartasCompradas } from "../../../functions/activarCartasCompradas.js";
import { siguienteTurno } from "../../../functions/siguienteTurno.js";
import { registrarLogDeJugador } from "../../ayudantes/notificaciones.js";

//? Termina el turno de un jugador y le da el turno al siguiente
//? Esta separado del mensaje para que tambien lo pueda usar un temporizador
export function terminarTurno(sala: CatanRoom, sessionId: string): void {
    registrarLogDeJugador(sala, sessionId, " ha pasado su turno");

    sala.ofertas.clear();

    //* Activar las cartas compradas del jugador
    const jugador = sala.jugadores.get(sessionId);
    if (jugador) activarCartasCompradas(jugador);

    //* Permitir usar una carta en el siguiente turno
    sala.partida.cartaJugable = true;

    //* Cancelar ofertas de intercambio activas
    sala.partida.ofertaIntercambio.limpiarOferta();

    siguienteTurno(sala.partida);
}
