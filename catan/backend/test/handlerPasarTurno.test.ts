import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida } from "../src/common/enums.js";
import { manejarPasarTurno } from "../src/rooms/handlers/turno/pasarTurno.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en juego, en fase de acciones y con el turno de Angel
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;
  return armado;
}

describe("handler de pasar turno", () => {

  it("rechaza si la partida ya finalizo", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.FINALIZADA;

    manejarPasarTurno(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ha finalizado" } }
    ]);
  });

  it("rechaza si no es su turno", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ALAN);

    manejarPasarTurno(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es tu turno" } }
    ]);
    assert.strictEqual(partida.turnoActual, ANGEL);
  });

  it("rechaza si aun no lanzo los dados", () => {
    const { sala, partida, difundidos } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.DADOS;

    manejarPasarTurno(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Debes lanzar los dados primero" } }
    ]);
    assert.strictEqual(difundidos.length, 0);
  });

  it("pasa el turno al siguiente jugador cuando todo esta en orden", () => {
    const { sala, partida, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarPasarTurno(sala, client);

    assert.strictEqual(partida.turnoActual, ALAN);
    assert.strictEqual(partida.faseJuego, FaseJuego.DADOS);
    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha pasado su turno" } }
    ]);
  });

});
