import type { CatanRoom } from "../CatanRoom.js";
import { FasePartida } from "../../common/enums.js";
import { actualizarCaminoMasLargo } from "../../functions/actualizarCaminoMasLargo.js";
import { verificarVictoria } from "../../functions/verificarVictoria.js";
import { registrarLogSistema } from "./notificaciones.js";

//? Recalcula el titulo de camino mas largo, avisa en el log y comprueba si el titular gano
export function revisarCaminoMasLargo(sala: CatanRoom): void {
    if (sala.partida.fase === FasePartida.FINALIZADA) return;

    //* Actualizar el camino mas largo y obtener el resultado
    const resultado = actualizarCaminoMasLargo(
        sala.partida,
        sala.tablero.vertices,
        sala.tablero.aristas,
        sala.jugadores
    );
    if (resultado.error) return;

    if (resultado.mensaje !== "") {
        registrarLogSistema(sala, resultado.mensaje);
    }

    //* El titulo puede transferirse a otro y darle la victoria
    const titular = sala.jugadores.get(sala.partida.caminoMasLargo);
    if (titular) {
        verificarVictoria(sala.partida, titular, sala.partida.caminoMasLargo, sala);
    }
}
