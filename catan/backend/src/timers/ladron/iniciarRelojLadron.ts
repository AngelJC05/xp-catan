import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { moverLadronAutomatico } from "../../autoFunctions/ladron/moverLadronAutomatico.js";

//? Inicia el reloj para que el jugador del turno mueva al ladron despues de un 7
export function iniciarRelojLadron(sala: CatanRoom): void {
    sala.temporizador.programar(
        "ladron",
        sala.tiempos.ladron,
        () => moverLadronAutomatico(sala)
    );
}
