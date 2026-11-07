import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { despertarBots } from "../../bots/despertarBots.js";
import { descarteAutomatico } from "../../autoFunctions/descarte/descarteAutomatico.js";

//? Inicia el reloj para que los jugadores descarten despues de un 7
export function iniciarRelojDescarte(sala: CatanRoom): void {
    sala.temporizador.programar(
        "descarte",
        sala.tiempos.descarte,
        () => descarteAutomatico(sala)
    );

    despertarBots(sala, sala.clock);
}
