import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { construirCaminoDeJugador } from "../../rooms/acciones/construccion/construirCaminoDeJugador.js";
import { aristasDelVertice, extremosDeArista } from "../../functions/aristas.js";
import type { Tablero } from "../../schemas/Tablero.js";
import { elegirMejorCamino } from "../criterios/elegirMejorCamino.js";
import { objetivoDelBot } from "../metas/objetivoDelBot.js";

//? Construye un camino con el mejor criterio si su objetivo es un camino y ya le alcanzan los recursos
//? Devuelve true si construyo; con otro objetivo, sin recursos o sin camino posible no hace nada
export function accionConstruirCamino(sala: CatanRoom, sessionId: string, produccion?: Set<string>): boolean {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador) return false;

    const objetivo = objetivoDelBot(sala.tablero, jugador, sessionId, produccion);
    if (objetivo.tipo !== "camino" || Object.keys(objetivo.falta).length > 0) return false;

    const camino = elegirMejorCamino(sala.tablero, sessionId, caminosPosibles(sala.tablero, sessionId));
    if (camino === "") return false;

    const [h, d, p] = camino.split(",").map(Number);
    return !construirCaminoDeJugador(sala, sessionId, { h, d, p }).error;
}

//? Los caminos libres que tocan una construccion propia o el final de un camino propio
//? Un vertice con una construccion rival no sirve para seguir: ese camino estaria bloqueado
function caminosPosibles(tablero: Tablero, sessionId: string): string[] {
    const puntos = new Set<string>();

    for (const [clave, vertice] of tablero.vertices) {
        if (vertice.propietario === sessionId) puntos.add(clave);
    }

    for (const [clave, arista] of tablero.aristas) {
        if (arista.propietario !== sessionId) continue;

        for (const extremo of extremosDeArista(clave)) {
            const dueno = tablero.vertices.get(extremo)?.propietario;
            if (dueno === "" || dueno === sessionId) puntos.add(extremo);
        }
    }

    const posibles = new Set<string>();
    for (const punto of puntos) {
        for (const clave of aristasDelVertice(punto)) {
            if (tablero.aristas.get(clave)?.propietario === "") posibles.add(clave);
        }
    }

    return [...posibles];
}
