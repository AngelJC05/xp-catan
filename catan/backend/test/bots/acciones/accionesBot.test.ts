import { describe, it } from "mocha";
import assert from "node:assert";
import { accionDeRelleno } from "../../../src/bots/acciones/accionDeRelleno.js";
import { ACCIONES_BOT } from "../../../src/bots/acciones/accionesBot.js";
import { ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";

describe("acciones del bot", () => {

  it("la accion de relleno no hace nada y devuelve false", () => {
    const { sala, partida } = armarJuegoConReloj();
    const turno = partida.turnoActual;

    assert.strictEqual(accionDeRelleno(sala, ANGEL), false);
    assert.strictEqual(partida.turnoActual, turno);
  });

  it("la lista de acciones solo trae la de relleno por ahora", () => {
    assert.deepStrictEqual(ACCIONES_BOT, [accionDeRelleno]);
  });
});
