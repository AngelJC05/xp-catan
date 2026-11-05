import { describe, it } from "mocha";
import assert from "node:assert";
import { FasePartida } from "../../../../src/common/enums.js";
import { manejarConfigurarSala } from "../../../../src/rooms/handlers/partida/configurarSala.js";
import { armarCliente, armarSala } from "../../../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en el lobby
function armarLobby() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.creador = ANGEL;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  return armado;
}

describe("handler de configurar la sala", () => {

  it("rechaza si quien lo pide no es el creador", () => {
    const { sala } = armarLobby();
    const { client, enviados } = armarCliente(ALAN);

    manejarConfigurarSala(sala, client, { acciones: 120 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Solo el creador de la sala puede hacer esto" } }
    ]);
  });

  it("rechaza si la partida ya comenzo", () => {
    const { sala, partida } = armarLobby();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.JUEGO;

    manejarConfigurarSala(sala, client, { acciones: 120 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ya ha comenzado" } }
    ]);
  });

  it("rechaza una configuracion invalida y dice cual opcion fallo", () => {
    const { sala } = armarLobby();
    const { client, enviados } = armarCliente(ANGEL);

    manejarConfigurarSala(sala, client, { acciones: 100 });

    assert.strictEqual(enviados.length, 1);
    assert.strictEqual(enviados[0].tipo, "error");
    assert.match((enviados[0].mensaje as { mensajeError: string }).mensajeError, /acciones/);
  });

  it("rechaza puntos fuera del rango", () => {
    const { sala } = armarLobby();
    const { client, enviados } = armarCliente(ANGEL);

    manejarConfigurarSala(sala, client, { puntos: 99 });

    assert.strictEqual(enviados.length, 1);
    assert.match((enviados[0].mensaje as { mensajeError: string }).mensajeError, /puntos/);
  });

  it("avisa del error solo a quien lo pidio, sin difundirlo", () => {
    const { sala, difundidos } = armarLobby();
    const { client } = armarCliente(ANGEL);

    manejarConfigurarSala(sala, client, { acciones: 100 });

    assert.strictEqual(difundidos.length, 0);
  });

});
