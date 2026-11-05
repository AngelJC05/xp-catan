import { describe, it } from "mocha";
import assert from "node:assert";
import { PUNTOS_POR_DEFECTO } from "../../src/rooms/configuracion/puntosParaGanar.js";
import { Configuracion } from "../../src/schemas/Configuracion.js";
import { Partida } from "../../src/schemas/Partida.js";
import { TIEMPOS_POR_DEFECTO, type NombreTiempo } from "../../src/timers/tiempos.js";

describe("Configuracion", () => {

  it("empieza con los tiempos por defecto", () => {
    const configuracion = new Configuracion();

    for (const [accion, segundos] of Object.entries(TIEMPOS_POR_DEFECTO)) {
      assert.strictEqual(configuracion[accion as NombreTiempo], segundos, accion);
    }
  });

  it("empieza con los puntos para ganar por defecto", () => {
    const configuracion = new Configuracion();

    assert.strictEqual(configuracion.puntos, PUNTOS_POR_DEFECTO);
  });

  it("toda partida nueva trae su configuracion por defecto", () => {
    const partida = new Partida();

    assert.strictEqual(partida.configuracion.acciones, TIEMPOS_POR_DEFECTO.acciones);
    assert.strictEqual(partida.configuracion.puntos, PUNTOS_POR_DEFECTO);
  });

});
