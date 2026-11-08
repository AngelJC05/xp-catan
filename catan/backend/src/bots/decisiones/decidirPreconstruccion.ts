import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { accionAutomaticaPreconstruccion } from "../../autoFunctions/preconstruccion/accionAutomaticaPreconstruccion.js";
import { actualizarRelojDados } from "../../timers/dados/actualizarRelojDados.js";
import { actualizarRelojPreconstruccion } from "../../timers/preconstruccion/actualizarRelojPreconstruccion.js";

//? Coloca la pieza que le toca al bot en la preconstruccion, el asentamiento o el camino
export function decidirPreconstruccion(sala: CatanRoom, sessionId: string): void {
    accionAutomaticaPreconstruccion(sala);

    //* Igual que los handlers, tiene que reiniciar el reloj de la preconstruccion y ver si se activa el de dados
    actualizarRelojPreconstruccion(sala);
    actualizarRelojDados(sala);
}
