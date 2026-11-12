import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { FasePreconstruccion } from "../../common/enums.js";
import { accionAutomaticaPreconstruccion } from "../../autoFunctions/preconstruccion/accionAutomaticaPreconstruccion.js";
import { aristasDelVertice } from "../../functions/aristas.js";
import { colocarCaminoPreconstruccion } from "../../rooms/acciones/preconstruccion/colocarCaminoPreconstruccion.js";
import { actualizarRelojDados } from "../../timers/dados/actualizarRelojDados.js";
import { actualizarRelojPreconstruccion } from "../../timers/preconstruccion/actualizarRelojPreconstruccion.js";
import { elegirMejorCamino } from "../criterios/elegirMejorCamino.js";

//? Coloca la pieza que le toca al bot en la preconstruccion, el asentamiento o el camino
export function decidirPreconstruccion(sala: CatanRoom, sessionId: string): void {
    //* El camino lo elige con criterio; el asentamiento todavia es al azar como el reloj humano
    const colocado = sala.partida.fasePreconstruccion === FasePreconstruccion.CAMINO
        && colocarMejorCamino(sala, sessionId);

    if (!colocado) accionAutomaticaPreconstruccion(sala);

    //* Igual que los handlers, tiene que reiniciar el reloj de la preconstruccion y ver si se activa el de dados
    actualizarRelojPreconstruccion(sala);
    actualizarRelojDados(sala);
}

//? Pone el camino pegado al ultimo asentamiento que lleva al vertice mejor puntuado
//? Devuelve false si no pudo, para que se ponga uno al azar como hace el reloj humano
function colocarMejorCamino(sala: CatanRoom, sessionId: string): boolean {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador) return false;

    //* Los caminos libres que tocan el ultimo asentamiento
    const posibles = aristasDelVertice(jugador.ultimoAsentamiento)
        .filter((arista) => sala.tablero.aristas.get(arista)?.propietario === "");

    const camino = elegirMejorCamino(sala.tablero, sessionId, posibles);
    if (camino === "") return false;

    const [h, d, p] = camino.split(",").map(Number);
    return !colocarCaminoPreconstruccion(sala, sessionId, h, d, p).error;
}
