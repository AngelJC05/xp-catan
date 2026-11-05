import { describe, it } from "mocha";
import assert from "node:assert";
import { FasePartida } from "../../../../src/common/enums.js";
import { PUNTOS_POR_DEFECTO } from "../../../../src/rooms/configuracion/puntosParaGanar.js";
import { manejarConfigurarSala } from "../../../../src/rooms/handlers/partida/configurarSala.js";
import { TIEMPOS_POR_DEFECTO } from "../../../../src/timers/tiempos.js";
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

  describe("cuando la configuracion es valida", () => {

    it("guarda todos los valores en la configuracion de la partida", () => {
      const { sala, partida } = armarLobby();
      const { client, enviados } = armarCliente(ANGEL);

      manejarConfigurarSala(sala, client, {
        preconstruccion: 40,
        dados: 15,
        acciones: 120,
        oferta: 20,
        ladron: 20,
        robo: 20,
        descarte: 15,
        puntos: 12
      });

      assert.strictEqual(partida.configuracion.preconstruccion, 40);
      assert.strictEqual(partida.configuracion.acciones, 120);
      assert.strictEqual(partida.configuracion.descarte, 15);
      assert.strictEqual(partida.configuracion.puntos, 12);
      assert.strictEqual(enviados.length, 0);
    });

    it("con una configuracion parcial cambia solo lo que llego", () => {
      const { sala, partida } = armarLobby();
      const { client } = armarCliente(ANGEL);

      manejarConfigurarSala(sala, client, { acciones: 120 });

      assert.strictEqual(partida.configuracion.acciones, 120);
      assert.strictEqual(partida.configuracion.preconstruccion, TIEMPOS_POR_DEFECTO.preconstruccion);
      assert.strictEqual(partida.configuracion.puntos, PUNTOS_POR_DEFECTO);
    });

    it("el creador puede configurar varias veces y queda la ultima", () => {
      const { sala, partida } = armarLobby();
      const { client } = armarCliente(ANGEL);

      manejarConfigurarSala(sala, client, { acciones: 120, puntos: 8 });
      manejarConfigurarSala(sala, client, { acciones: 60 });

      assert.strictEqual(partida.configuracion.acciones, 60);
      assert.strictEqual(partida.configuracion.puntos, 8);
    });

  });

  it("si hay un valor invalido no guarda ninguno, ni los validos", () => {
    const { sala, partida } = armarLobby();
    const { client } = armarCliente(ANGEL);

    manejarConfigurarSala(sala, client, { acciones: 120, puntos: 99 });

    assert.strictEqual(partida.configuracion.acciones, TIEMPOS_POR_DEFECTO.acciones);
    assert.strictEqual(partida.configuracion.puntos, PUNTOS_POR_DEFECTO);
  });

  it("si lo pide alguien que no es el creador no se guarda nada", () => {
    const { sala, partida } = armarLobby();
    const { client } = armarCliente(ALAN);

    manejarConfigurarSala(sala, client, { acciones: 120 });

    assert.strictEqual(partida.configuracion.acciones, TIEMPOS_POR_DEFECTO.acciones);
  });

  it("si la partida ya comenzo no se guarda nada", () => {
    const { sala, partida } = armarLobby();
    const { client } = armarCliente(ANGEL);
    partida.fase = FasePartida.JUEGO;

    manejarConfigurarSala(sala, client, { acciones: 120 });

    assert.strictEqual(partida.configuracion.acciones, TIEMPOS_POR_DEFECTO.acciones);
  });

});
