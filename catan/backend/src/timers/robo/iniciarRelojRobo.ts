import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { despertarBots } from "../../bots/despertarBots.js";
import { roboAutomatico } from "../../autoFunctions/robo/roboAutomatico.js";

//? Inicia el reloj para que el jugador del turno elija a quien robar
export function iniciarRelojRobo(sala: CatanRoom): void {
    sala.temporizador.programar(
        "robo",
        sala.tiempos.robo,
        () => roboAutomatico(sala)
    );

    despertarBots(sala, sala.clock);
}
