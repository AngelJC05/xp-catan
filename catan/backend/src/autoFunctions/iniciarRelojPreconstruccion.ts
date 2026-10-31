import type { CatanRoom } from "../rooms/CatanRoom.js";
import { colocarAsentamientoPreconstruccion } from "../rooms/acciones/colocarAsentamientoPreconstruccion.js";
import { elegirAsentamientoPreconstruccion } from "./elegirAsentamientoPreconstruccion.js";

//? Inicia el reloj de la preconstruccion, o lo reinicia si ya estaba en marcha
export function iniciarRelojPreconstruccion(sala: CatanRoom): void {
    sala.temporizador.programar(
        "preconstruccion",
        sala.tiempos.preconstruccion,
        () => {
            //* Elegir al azar un vertice valido y separar su posicion
            const vertice = elegirAsentamientoPreconstruccion(sala.tablero.vertices);
            const [h, d, p] = vertice.split(",").map(Number);

            //* Colocarlo a nombre del jugador del turno
            colocarAsentamientoPreconstruccion(sala, sala.partida.turnoActual, h, d, p);
        }
    );
}
