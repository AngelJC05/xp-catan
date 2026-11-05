import { Schema, type } from "@colyseus/schema";
import { PUNTOS_POR_DEFECTO } from "../rooms/configuracion/puntosParaGanar.js";
import { TIEMPOS_POR_DEFECTO } from "../timers/tiempos.js";

//? Configuracion de la partida que elige el creador en el lobby: segundos de cada temporizador y puntos para ganar
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
        this.preconstruccion = TIEMPOS_POR_DEFECTO.preconstruccion;
        this.dados = TIEMPOS_POR_DEFECTO.dados;
        this.acciones = TIEMPOS_POR_DEFECTO.acciones;
        this.oferta = TIEMPOS_POR_DEFECTO.oferta;
        this.ladron = TIEMPOS_POR_DEFECTO.ladron;
        this.robo = TIEMPOS_POR_DEFECTO.robo;
        this.descarte = TIEMPOS_POR_DEFECTO.descarte;
        this.puntos = PUNTOS_POR_DEFECTO;
    }
}
