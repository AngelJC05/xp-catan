import type { CatanRoom } from "../../CatanRoom.js";

//? Datos que manda el cliente al crear la sala
export interface OpcionesCrear {
    alias?: string;
    privada?: boolean;
    codigoAcceso?: string;
    nombre?: string;
}

//? Configuracion de la sala ya con valores por defecto; aqui se agregaran las opciones nuevas (puntos para ganar, temporizador...)
export interface OpcionesSala {
    alias: string;
    privada: boolean;
    codigoAcceso: string;
    anfitrion: string;
}

//? Convierte lo que manda el cliente en la configuracion de la sala, rellenando lo que falte
export function leerOpciones(opciones?: OpcionesCrear): OpcionesSala {
    throw new Error("Sin implementar");
}

//? Atiende la creacion de la sala (onCreate): guarda su configuracion y publica su metadata en el lobby
export function manejarCreacion(sala: CatanRoom, opciones?: OpcionesCrear): void {
    throw new Error("Sin implementar");
}
