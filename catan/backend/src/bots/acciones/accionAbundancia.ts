import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { Desarrollo, FaseJuego, FasePartida } from "../../common/enums.js";
import { usarCartaAbundancia } from "../../rooms/acciones/cartas/usarCartaAbundancia.js";
import { objetivoDelBot } from "../metas/objetivoDelBot.js";

//? Usa la carta de abundancia si le faltan 1 o 2 recursos para su objetivo:
//? con 2 pide esos dos, con 1 pide ese y otro al azar de la banca; con mas o ninguno se la guarda
//? Devuelve true si la uso
export function accionAbundancia(sala: CatanRoom, sessionId: string, azar: () => number = Math.random): boolean {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador || !puedeUsarla(sala, sessionId)) return false;

    const { falta } = objetivoDelBot(sala.tablero, jugador, sessionId, undefined, sala.banca);
    const faltantes = Object.entries(falta).flatMap(([recurso, cantidad]) => Array(cantidad).fill(recurso));

    if (faltantes.length === 0 || faltantes.length > 2) return false;

    const [primero] = faltantes;
    const segundo = faltantes[1] ?? recursoAlAzar(sala, primero, azar);
    if (segundo === "") return false;

    return !usarCartaAbundancia(sala, sessionId, primero, segundo).error;
}

//? Un recurso al azar que la banca pueda dar ademas del primero, o "" si no hay
function recursoAlAzar(sala: CatanRoom, primero: string, azar: () => number): string {
    const disponibles = [...sala.banca.recursos.entries()]
        .filter(([recurso, cantidad]) => cantidad >= (recurso === primero ? 2 : 1))
        .map(([recurso]) => recurso);

    if (disponibles.length === 0) return "";
    return disponibles[Math.floor(azar() * disponibles.length)];
}

//? Las mismas reglas que un jugador: su turno, la fase de acciones, sin otra carta usada y con la carta
function puedeUsarla(sala: CatanRoom, sessionId: string): boolean {
    const { partida } = sala;
    if (partida.fase !== FasePartida.JUEGO || partida.faseJuego !== FaseJuego.ACCIONES) return false;
    if (partida.turnoActual !== sessionId || !partida.cartaJugable) return false;

    const cartas = sala.jugadores.get(sessionId)?.cartas_usables.get(`${Desarrollo.ABUNDANCIA}`) ?? 0;
    return cartas > 0;
}
