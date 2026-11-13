import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { Construccion, Desarrollo, FaseJuego, FasePartida } from "../../common/enums.js";
import { usarCartaCarreteras } from "../../rooms/acciones/cartas/usarCartaCarreteras.js";
import { caminosPosibles } from "../criterios/caminosPosibles.js";
import { elegirMejorCamino } from "../criterios/elegirMejorCamino.js";

//? Usa la carta de carreteras al iniciar la fase de acciones si tiene un camino que lleve a un vertice donde construir
//? Si no hay camino que valga la pena se la guarda. Devuelve true si la uso
export function accionCarreteras(sala: CatanRoom, sessionId: string): boolean {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador || !puedeUsarla(sala, sessionId)) return false;

    if ((jugador.construccionesDisponibles.get(`${Construccion.CAMINO}`) ?? 0) <= 0) return false;

    const camino = elegirMejorCamino(sala.tablero, sessionId, caminosPosibles(sala.tablero, sessionId));
    if (camino === "") return false;

    return !usarCartaCarreteras(sala, sessionId).error;
}

//? Las mismas reglas que un jugador: su turno, la fase de acciones, sin otra carta usada y con la carta
function puedeUsarla(sala: CatanRoom, sessionId: string): boolean {
    const { partida } = sala;
    if (partida.fase !== FasePartida.JUEGO || partida.faseJuego !== FaseJuego.ACCIONES) return false;
    if (partida.turnoActual !== sessionId || !partida.cartaJugable) return false;

    const cartas = sala.jugadores.get(sessionId)?.cartas_usables.get(`${Desarrollo.CARRETERA}`) ?? 0;
    return cartas > 0;
}
