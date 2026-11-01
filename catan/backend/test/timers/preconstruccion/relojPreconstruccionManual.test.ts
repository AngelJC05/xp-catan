import { describe, it } from "mocha";
import assert from "node:assert";
import { FasePartida } from "../../../src/common/enums.js";
import { iniciarRelojPreconstruccion } from "../../../src/timers/preconstruccion/iniciarRelojPreconstruccion.js";
import { manejarAsentamientoPreconstruccion } from "../../../src/rooms/handlers/construccion/asentamientoPreconstruccion.js";
import { manejarCaminoPreconstruccion } from "../../../src/rooms/handlers/construccion/caminoPreconstruccion.js";
import { ANGEL, armarPreconstruccionConReloj, armarPreconstruccionEnCamino } from "../../ayudas/preconstruccionConReloj.js";
import { armarCliente } from "../../ayudas/salaFalsa.js";

describe("reloj de preconstruccion cuando el jugador coloca el asentamiento a mano", () => {

  it("reinicia el reloj", () => {
    const { sala, programados } = armarPreconstruccionConReloj();
    const { client } = armarCliente(ANGEL);
    iniciarRelojPreconstruccion(sala);

    manejarAsentamientoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(programados.length, 2);
    assert.strictEqual(programados[0].cancelado, true);
    assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), true);
  });

  it("no toca el reloj si no se pudo construir asentamiento", () => {
    const { sala, programados } = armarPreconstruccionConReloj();
    const { client } = armarCliente(ANGEL);
    iniciarRelojPreconstruccion(sala);

    manejarAsentamientoPreconstruccion(sala, client, { h: 99, d: 99, p: 0 });

    assert.strictEqual(programados.length, 1);
    assert.strictEqual(programados[0].cancelado, false);
  });
});

describe("reloj de preconstruccion cuando el jugador coloca el camino a mano", () => {

  it("reinicia el reloj para el siguiente jugador", () => {
    const { sala, programados } = armarPreconstruccionEnCamino();
    const { client } = armarCliente(ANGEL);
    iniciarRelojPreconstruccion(sala);

    manejarCaminoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(programados.length, 2);
    assert.strictEqual(programados[0].cancelado, true);
    assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), true);
  });

  it("cancela el reloj si ese camino termina la preconstruccion", () => {
    const { sala, partida, programados } = armarPreconstruccionEnCamino();
    const { client } = armarCliente(ANGEL);
    partida.direccionPreconstruccion = -1;
    iniciarRelojPreconstruccion(sala);

    manejarCaminoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(partida.fase, FasePartida.JUEGO);
    assert.strictEqual(programados.length, 1);
    assert.strictEqual(programados[0].cancelado, true);
    assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), false);
  });

  it("no toca el reloj si no se pudo construir camino", () => {
    const { sala, programados } = armarPreconstruccionEnCamino();
    const { client } = armarCliente(ANGEL);
    iniciarRelojPreconstruccion(sala);

    manejarCaminoPreconstruccion(sala, client, { h: 0, d: 0, p: 2 });

    assert.strictEqual(programados.length, 1);
    assert.strictEqual(programados[0].cancelado, false);
  });
});
