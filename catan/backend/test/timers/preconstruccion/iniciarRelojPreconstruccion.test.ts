import { describe, it } from "mocha";
import assert from "node:assert";
import type { CatanRoom } from "../../../src/rooms/CatanRoom.js";
import { Temporizador } from "../../../src/timers/Temporizador.js";
import { TIEMPOS_POR_DEFECTO } from "../../../src/timers/tiempos.js";
import { iniciarRelojPreconstruccion } from "../../../src/timers/preconstruccion/iniciarRelojPreconstruccion.js";
import { armarReloj } from "../../ayudas/relojFalso.js";

//? Funcion que devuelve una sala con un temporizador real que usa el reloj falso
function armarSalaConReloj() {
  const { reloj, programados } = armarReloj();
  const temporizador = new Temporizador(reloj);
  const sala = {
    temporizador,
    tiempos: { ...TIEMPOS_POR_DEFECTO }
  } as unknown as CatanRoom;

  return { sala, temporizador, programados };
}

describe("iniciar reloj de preconstruccion", () => {

  it("programa el reloj con el tiempo de preconstruccion de la sala", () => {
    const { sala, temporizador, programados } = armarSalaConReloj();

    iniciarRelojPreconstruccion(sala);

    assert.strictEqual(programados.length, 1);
    assert.strictEqual(programados[0].milisegundos, TIEMPOS_POR_DEFECTO.preconstruccion * 1000);
    assert.strictEqual(temporizador.estaActivo("preconstruccion"), true);
  });

  it("reinicia el reloj si ya estaba en marcha", () => {
    const { sala, temporizador, programados } = armarSalaConReloj();

    iniciarRelojPreconstruccion(sala);
    iniciarRelojPreconstruccion(sala);

    assert.strictEqual(programados.length, 2);
    assert.strictEqual(programados[0].cancelado, true);
    assert.strictEqual(programados[1].cancelado, false);
    assert.strictEqual(temporizador.estaActivo("preconstruccion"), true);
  });
});
