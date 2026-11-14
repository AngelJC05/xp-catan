import type { CatanRoom } from "../rooms/CatanRoom.js";
import { FaseJuego, FasePartida, FasePreconstruccion } from "../common/enums.js";

//? Situaciones en las que un bot tiene algo que hacer
export type SituacionBot =
    | "asentamientoInicial"
    | "caminoInicial"
    | "dados"
    | "acciones"
    | "ladron"
    | "robo"
    | "descarte"
    | "carreteras"
    | "oferta";

//? Situacion que corresponde a cada fase del turno de juego
const SITUACION_POR_FASE_JUEGO: Partial<Record<FaseJuego, SituacionBot>> = {
    [FaseJuego.DADOS]: "dados",
    [FaseJuego.ACCIONES]: "acciones",
    [FaseJuego.LADRON]: "ladron",
    [FaseJuego.ROBO]: "robo",
    [FaseJuego.CARRETERAS]: "carreteras"
};

//? Devuelve la situacion en la que esta el bot o null si ahora no le toca hacer nada
export function situacionDelBot(sala: CatanRoom, sessionId: string): SituacionBot | null {
    const { partida, jugadores } = sala;
    if (!jugadores.has(sessionId)) return null;

    if (partida.fase === FasePartida.PRECONSTRUCCION) {
        if (partida.turnoActual !== sessionId) return null;
        return partida.fasePreconstruccion === FasePreconstruccion.ASENTAMIENTO ? "asentamientoInicial" : "caminoInicial";
    }

    if (partida.fase !== FasePartida.JUEGO) return null;

    //* Descartar y responder ofertas se puede aunque no sea su turno
    if (partida.jugadoresParaDescartar.has(sessionId)) return "descarte";
    if (partida.ofertaIntercambio.respuestas.get(sessionId) === 0) return "oferta";

    if (partida.turnoActual !== sessionId) return null;
    return SITUACION_POR_FASE_JUEGO[partida.faseJuego] ?? null;
}
