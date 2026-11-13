import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { FaseJuego } from "../../common/enums.js";
import { construirCaminoGratisDeJugador } from "../../rooms/acciones/construccion/construirCaminoGratisDeJugador.js";
import { caminosPosibles } from "../criterios/caminosPosibles.js";
import { elegirMejorCamino } from "../criterios/elegirMejorCamino.js";

//? En la fase de carreteras construye un camino gratis hacia el mejor destino
//? Hace un solo camino por vez: el bot se despierta de nuevo para el segundo
//? Si no hay camino posible renuncia a los que le quedan para no quedarse atascado en la fase
export function decidirCarreteras(sala: CatanRoom, sessionId: string): void {
    const camino = elegirMejorCamino(sala.tablero, sessionId, caminosPosibles(sala.tablero, sessionId));

    if (camino !== "") {
        const [h, d, p] = camino.split(",").map(Number);
        if (!construirCaminoGratisDeJugador(sala, sessionId, { h, d, p }).error) return;
    }

    sala.partida.carreterasGratis = 0;
    sala.partida.faseJuego = FaseJuego.ACCIONES;
}
