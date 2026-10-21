import { describe, it } from "mocha";
import assert from "node:assert";
import { Desarrollo, FaseJuego, FasePartida } from "../src/common/enums.js";
import { terminarTurno } from "../src/rooms/handlers/turno/terminarTurno.js";
import { armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const LUIS = "jugadorLuis";
const CABALLERO = `${Desarrollo.CABALLERO}`;

//? Funcion que devuelve una sala en juego, en fase de acciones y con el turno de Angel
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan", [LUIS]: "Luis" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.ordenJugadores.push(ANGEL, ALAN, LUIS);
  armado.partida.turnoActual = ANGEL;
  armado.partida.cartaJugable = false;
  return armado;
}

describe("terminar el turno de un jugador", () => {

  it("avisa en el log que el jugador paso su turno", () => {
    const { sala, difundidos } = armarJuego();

    terminarTurno(sala, ANGEL);

    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha pasado su turno" } }
    ]);
  });

  it("pasa el turno al siguiente jugador y vuelve a la fase de dados", () => {
    const { sala, partida } = armarJuego();

    terminarTurno(sala, ANGEL);

    assert.strictEqual(partida.turnoActual, ALAN);
    assert.strictEqual(partida.faseJuego, FaseJuego.DADOS);
  });

  it("despues del ultimo jugador el turno vuelve al primero", () => {
    const { sala, partida } = armarJuego();
    partida.turnoActual = LUIS;

    terminarTurno(sala, LUIS);

    assert.strictEqual(partida.turnoActual, ANGEL);
  });

  it("activa las cartas que el jugador compro durante su turno", () => {
    const { sala, jugadores } = armarJuego();
    const angel = jugadores.get(ANGEL);
    angel.cartas_usables.set(CABALLERO, 0);
    angel.cartas_inusables.set(CABALLERO, 2);

    terminarTurno(sala, ANGEL);

    assert.strictEqual(angel.cartas_usables.get(CABALLERO), 2);
    assert.strictEqual(angel.cartas_inusables.get(CABALLERO), 0);
  });

  it("permite usar una carta en el siguiente turno", () => {
    const { sala, partida } = armarJuego();

    terminarTurno(sala, ANGEL);

    assert.strictEqual(partida.cartaJugable, true);
  });

  it("cancela las ofertas de intercambio activas", () => {
    const { sala, partida } = armarJuego();
    partida.ofertaIntercambio.jugador = ANGEL;
    sala.ofertas.set(ANGEL, {});

    terminarTurno(sala, ANGEL);

    assert.strictEqual(partida.ofertaIntercambio.jugador, "");
    assert.strictEqual(sala.ofertas.size, 0);
  });

});
