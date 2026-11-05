import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { FaseJuego, FasePartida } from "../../common/enums.js";
import { lanzarDados } from "../../functions/lanzarDados.js";
import { aplicarTirada } from "../../rooms/acciones/dados/aplicarTirada.js";

//? Tira los dados por el jugador del turno y sigue el flujo normal: recursos, descarte o ladron
//? Recibe la forma de tirar para poder probar una tirada fija
export function tiradaAutomatica(sala: CatanRoom, tirar = lanzarDados): void {
    //* Solo se tira si la partida sigue esperando los dados
    if (sala.partida.fase !== FasePartida.JUEGO) return;
    if (sala.partida.faseJuego !== FaseJuego.DADOS) return;

    aplicarTirada(sala, tirar());
}
