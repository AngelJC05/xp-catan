//? Cuantas cartas de cada recurso pide algo, por ejemplo { madera: 1, ladrillo: 1 }
export type Costo = Record<string, number>;

export type TipoObjetivo = "ciudad" | "poblado" | "camino" | "carta";

//? Lo que cuesta cada objetivo del bot
export const COSTOS: Readonly<Record<TipoObjetivo, Costo>> = {
    ciudad: { mineral: 3, trigo: 2 },
    poblado: { madera: 1, ladrillo: 1, trigo: 1, lana: 1 },
    camino: { madera: 1, ladrillo: 1 },
    carta: { mineral: 1, trigo: 1, lana: 1 }
};
