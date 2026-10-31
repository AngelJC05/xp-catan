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

//? Devuelve el tiempo enviado si es un numero de 0 en adelante, y si no el tiempo por defecto
function elegirTiempo(enviado: unknown, porDefecto: number): number {
    //* Solo se aceptan numeros, sin NaN ni Infinity
    if(typeof enviado !== "number" || !Number.isFinite(enviado)) return porDefecto;

    //* Un tiempo negativo no tiene sentido
    if(enviado < 0) return porDefecto;

    return enviado;
}

//? Convierte lo que manda el cliente en los tiempos de la sala, rellenando lo que falte
export function leerTiempos(opciones: Record<string, unknown> = {}): Tiempos {
    return {
        preconstruccion: elegirTiempo(opciones.preconstruccion, TIEMPOS_POR_DEFECTO.preconstruccion),
        dados: elegirTiempo(opciones.dados, TIEMPOS_POR_DEFECTO.dados),
        acciones: elegirTiempo(opciones.acciones, TIEMPOS_POR_DEFECTO.acciones),
        oferta: elegirTiempo(opciones.oferta, TIEMPOS_POR_DEFECTO.oferta),
        ladron: elegirTiempo(opciones.ladron, TIEMPOS_POR_DEFECTO.ladron),
        robo: elegirTiempo(opciones.robo, TIEMPOS_POR_DEFECTO.robo),
        descarte: elegirTiempo(opciones.descarte, TIEMPOS_POR_DEFECTO.descarte)
    };
}
