import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { FasePreconstruccion } from "../../common/enums.js";
import { colocarAsentamientoPreconstruccion } from "../../rooms/acciones/preconstruccion/colocarAsentamientoPreconstruccion.js";
import { colocarCaminoPreconstruccion } from "../../rooms/acciones/preconstruccion/colocarCaminoPreconstruccion.js";
import { elegirAsentamientoPreconstruccion } from "./elecciones/elegirAsentamientoPreconstruccion.js";
import { elegirCaminoPreconstruccion } from "./elecciones/elegirCaminoPreconstruccion.js";

//? Hace por el jugador del turno lo que le toca en la preconstruccion: el asentamiento o el camino
export function accionAutomaticaPreconstruccion(sala: CatanRoom): void {
    const sessionId = sala.partida.turnoActual;

    if (sala.partida.fasePreconstruccion === FasePreconstruccion.ASENTAMIENTO) {
        //* Elegir al azar un vertice valido y separar su posicion
        const vertice = elegirAsentamientoPreconstruccion(sala.tablero.vertices);
        const [h, d, p] = vertice.split(",").map(Number);

        colocarAsentamientoPreconstruccion(sala, sessionId, h, d, p);
        return;
    }

    if(sala.partida.fasePreconstruccion === FasePreconstruccion.CAMINO){
        //* Elegir al azar una arista libre pegada al ultimo asentamiento
        const jugador = sala.jugadores.get(sessionId);
        if (!jugador) return;
        
        const arista = elegirCaminoPreconstruccion(sala.tablero.aristas, jugador.ultimoAsentamiento);
        const [h, d, p] = arista.split(",").map(Number);
        
        colocarCaminoPreconstruccion(sala, sessionId, h, d, p);
        return;
    }
}
