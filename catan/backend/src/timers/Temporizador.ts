import { MapSchema } from "@colyseus/schema";
import { Reloj } from "../schemas/Reloj.js";
import type { NombreTiempo } from "./tiempos.js";

//? Lo que necesita el temporizador del reloj de la sala
export interface RelojSala {
    setTimeout(
        accion: () => void, 
        milisegundos: number
    ): { 
        clear(): void 
    };
}

//? Programa, cancela y limpia los relojes de la sala
export class Temporizador {
    private relojSala: RelojSala;
    private relojes: MapSchema<Reloj>;
    private ahora: () => number;
    private activos = new Map<NombreTiempo, { clear(): void }>();

    constructor(
        relojSala: RelojSala,
        relojes: MapSchema<Reloj> = new MapSchema<Reloj>(),
        ahora: () => number = () => Date.now()
    ) {
        this.relojSala = relojSala;
        this.relojes = relojes;
        this.ahora = ahora;
    }

    //? Inicia el reloj de una accion o reinicia su tiempo si ya estaba en marcha
    programar(nombre: NombreTiempo, segundos: number, alVencer: () => void): void {
        //* Si ya habia un reloj de esta accion se cancela
        this.cancelar(nombre);

        //* Con 0 segundos no hay limite de tiempo, asi que no se programa nada
        if(segundos === 0) return;

        const reloj = this.relojSala.setTimeout(() => {
            this.activos.delete(nombre);
            alVencer();
        }, segundos * 1000);

        this.activos.set(nombre, reloj);
    }

    //? Cancela el reloj de una accion, si existe
    cancelar(nombre: NombreTiempo): void {
        const reloj = this.activos.get(nombre);
        if(!reloj) return;

        reloj.clear();
        this.activos.delete(nombre);
    }

    //? Cancela todos los relojes activos
    limpiar(): void {
        this.activos.forEach((reloj) => reloj.clear());
        this.activos.clear();
    }

    //? Indica si una accion tiene un reloj corriendo
    estaActivo(nombre: NombreTiempo): boolean {
        return this.activos.has(nombre);
    }
}
