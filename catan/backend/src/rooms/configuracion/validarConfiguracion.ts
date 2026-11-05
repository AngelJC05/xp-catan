import { TIEMPOS_PERMITIDOS, type NombreTiempo } from "../../timers/tiempos.js";
import { PUNTOS_MAXIMOS, PUNTOS_MINIMOS } from "./puntosParaGanar.js";

//? Revisa que lo que manda el cliente sea una configuracion valida para la sala.
//? Devuelve error: true con el mensaje de lo que no es valido, o error: false si todo esta bien
export function validarConfiguracion(configuracion: Record<string, unknown>): {
    error: boolean,
    mensaje: string
} {
    for (const [opcion, valor] of Object.entries(configuracion)) {
        //* Los puntos para ganar son un entero entre el minimo y el maximo
        if (opcion === "puntos") {
            const valido = typeof valor === "number"
                && Number.isInteger(valor)
                && valor >= PUNTOS_MINIMOS
                && valor <= PUNTOS_MAXIMOS;

            if (!valido) {
                return {
                    error: true,
                    mensaje: `Los puntos para ganar deben ser un entero de ${PUNTOS_MINIMOS} a ${PUNTOS_MAXIMOS}`
                };
            }
            continue;
        }

        //* Solo existen las opciones de los temporizadores
        if (!Object.keys(TIEMPOS_PERMITIDOS).includes(opcion)) {
            return {
                error: true,
                mensaje: `La opcion ${opcion} no existe`
            };
        }

        //* El tiempo tiene que ser un numero de la lista de esa accion
        const permitidos = TIEMPOS_PERMITIDOS[opcion as NombreTiempo];
        if (typeof valor !== "number" || !permitidos.includes(valor)) {
            return {
                error: true,
                mensaje: `El tiempo de ${opcion} debe ser uno de: ${permitidos.join(", ")}`
            };
        }
    }

    return {
        error: false,
        mensaje: "Configuracion valida"
    };
}
