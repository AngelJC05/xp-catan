import type { Costo } from "../metas/costos.js";

//? Indica si al bot le conviene una oferta de intercambio segun lo que le falta y le sobra para su objetivo:
//? le tienen que dar al menos un recurso que le falte y todo lo que le piden le tiene que sobrar
export function convieneOferta(
    falta: Costo,
    sobra: Costo,
    ofrecidos: Record<string, number>,
    solicitados: Record<string, number>
): boolean {
    const leSirve = Object.entries(ofrecidos)
        .some(([recurso, cantidad]) => cantidad > 0 && (falta[recurso] ?? 0) > 0);

    const puedeDarlo = Object.entries(solicitados)
        .every(([recurso, cantidad]) => cantidad <= (sobra[recurso] ?? 0));

    return leSirve && puedeDarlo;
}
