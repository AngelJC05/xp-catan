import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { FaseJuego, FasePartida } from "../../common/enums.js";
import { terminarTurno } from "../../rooms/acciones/turno/terminarTurno.js";
import { registrarLogDeJugador } from "../../rooms/ayudantes/notificaciones.js";
import { roboAutomatico } from "../robo/roboAutomatico.js";

//? Cuando se acaba el tiempo del turno se resuelve lo que quedo pendiente y se pasa el turno
export function terminarTurnoAutomatico(sala: CatanRoom): void {
    //* Solo hay turno que terminar si la partida sigue en juego
    if (sala.partida.fase !== FasePartida.JUEGO) return;

    const sessionId = sala.partida.turnoActual;

    registrarLogDeJugador(sala, sessionId, " se quedo sin tiempo en su turno");

    //* Si estaba eligiendo a quien robar con el caballero, se elige al azar
    if (sala.partida.faseJuego === FaseJuego.ROBO) {
        roboAutomatico(sala);
    }

    //* Si estaba usando la carta de carreteras, pierde los caminos gratis que le quedaban
    if (sala.partida.faseJuego === FaseJuego.CARRETERAS) {
        sala.partida.carreterasGratis = 0;
        sala.partida.faseJuego = FaseJuego.ACCIONES;
    }

    //* Pasar el turno tambien cierra la oferta abierta y su reloj
    terminarTurno(sala, sessionId);
}
