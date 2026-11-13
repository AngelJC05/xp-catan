import { Construccion, Desarrollo } from "../../common/enums.js";
import { obtenerTasaDeComercio } from "../../functions/comerciarBanca.js";
import type { Jugador } from "../../schemas/Jugador.js";
import type { Tablero } from "../../schemas/Tablero.js";
import { DISTANCIA_MAXIMA } from "../criterios/elegirMejorCamino.js";
import { esConstruible } from "../criterios/esConstruible.js";
import { puntuarVertice, VALOR_INTERES } from "../criterios/puntuarVertice.js";
import { COSTOS, type Costo, type TipoObjetivo } from "./costos.js";
import { faltaYSobra } from "./faltaYSobra.js";
import { recursosQueProduce } from "./recursosQueProduce.js";
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

//? Valor desde el que un vertice sirve para un poblado antes que subir una ciudad
const VALOR_POBLADO_ACEPTABLE = 4;

//? Devuelve el primer objetivo posible segun la prioridad: poblado, camino hacia un poblado, ciudad, poblado pobre y carta
//? Si ya le alcanza para una ciudad la toma de una vez, salvo que tambien le alcance para el poblado, que va primero
//? Una meta solo se toma si el bot ya tiene lo que pide, lo produce o lo puede conseguir con la banca o la abundancia; si no, pasa a la siguiente para no estancarse
//? Se calcula con el tablero de ese momento, asi que si un rival invalida un vertice la siguiente vez sale otro
//? La produccion se puede pasar ya calculada; si no, se saca del tablero
export function objetivoDelBot(
    tablero: Tablero,
    jugador: Jugador,
    sessionId: string,
    produccion: Set<string> = recursosQueProduce(tablero, sessionId)
): Objetivo {
    const tiene = (recurso: string, cantidad: number) => (jugador.recursos.get(recurso) ?? 0) >= cantidad;
    const alcanza = (tipo: TipoObjetivo) => Object.entries(COSTOS[tipo]).every(([recurso, cantidad]) => tiene(recurso, cantidad));
    const viable = (tipo: TipoObjetivo) => {
        const costo = COSTOS[tipo];

        //* Lo que le falta de recursos que no produce: solo se puede conseguir con la banca o con la abundancia
        const sinCubrir = Object.entries(costo).reduce((suma, [recurso, cantidad]) =>
            produccion.has(recurso) ? suma : suma + Math.max(0, cantidad - (jugador.recursos.get(recurso) ?? 0)), 0);

        return sinCubrir <= cambiosConLaBanca(tablero, jugador, sessionId, costo) + recursosDeAbundancia(jugador);
    };

    const puedePoblar = quedan(jugador, Construccion.ASENTAMIENTO) && viable("poblado");

    const candidatos = candidatosConstruibles(tablero, verticesAlcanzables(tablero, sessionId, DISTANCIA_MAXIMA));
    const conectados = candidatos.filter((candidato) => candidato.caminosNuevos === 0);

    const poblado = puedePoblar
        ? mejorCandidato(conectados.filter((candidato) => candidato.valor >= VALOR_POBLADO_ACEPTABLE))
        : null;
    const ciudad = viable("ciudad") ? mejorCiudad(tablero, jugador, sessionId) : null;

    if (poblado && alcanza("poblado")) return armar(jugador, "poblado", poblado.vertice);
    if (ciudad && alcanza("ciudad")) return armar(jugador, "ciudad", ciudad.vertice);

    if (poblado) return armar(jugador, "poblado", poblado.vertice);

    if (puedePoblar && quedan(jugador, Construccion.CAMINO) && viable("camino")) {
        const camino = mejorCandidato(candidatos.filter((candidato) =>
            candidato.caminosNuevos > 0 && candidato.valor >= VALOR_INTERES));
        if (camino) return armar(jugador, "camino", camino.vertice);
    }

    if (ciudad) return armar(jugador, "ciudad", ciudad.vertice);

    if (puedePoblar) {
        const pobre = mejorCandidato(conectados);
        if (pobre) return armar(jugador, "poblado", pobre.vertice);
    }

    return armar(jugador, "carta", "");
}

//? Cuantos recursos puede conseguir con la banca cambiando lo que le sobra del costo, segun la tasa de cada recurso
function cambiosConLaBanca(tablero: Tablero, jugador: Jugador, sessionId: string, costo: Costo): number {
    let cambios = 0;

    for (const [recurso, cantidad] of jugador.recursos) {
        const sobrante = cantidad - (costo[recurso] ?? 0);
        if (sobrante <= 0) continue;

        cambios += Math.floor(sobrante / obtenerTasaDeComercio(sessionId, tablero.vertices, tablero.puertos, recurso));
    }

    return cambios;
}

//? Una carta de abundancia le da hasta 2 recursos de la banca
function recursosDeAbundancia(jugador: Jugador): number {
    return (jugador.cartas_usables.get(`${Desarrollo.ABUNDANCIA}`) ?? 0) > 0 ? 2 : 0;
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

//? Los vertices alcanzables donde se puede construir, con su valor
function candidatosConstruibles(tablero: Tablero, alcanzables: Map<string, number>): Candidato[] {
    const candidatos: Candidato[] = [];

    for (const [clave, caminosNuevos] of alcanzables) {
        const vertice = tablero.vertices.get(clave);
        if (!vertice || !esConstruible(tablero, clave)) continue;

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
