import type { CatanRoom } from "../rooms/CatanRoom.js";
import { accionAutomaticaPreconstruccion } from "./accionAutomaticaPreconstruccion.js";

//? Inicia el reloj de la preconstruccion, o lo reinicia si ya estaba en marcha
export function iniciarRelojPreconstruccion(sala: CatanRoom): void {
    sala.temporizador.programar(
        "preconstruccion",
        sala.tiempos.preconstruccion,
        () => accionAutomaticaPreconstruccion(sala)
    );
}
