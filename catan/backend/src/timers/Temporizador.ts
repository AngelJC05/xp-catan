import type { NombreTiempo } from "./tiempos.js";

//? Lo que necesita el temporizador del reloj de la sala
export interface RelojSala {
    setTimeout(
        accion: () => void,
        milisegundos: number): { 
            clear(): void 
        };
}

//? Programa, cancela y limpia los relojes de la sala; solo puede haber uno activo por cada accion
export class Temporizador {
    constructor(private reloj: RelojSala) {}

    //? Inicia el reloj de una accion, si ya existia lo reinicia
    programar(nombre: NombreTiempo, segundos: number, alTerminar: () => void): void {
    }

    //? Cancela el reloj de una accion, si existe
    cancelar(nombre: NombreTiempo): void {
    }

    //? Cancela todos los relojes activos
    limpiar(): void {
    }

    //? Indica si una accion tiene un reloj corriendo
    estaActivo(nombre: NombreTiempo): boolean {
        return false;
    }
}
