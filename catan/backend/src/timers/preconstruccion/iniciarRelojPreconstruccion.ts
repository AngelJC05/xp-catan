import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { FasePartida } from "../../common/enums.js";
import { accionAutomaticaPreconstruccion } from "../../autoFunctions/preconstruccion/accionAutomaticaPreconstruccion.js";

//? Inicia el reloj de la preconstruccion, o lo reinicia si ya estaba en marcha
export function iniciarRelojPreconstruccion(sala: CatanRoom): void {
    sala.temporizador.programar(
        "preconstruccion",
        sala.tiempos.preconstruccion,
        () => {
            accionAutomaticaPreconstruccion(sala);

            //* Si la preconstruccion sigue, se inicia el reloj de la siguiente pieza
            if (sala.partida.fase === FasePartida.PRECONSTRUCCION) {
                iniciarRelojPreconstruccion(sala);
            }
        }
    );
}
