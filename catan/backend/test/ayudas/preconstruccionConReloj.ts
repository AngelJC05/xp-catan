import { FasePartida, FasePreconstruccion } from "../../src/common/enums.js";
import { Temporizador } from "../../src/timers/Temporizador.js";
import { TIEMPOS_POR_DEFECTO } from "../../src/timers/tiempos.js";
import { armarReloj } from "./relojFalso.js";
import { armarSala } from "./salaFalsa.js";

export const ANGEL = "jugadorAngel";
export const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en preconstruccion con el temporizador
export function armarPreconstruccionConReloj() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  const { reloj, programados, vencer } = armarReloj();

  Object.assign(armado.sala, {
    temporizador: new Temporizador(reloj),
    tiempos: { ...TIEMPOS_POR_DEFECTO }
  });

  armado.partida.fase = FasePartida.PRECONSTRUCCION;
  armado.partida.fasePreconstruccion = FasePreconstruccion.ASENTAMIENTO;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;

  return { ...armado, programados, vencer };
}

//? Funcion que devuelve la preconstruccion en el paso del camino
export function armarPreconstruccionEnCamino() {
  const armado = armarPreconstruccionConReloj();
  armado.partida.fasePreconstruccion = FasePreconstruccion.CAMINO;
  armado.jugadores.get(ANGEL).ultimoAsentamiento = "0,0,0";
  return armado;
}
