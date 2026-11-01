import type { CatanRoom } from "../rooms/CatanRoom.js";
import { FasePartida } from "../common/enums.js";
import { iniciarRelojPreconstruccion } from "./iniciarRelojPreconstruccion.js";

//? Reinicia el reloj si la preconstruccion sigue, o lo cancela si ya termino
export function actualizarRelojPreconstruccion(sala: CatanRoom): void {
    if (sala.partida.fase === FasePartida.PRECONSTRUCCION) {
        iniciarRelojPreconstruccion(sala);
        return;
    }

    sala.temporizador.cancelar("preconstruccion");
}
