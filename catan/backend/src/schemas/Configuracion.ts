import { Schema, type } from "@colyseus/schema";

export class Configuracion extends Schema {
    @type("uint8") preconstruccion: number;
    @type("uint8") dados: number;
    @type("uint8") acciones: number;
    @type("uint8") oferta: number;
    @type("uint8") ladron: number;
    @type("uint8") robo: number;
    @type("uint8") descarte: number;
    @type("uint8") puntos: number;

    constructor() {
        super();
        this.preconstruccion = 0;
        this.dados = 0;
        this.acciones = 0;
        this.oferta = 0;
        this.ladron = 0;
        this.robo = 0;
        this.descarte = 0;
        this.puntos = 0;
    }
}
