import { Tablero } from "../../schemas/Tablero.js";
import { aristasDelVertice, extremosDeArista } from "../../functions/aristas.js";
import { puntuarVertice } from "./puntuarVertice.js";

//? Hasta cuantos caminos de distancia busca el bot un vertice donde construir
const DISTANCIA_MAXIMA = 2;

//? Lo que vale un camino posible: el mejor vertice al que lleva y a cuantos caminos esta
interface Destino {
    valor: number;
    distancia: number;
}

//? De los caminos posibles elige el que lleva al vertice mejor puntuado, a 2 caminos como maximo
//? En un empate prefiere el vertice mas cercano y luego el primero de la lista
//? Devuelve "" si no hay caminos o si ninguno lleva a un vertice donde se pueda construir
export function elegirMejorCamino(tablero: Tablero, sessionId: string, posibles: string[]): string {
    let mejorCamino = "";
    let mejorDestino: Destino | null = null;

    for (const camino of posibles) {
        const destino = mejorDestinoDelCamino(tablero, sessionId, camino);
        if (!destino) continue;

        if (!mejorDestino || esMejor(destino, mejorDestino)) {
            mejorCamino = camino;
            mejorDestino = destino;
        }
    }

    return mejorCamino;
}

//? Un destino es mejor si vale mas, o si vale lo mismo y esta mas cerca
function esMejor(destino: Destino, otro: Destino): boolean {
    if (destino.valor !== otro.valor) return destino.valor > otro.valor;
    return destino.distancia < otro.distancia;
}

//? Busca el mejor vertice construible al que lleva un camino, o null si no lleva a ninguno
function mejorDestinoDelCamino(tablero: Tablero, sessionId: string, camino: string): Destino | null {
    if (!tablero.aristas.has(camino)) return null;

    let mejor: Destino | null = null;

    //* Se avanza desde el extremo lejano: el que no toca lo que el bot ya tiene
    for (const extremo of extremosLejanos(tablero, sessionId, camino)) {
        recorrer(extremo, camino, 1, (vertice, distancia) => {
            if (!esConstruible(tablero, vertice)) return;

            const destino = { valor: puntuarVertice(tablero.hexagonos, tablero.vertices.get(vertice)), distancia };
            if (!mejor || esMejor(destino, mejor)) mejor = destino;
        });
    }

    return mejor;

    //? Visita el vertice y, si no se paso de la distancia, sigue por los caminos que el bot puede usar
    function recorrer(
        vertice: string,
        llegada: string,
        distancia: number,
        visitar: (vertice: string, distancia: number) => void
    ): void {
        if (!tablero.vertices.has(vertice)) return;
        visitar(vertice, distancia);

        //* Con 2 caminos como maximo no hace falta revisar si se pasa por una construccion rival:
        //* el vertice siguiente queda pegado a ella y la regla de distancia ya lo descarta
        if (distancia >= DISTANCIA_MAXIMA) return;

        for (const siguiente of aristasDelVertice(vertice)) {
            if (siguiente === llegada) continue;

            //* Solo se sigue por caminos libres o propios
            const arista = tablero.aristas.get(siguiente);
            if (!arista || (arista.propietario !== "" && arista.propietario !== sessionId)) continue;

            const [a, b] = extremosDeArista(siguiente);
            recorrer(a === vertice ? b : a, siguiente, distancia + 1, visitar);
        }
    }
}

//? Devuelve el extremo del camino que no toca lo que el bot ya tiene; si los dos lo tocan o ninguno, ambos
function extremosLejanos(tablero: Tablero, sessionId: string, camino: string): string[] {
    const extremos = extremosDeArista(camino);
    const lejanos = extremos.filter((vertice) => !tocaLoDelBot(tablero, sessionId, vertice, camino));

    return lejanos.length > 0 ? lejanos : extremos;
}

//? Un vertice toca lo del bot si tiene su construccion o un camino suyo distinto al que se esta evaluando
function tocaLoDelBot(tablero: Tablero, sessionId: string, vertice: string, camino: string): boolean {
    if (tablero.vertices.get(vertice)?.propietario === sessionId) return true;

    return aristasDelVertice(vertice).some((clave) =>
        clave !== camino && tablero.aristas.get(clave)?.propietario === sessionId);
}

//? Se puede construir en un vertice libre que no tenga construcciones en los vertices vecinos
function esConstruible(tablero: Tablero, vertice: string): boolean {
    if (tablero.vertices.get(vertice)?.propietario !== "") return false;

    return aristasDelVertice(vertice).every((clave) => {
        if (!tablero.aristas.has(clave)) return true;
        const [a, b] = extremosDeArista(clave);
        const vecino = tablero.vertices.get(a === vertice ? b : a);
        return !vecino || vecino.propietario === "";
    });
}
