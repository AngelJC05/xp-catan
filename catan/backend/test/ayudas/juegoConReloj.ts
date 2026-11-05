import { FaseJuego, FasePartida } from "../../src/common/enums.js";
import { Temporizador } from "../../src/timers/Temporizador.js";
import { TIEMPOS_POR_DEFECTO } from "../../src/timers/tiempos.js";
import { armarReloj } from "./relojFalso.js";
import { armarSala } from "./salaFalsa.js";

export const ANGEL = "jugadorAngel";
export const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en juego, en el turno de Angel y en la fase de dados, con el temporizador
export function armarJuegoConReloj() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  const { reloj, programados, vencer } = armarReloj();

  Object.assign(armado.sala, {
    temporizador: new Temporizador(reloj),
    tiempos: { ...TIEMPOS_POR_DEFECTO }
  });

  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.DADOS;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;

  return { ...armado, programados, vencer };
}

//? Funcion que arma una tirada a partir de la suma
export function tiradaDe(suma: number) {
  return { dado1: suma - 1, dado2: 1, suma };
}
