import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
import { FaseJuego, FasePartida, FasePreconstruccion } from "../common/enums.js";
import { Jugador } from "./Jugador.js";
import { OfertaIntercambio } from "./OfertaIntercambio.js";
import { Reloj } from "./Reloj.js";

export class Partida extends Schema {
  @type("string") creador: string;
  @type("uint8") fase: FasePartida;
  @type("uint8") fasePreconstruccion: FasePreconstruccion;
  @type("int8") direccionPreconstruccion: number;
  @type("uint8") faseJuego: FaseJuego;
  @type("string") turnoActual: string;
  @type(["string"]) ordenJugadores = new ArraySchema<string>();
  @type(["string"]) jugadoresParaRobar = new ArraySchema<string>();
  @type({ map: "uint8" }) jugadoresParaDescartar = new MapSchema<number>();
  @type("boolean") cartaJugable: boolean;
  @type("string") ganador: string;
  @type("string") ejercitoMasGrande: string;
  @type("string") caminoMasLargo: string;
  @type("uint8") carreterasGratis: number;
  @type(OfertaIntercambio) ofertaIntercambio = new OfertaIntercambio();
  @type({ map: Reloj }) relojes = new MapSchema<Reloj>();

  constructor() {
    super();
    this.creador = "";
    this.ganador = "";
    this.fase = FasePartida.LOBBY;
    this.turnoActual = "";
    this.cartaJugable = false;
    this.fasePreconstruccion = FasePreconstruccion.ASENTAMIENTO;
    this.direccionPreconstruccion = 1;
    this.faseJuego = FaseJuego.DADOS;
    this.ganador = "";
    this.ejercitoMasGrande = "";
    this.caminoMasLargo = "";
    this.carreterasGratis = 0;
  }
}