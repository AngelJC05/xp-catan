//? Acciones del juego que tienen un limite de tiempo
export type NombreTiempo =
    | "preconstruccion"
    | "dados"
    | "acciones"
    | "oferta"
    | "ladron"
    | "robo"
    | "descarte";

//? Segundos que tiene el jugador para cada accion
export type Tiempos = Record<NombreTiempo, number>;

export const TIEMPOS_POR_DEFECTO: Readonly<Tiempos> = {
    preconstruccion: 45,
    dados: 15,
    acciones: 90,
    oferta: 20,
    ladron: 25,
    robo: 15,
    descarte: 30
};

//? Convierte lo que manda el cliente en los tiempos de la sala, rellenando lo que falte
export function leerTiempos(opciones?: Record<string, unknown>): Tiempos {
    return { ...TIEMPOS_POR_DEFECTO };
}
