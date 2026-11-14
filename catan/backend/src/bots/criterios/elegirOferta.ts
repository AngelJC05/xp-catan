import type { Costo } from "../metas/costos.js";

//? Cuantas cartas como maximo intercambia el bot en una oferta
export const MAXIMO_POR_OFERTA = 2;

//? Una oferta de intercambio del bot: lo que da y lo que pide
export interface OfertaDelBot {
    ofrecidos: Record<string, number>;
    solicitados: Record<string, number>;
}

//? Elige la oferta que el bot propone a los demas: pide lo que le falta y da lo que le sobra, parejo y con pocas cartas
//? Va del recurso que mas le falta al que menos y, para cada uno, del que mas le sobra al que menos
//? Con cada par prueba primero la mayor cantidad y luego menos; salta las que ya intento antes en el turno
//? Devuelve null si no hay nada que ofrecer o ya probo todo
export function elegirOferta(falta: Costo, sobra: Costo, intentadas: OfertaDelBot[]): OfertaDelBot | null {
    for (const [pide, cantidadFalta] of ordenarPorCantidad(falta)) {
        for (const [da, cantidadSobra] of ordenarPorCantidad(sobra)) {
            const maxima = Math.min(MAXIMO_POR_OFERTA, cantidadFalta, cantidadSobra);

            for (let cantidad = maxima; cantidad >= 1; cantidad--) {
                const oferta = { ofrecidos: { [da]: cantidad }, solicitados: { [pide]: cantidad } };
                if (!yaIntentada(oferta, intentadas)) return oferta;
            }
        }
    }

    return null;
}

//? Los recursos con cantidad mayor a 0, del que mas hay al que menos; en un empate queda primero el que aparece antes
function ordenarPorCantidad(recursos: Costo): [string, number][] {
    return Object.entries(recursos)
        .filter(([, cantidad]) => cantidad > 0)
        .sort(([, a], [, b]) => b - a);
}

function yaIntentada(oferta: OfertaDelBot, intentadas: OfertaDelBot[]): boolean {
    return intentadas.some((otra) => mismosRecursos(otra.ofrecidos, oferta.ofrecidos)
        && mismosRecursos(otra.solicitados, oferta.solicitados));
}

function mismosRecursos(a: Record<string, number>, b: Record<string, number>): boolean {
    const claves = Object.keys(a);
    return claves.length === Object.keys(b).length && claves.every((clave) => a[clave] === b[clave]);
}
