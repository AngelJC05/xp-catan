import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida } from "../../../src/common/enums.js";
import { TIEMPOS_POR_DEFECTO } from "../../../src/timers/tiempos.js";
import { iniciarRelojDados } from "../../../src/timers/dados/iniciarRelojDados.js";
import { actualizarRelojDados } from "../../../src/timers/dados/actualizarRelojDados.js";
import { armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";

describe("iniciar reloj de dados", () => {

  it("programa el reloj con el tiempo de dados de la sala", () => {
    const { sala, programados } = armarJuegoConReloj();

    iniciarRelojDados(sala);

    assert.strictEqual(programados.length, 1);
    assert.strictEqual(programados[0].milisegundos, TIEMPOS_POR_DEFECTO.dados * 1000);
    assert.strictEqual(sala.temporizador.estaActivo("dados"), true);
  });

  it("reinicia el reloj si ya estaba en marcha", () => {
    const { sala, programados } = armarJuegoConReloj();

    iniciarRelojDados(sala);
    iniciarRelojDados(sala);

    assert.strictEqual(programados.length, 2);
    assert.strictEqual(programados[0].cancelado, true);
    assert.strictEqual(programados[1].cancelado, false);
  });
});

describe("actualizar reloj de dados", () => {

  it("inicia el reloj si la partida esta en la fase de dados", () => {
    const { sala } = armarJuegoConReloj();

    actualizarRelojDados(sala);

    assert.strictEqual(sala.temporizador.estaActivo("dados"), true);
  });

  it("cancela el reloj si ya se salio de la fase de dados", () => {
    const { sala, partida, programados } = armarJuegoConReloj();
    iniciarRelojDados(sala);
    partida.faseJuego = FaseJuego.ACCIONES;

    actualizarRelojDados(sala);

    assert.strictEqual(programados[0].cancelado, true);
    assert.strictEqual(sala.temporizador.estaActivo("dados"), false);
  });

  it("no inicia el reloj si la partida no esta en juego", () => {
    const { sala, partida } = armarJuegoConReloj();
    partida.fase = FasePartida.PRECONSTRUCCION;

    actualizarRelojDados(sala);

    assert.strictEqual(sala.temporizador.estaActivo("dados"), false);
  });
});
