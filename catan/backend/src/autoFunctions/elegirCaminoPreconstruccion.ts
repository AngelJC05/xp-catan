import { MapSchema } from "@colyseus/schema";
import { Arista } from "../schemas/Arista.js";

//? Elige al azar una arista libre pegada al ultimo asentamiento, devuelve "" si no hay ninguna
export function elegirCaminoPreconstruccion(
    aristas: MapSchema<Arista>,
    ultimoAsentamiento: string
): string {
    return "";
}
