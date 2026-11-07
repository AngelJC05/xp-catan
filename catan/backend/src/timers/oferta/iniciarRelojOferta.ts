import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { despertarBots } from "../../bots/despertarBots.js";
import { vencerOferta } from "../../autoFunctions/comercio/vencerOferta.js";

//? Inicia el reloj para responder la oferta de intercambio recien publicada
export function iniciarRelojOferta(sala: CatanRoom): void {
    sala.temporizador.programar(
        "oferta",
        sala.tiempos.oferta,
        () => vencerOferta(sala)
    );

    despertarBots(sala, sala.clock);
}
