import { describe, it } from "mocha";
import assert from "node:assert";
import { COSTOS } from "../../../src/bots/metas/costos.js";
import { faltaYSobra } from "../../../src/bots/metas/faltaYSobra.js";
import { Jugador } from "../../../src/schemas/Jugador.js";

//? Funcion que devuelve un jugador con los recursos indicados y el resto en 0
function jugadorCon(recursos: Record<string, number>) {
  const jugador = new Jugador("Kernel");
  for (const [recurso, cantidad] of Object.entries(recursos)) {
    jugador.recursos.set(recurso, cantidad);
  }
  return jugador;
}

describe("falta y sobra de un objetivo", () => {

  it("con 3 ladrillos y la meta camino sobran 2 ladrillos y falta 1 madera", () => {
    const resultado = faltaYSobra(jugadorCon({ ladrillo: 3 }), COSTOS.camino);

    assert.deepStrictEqual(resultado, { falta: { madera: 1 }, sobra: { ladrillo: 2 } });
  });

  it("si tiene justo lo que pide no falta ni sobra nada", () => {
    const resultado = faltaYSobra(jugadorCon({ madera: 1, ladrillo: 1 }), COSTOS.camino);

    assert.deepStrictEqual(resultado, { falta: {}, sobra: {} });
  });

  it("con las manos vacias le falta todo el costo y no sobra nada", () => {
    const resultado = faltaYSobra(jugadorCon({}), COSTOS.poblado);

    assert.deepStrictEqual(resultado, {
      falta: { madera: 1, ladrillo: 1, trigo: 1, lana: 1 },
      sobra: {}
    });
  });

  it("para la ciudad con 1 mineral y 3 trigos faltan 2 minerales y sobra 1 trigo", () => {
    const resultado = faltaYSobra(jugadorCon({ mineral: 1, trigo: 3 }), COSTOS.ciudad);

    assert.deepStrictEqual(resultado, { falta: { mineral: 2 }, sobra: { trigo: 1 } });
  });

  it("si tiene de sobra en todo lo que pide solo hay sobrante", () => {
    const resultado = faltaYSobra(jugadorCon({ mineral: 5, trigo: 4 }), COSTOS.ciudad);

    assert.deepStrictEqual(resultado, { falta: {}, sobra: { mineral: 2, trigo: 2 } });
  });

  it("lo que el objetivo no pide cuenta completo como sobrante", () => {
    const resultado = faltaYSobra(jugadorCon({ madera: 2, ladrillo: 1 }), COSTOS.carta);

    assert.deepStrictEqual(resultado, {
      falta: { mineral: 1, trigo: 1, lana: 1 },
      sobra: { madera: 2, ladrillo: 1 }
    });
  });
});
