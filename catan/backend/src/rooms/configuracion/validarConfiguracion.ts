import { TIEMPOS_PERMITIDOS, type NombreTiempo } from "../../timers/tiempos.js";

//? Revisa que lo que manda el cliente sea una configuracion valida para la sala.
//? Devuelve el mensaje de error si algo no es valido, o null si todo esta bien
export function validarConfiguracion(configuracion: Record<string, unknown>): string | null {
    for (const [opcion, valor] of Object.entries(configuracion)) {
        //* Los puntos para ganar se validan aparte
        if (opcion === "puntos") continue;

        //* Solo existen las opciones de los temporizadores
        if (!Object.keys(TIEMPOS_PERMITIDOS).includes(opcion)) {
            return `La opcion ${opcion} no existe`;
        }

        //* El tiempo tiene que ser un numero de la lista de esa accion
        const permitidos = TIEMPOS_PERMITIDOS[opcion as NombreTiempo];
        if (typeof valor !== "number" || !permitidos.includes(valor)) {
            return `El tiempo de ${opcion} debe ser uno de: ${permitidos.join(", ")}`;
        }
    }

    return null;
}
