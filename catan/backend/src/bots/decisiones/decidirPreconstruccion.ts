import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { FasePreconstruccion } from "../../common/enums.js";
import { accionAutomaticaPreconstruccion } from "../../autoFunctions/preconstruccion/accionAutomaticaPreconstruccion.js";
import { aristasDelVertice } from "../../functions/aristas.js";
import { colocarAsentamientoPreconstruccion } from "../../rooms/acciones/preconstruccion/colocarAsentamientoPreconstruccion.js";
import { colocarCaminoPreconstruccion } from "../../rooms/acciones/preconstruccion/colocarCaminoPreconstruccion.js";
import { actualizarRelojDados } from "../../timers/dados/actualizarRelojDados.js";
import { actualizarRelojPreconstruccion } from "../../timers/preconstruccion/actualizarRelojPreconstruccion.js";
import { elegirAsentamientoInicial } from "../criterios/asentamientoInicial.js";
import { elegirMejorCamino } from "../criterios/elegirMejorCamino.js";

//? Coloca la pieza que le toca al bot en la preconstruccion, el asentamiento o el camino
export function decidirPreconstruccion(sala: CatanRoom, sessionId: string): void {
    //* El asentamiento y el camino los elige con criterio; si no puede, pone uno al azar como el reloj humano
    const colocado = sala.partida.fasePreconstruccion === FasePreconstruccion.CAMINO
        ? colocarMejorCamino(sala, sessionId)
        : colocarMejorAsentamiento(sala, sessionId);

    if (!colocado) accionAutomaticaPreconstruccion(sala);

    //* Igual que los handlers, tiene que reiniciar el reloj de la preconstruccion y ver si se activa el de dados
    actualizarRelojPreconstruccion(sala);
    actualizarRelojDados(sala);
}

//? Pone el asentamiento en el mejor vertice valido, con un extra en el segundo por los recursos nuevos
//? Devuelve false si no pudo, para que se ponga uno al azar como hace el reloj humano
function colocarMejorAsentamiento(sala: CatanRoom, sessionId: string): boolean {
    const vertice = elegirAsentamientoInicial(sala.tablero, sessionId);
    if (vertice === "") return false;

    const [h, d, p] = vertice.split(",").map(Number);
    return !colocarAsentamientoPreconstruccion(sala, sessionId, h, d, p).error;
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
