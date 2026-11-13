import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { FaseJuego, FasePartida } from "../../common/enums.js";
import { proponerOfertaDeJugador } from "../../rooms/acciones/comercio/proponerOfertaDeJugador.js";
import { elegirOferta } from "../criterios/elegirOferta.js";
import { objetivoDelBot } from "../metas/objetivoDelBot.js";

//? Cuantas ofertas de intercambio puede proponer un bot en un turno
export const MAXIMO_OFERTAS_POR_TURNO = 3;

//? Propone una oferta de intercambio a los demas con lo que le falta y le sobra para su objetivo
//? Solo una a la vez y hasta 3 por turno, siempre distintas; no ofrece si su objetivo es comprar una carta
//? Va despues de la banca, de construir y de los caminos, asi que solo llega aqui si eso no pudo resolverlo
//? Devuelve true si la propuso
export function accionOfertar(sala: CatanRoom, sessionId: string, produccion?: Set<string>): boolean {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador || !esSuFaseDeAcciones(sala, sessionId)) return false;

    const { partida } = sala;
    if (partida.ofertaIntercambio.jugador !== "") return false;
    if (partida.ofertasDelTurno.length >= MAXIMO_OFERTAS_POR_TURNO) return false;

    const objetivo = objetivoDelBot(sala.tablero, jugador, sessionId, produccion, sala.banca);
    if (objetivo.tipo === "carta") return false;

    const oferta = elegirOferta(objetivo.falta, objetivo.sobra, partida.ofertasDelTurno);
    if (!oferta) return false;

    if (proponerOfertaDeJugador(sala, sessionId, oferta.ofrecidos, oferta.solicitados).error) return false;

    partida.ofertasDelTurno.push(oferta);
    return true;
}

//? El bot solo propone ofertas en su turno, en la fase de acciones
function esSuFaseDeAcciones(sala: CatanRoom, sessionId: string): boolean {
    const { partida } = sala;
    return partida.fase === FasePartida.JUEGO
        && partida.faseJuego === FaseJuego.ACCIONES
        && partida.turnoActual === sessionId;
}
