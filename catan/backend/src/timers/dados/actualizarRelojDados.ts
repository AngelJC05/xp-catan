import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { FaseJuego, FasePartida } from "../../common/enums.js";
import { iniciarRelojDados } from "./iniciarRelojDados.js";

//? Inicia el reloj si la partida espera los dados, o lo cancela si ya no
export function actualizarRelojDados(sala: CatanRoom): void {
    if (sala.partida.fase === FasePartida.JUEGO && sala.partida.faseJuego === FaseJuego.DADOS) {
        iniciarRelojDados(sala);
        return;
    }

    sala.temporizador.cancelar("dados");
}
