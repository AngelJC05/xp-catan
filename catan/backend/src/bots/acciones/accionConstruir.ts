import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { construirAsentamientoDeJugador } from "../../rooms/acciones/construccion/construirAsentamientoDeJugador.js";
import { construirCiudadDeJugador } from "../../rooms/acciones/construccion/construirCiudadDeJugador.js";
import { objetivoDelBot } from "../metas/objetivoDelBot.js";

//? Construye el poblado o la ciudad que es el objetivo del bot, si ya le alcanzan los recursos
//? Devuelve true si construyo algo; con cualquier otro objetivo o sin recursos no hace nada
export function accionConstruir(sala: CatanRoom, sessionId: string, produccion?: Set<string>): boolean {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador) return false;

    const objetivo = objetivoDelBot(sala.tablero, jugador, sessionId, produccion);
    if (objetivo.tipo !== "poblado" && objetivo.tipo !== "ciudad") return false;
    if (Object.keys(objetivo.falta).length > 0) return false;

    const [h, d, p] = objetivo.vertice.split(",").map(Number);
    const construir = objetivo.tipo === "ciudad" ? construirCiudadDeJugador : construirAsentamientoDeJugador;

    return !construir(sala, sessionId, { h, d, p }).error;
}
