//? Cuantas cartas de cada recurso pide algo, por ejemplo { madera: 1, ladrillo: 1 }
export type Costo = Record<string, number>;

export type TipoObjetivo = "ciudad" | "poblado" | "camino" | "carta";

//? Lo que cuesta cada objetivo del bot
export const COSTOS: Readonly<Record<TipoObjetivo, Costo>> = {
    ciudad: {},
    poblado: {},
    camino: {},
    carta: {}
};
