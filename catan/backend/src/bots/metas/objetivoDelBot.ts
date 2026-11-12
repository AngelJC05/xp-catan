import { Construccion } from "../../common/enums.js";
import type { Jugador } from "../../schemas/Jugador.js";
import type { Tablero } from "../../schemas/Tablero.js";
import { DISTANCIA_MAXIMA } from "../criterios/elegirMejorCamino.js";
import { esConstruible } from "../criterios/esConstruible.js";
import { esVerticeRelevante, puntuarVertice } from "../criterios/puntuarVertice.js";
import { COSTOS, type Costo, type TipoObjetivo } from "./costos.js";
import { faltaYSobra } from "./faltaYSobra.js";
import { verticesAlcanzables } from "./verticesAlcanzables.js";

//? Lo que el bot quiere conseguir: que es, en que vertice (vacio para la carta), lo que cuesta y lo que le falta y sobra
export interface Objetivo {
    tipo: TipoObjetivo;
    vertice: string;
    costo: Costo;
    falta: Costo;
    sobra: Costo;
}

//? Un vertice candidato con su valor y los caminos nuevos que hacen falta para llegar a el
interface Candidato {
    vertice: string;
    valor: number;
    caminosNuevos: number;
}

//? Devuelve el primer objetivo posible segun la prioridad: ciudad, poblado, camino y carta
//? Se calcula con el tablero de ese momento, asi que si un rival invalida un vertice la siguiente vez sale otro
export function objetivoDelBot(tablero: Tablero, jugador: Jugador, sessionId: string): Objetivo {
    const ciudad = mejorCiudad(tablero, jugador, sessionId);
    if (ciudad) return armar(jugador, "ciudad", ciudad.vertice);

    const alcanzables = verticesAlcanzables(tablero, sessionId, DISTANCIA_MAXIMA);
    const candidatos = candidatosRelevantes(tablero, alcanzables);

    if (quedan(jugador, Construccion.ASENTAMIENTO)) {
        const poblado = mejorCandidato(candidatos.filter((candidato) => candidato.caminosNuevos === 0));
        if (poblado) return armar(jugador, "poblado", poblado.vertice);
    }

    if (quedan(jugador, Construccion.CAMINO)) {
        const camino = mejorCandidato(candidatos.filter((candidato) => candidato.caminosNuevos > 0));
        if (camino) return armar(jugador, "camino", camino.vertice);
    }

    return armar(jugador, "carta", "");
}

function quedan(jugador: Jugador, construccion: Construccion): boolean {
    return (jugador.construccionesDisponibles.get(`${construccion}`) ?? 0) > 0;
}

//? El asentamiento propio de mayor valor, o null si no tiene o ya no le quedan ciudades
function mejorCiudad(tablero: Tablero, jugador: Jugador, sessionId: string): Candidato | null {
    if (!quedan(jugador, Construccion.CIUDAD)) return null;

    const asentamientos: Candidato[] = [];
    for (const [clave, vertice] of tablero.vertices) {
        if (vertice.propietario !== sessionId || vertice.constuccion !== Construccion.ASENTAMIENTO) continue;
        asentamientos.push({ vertice: clave, valor: puntuarVertice(tablero.hexagonos, vertice), caminosNuevos: 0 });
    }

    return mejorCandidato(asentamientos);
}

//? Los vertices alcanzables donde se puede construir y que valen la pena
function candidatosRelevantes(tablero: Tablero, alcanzables: Map<string, number>): Candidato[] {
    const candidatos: Candidato[] = [];

    for (const [clave, caminosNuevos] of alcanzables) {
        const vertice = tablero.vertices.get(clave);
        if (!vertice || !esConstruible(tablero, clave) || !esVerticeRelevante(tablero.hexagonos, vertice)) continue;

        candidatos.push({ vertice: clave, valor: puntuarVertice(tablero.hexagonos, vertice), caminosNuevos });
    }

    return candidatos;
}

//? El de mayor valor; en un empate el mas cercano y luego el primero
function mejorCandidato(candidatos: Candidato[]): Candidato | null {
    let mejor: Candidato | null = null;

    for (const candidato of candidatos) {
        if (!mejor
            || candidato.valor > mejor.valor
            || (candidato.valor === mejor.valor && candidato.caminosNuevos < mejor.caminosNuevos)) {
            mejor = candidato;
        }
    }

    return mejor;
}

function armar(jugador: Jugador, tipo: TipoObjetivo, vertice: string): Objetivo {
    const costo = COSTOS[tipo];
    return { tipo, vertice, costo, ...faltaYSobra(jugador, costo) };
}
