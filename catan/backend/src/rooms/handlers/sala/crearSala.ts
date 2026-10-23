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
export function leerOpciones(opciones: OpcionesCrear = {}): OpcionesSala {
    return {
        alias: opciones.alias || "Catan Room",
        privada: opciones.privada || false,
        codigoAcceso: opciones.codigoAcceso || "",
        anfitrion: opciones.nombre || ""
    };
}

//? Atiende la creacion de la sala (onCreate): guarda su configuracion y publica su metadata en el lobby
export function manejarCreacion(sala: CatanRoom, opciones?: OpcionesCrear): void {
    const { alias, privada, codigoAcceso, anfitrion } = leerOpciones(opciones);

    //* Si se ingresa codigo de acceso, se guarda en la sala (no se publica en la metadata)
    sala.codigoAcceso = codigoAcceso;

    //* Seteamos la data de la sala
    sala.setMetadata({
        alias,
        estado: "EN LOBBY",
        privada,
        anfitrion
    });
}
