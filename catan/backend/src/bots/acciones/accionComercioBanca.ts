import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { FaseJuego, FasePartida } from "../../common/enums.js";
import { comerciarBanca, obtenerTasaDeComercio } from "../../functions/comerciarBanca.js";
import { registrarLogDeJugador } from "../../rooms/ayudantes/notificaciones.js";
import { objetivoDelBot } from "../metas/objetivoDelBot.js";

//? Si para su objetivo le falta una sola carta, la consigue con la banca entregando lo que mas le sobra
//? Solo entrega un recurso si le sobra al menos lo que pide su tasa (4:1, o menos con puertos)
//? Devuelve true si comercio
export function accionComercioBanca(sala: CatanRoom, sessionId: string): boolean {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador || !esSuFaseDeAcciones(sala, sessionId)) return false;

    const { falta, sobra } = objetivoDelBot(sala.tablero, jugador, sessionId);

    //* Solo cuando le falta exactamente una carta: con un cambio ya completa su objetivo
    const faltantes = Object.entries(falta);
    if (faltantes.length !== 1 || faltantes[0][1] !== 1) return false;
    const recibido = faltantes[0][0];

    //* De lo que le sobra, el que mas tiene de entre los que alcanzan su tasa
    const tasa = (recurso: string) =>
        obtenerTasaDeComercio(sessionId, sala.tablero.vertices, sala.tablero.puertos, recurso);

    let entregado = "";
    for (const [recurso, cantidad] of Object.entries(sobra)) {
        if (cantidad < tasa(recurso)) continue;
        if (entregado === "" || cantidad > sobra[entregado]) entregado = recurso;
    }
    if (entregado === "") return false;

    const resultado = comerciarBanca(
        jugador,
        sala.banca,
        sessionId,
        sala.tablero.vertices,
        sala.tablero.puertos,
        entregado,
        recibido
    );
    if (resultado.error) return false;

    registrarLogDeJugador(sala, sessionId, resultado.mensaje);
    return true;
}

//? El bot solo comercia en su turno, en la fase de acciones
function esSuFaseDeAcciones(sala: CatanRoom, sessionId: string): boolean {
    const { partida } = sala;
    return partida.fase === FasePartida.JUEGO
        && partida.faseJuego === FaseJuego.ACCIONES
        && partida.turnoActual === sessionId;
}
