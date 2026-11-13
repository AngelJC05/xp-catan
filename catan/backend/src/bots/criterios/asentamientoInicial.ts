import { Terreno } from "../../common/enums.js";
import { recursoTexto } from "../../common/recursoTexto.js";
import { hexagonosDelVertice } from "../../functions/hexagonosDelVertice.js";
import { verticesValidosPreconstruccion } from "../../autoFunctions/preconstruccion/elecciones/verticesValidosPreconstruccion.js";
import { Tablero } from "../../schemas/Tablero.js";
import { puntuarVertice } from "./puntuarVertice.js";

//? Lo que suma en el segundo asentamiento el primer recurso que no daba el primero, y cada uno de los siguientes
const EXTRA_PRIMER_RECURSO_NUEVO = 2;
const EXTRA_OTRO_RECURSO_NUEVO = 1;

//? Elige el vertice para el asentamiento del bot en la preconstruccion:
//? el primero es el que mejor puntua; el segundo suma un extra por los recursos que el primero no le daba
//? En un empate el primero; devuelve "" si no hay ningun vertice valido
export function elegirAsentamientoInicial(tablero: Tablero, sessionId: string): string {
    const yaTiene = recursosDeSusAsentamientos(tablero, sessionId);

    let elegido = "";
    let mejorValor = -1;

    for (const clave of verticesValidosPreconstruccion(tablero.vertices)) {
        const vertice = tablero.vertices.get(clave);
        const nuevos = [...recursosDelVertice(tablero, clave)].filter((recurso) => !yaTiene.has(recurso));

        //* En el primer asentamiento no tiene recursos, asi que ahi no se suma ningun extra
        const extra = yaTiene.size > 0 ? extraPorRecursosNuevos(nuevos.length) : 0;
        const valor = puntuarVertice(tablero.hexagonos, vertice) + extra;

        if (valor > mejorValor) {
            elegido = clave;
            mejorValor = valor;
        }
    }

    return elegido;
}

//? Lo que suma tener recursos nuevos: el primero vale 2 y cada uno de los siguientes 1
export function extraPorRecursosNuevos(cantidad: number): number {
    if (cantidad === 0) return 0;
    return EXTRA_PRIMER_RECURSO_NUEVO + (cantidad - 1) * EXTRA_OTRO_RECURSO_NUEVO;
}

//? Los recursos que dan los hexagonos que toca un vertice, sin el desierto
function recursosDelVertice(tablero: Tablero, clave: string): Set<string> {
    const vertice = tablero.vertices.get(clave);
    if (!vertice) return new Set();

    return new Set(hexagonosDelVertice(tablero.hexagonos, vertice)
        .filter((hexagono) => hexagono.terreno !== Terreno.DESIERTO)
        .map((hexagono) => recursoTexto(hexagono.terreno)));
}

//? Los recursos que ya le dan al bot sus asentamientos
function recursosDeSusAsentamientos(tablero: Tablero, sessionId: string): Set<string> {
    const recursos = new Set<string>();

    for (const [clave, vertice] of tablero.vertices) {
        if (vertice.propietario !== sessionId) continue;
        recursosDelVertice(tablero, clave).forEach((recurso) => recursos.add(recurso));
    }

    return recursos;
}
