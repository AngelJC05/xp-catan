import { describe, it } from "mocha";
import assert from "node:assert";
import { convieneOferta } from "../../../src/bots/criterios/convieneOferta.js";

//* Ejemplo: al bot le faltan 1 lana y 1 trigo para su objetivo, y le sobran 2 maderas y 1 ladrillo
const FALTA = { lana: 1, trigo: 1 };
const SOBRA = { madera: 2, ladrillo: 1 };

describe("si al bot le conviene una oferta de intercambio", () => {

  it("conviene si le dan algo que le falta y le piden algo que le sobra", () => {
    assert.strictEqual(convieneOferta(FALTA, SOBRA, { lana: 1 }, { madera: 1 }), true);
  });

  it("conviene aunque solo cubra parte de lo que le falta", () => {
    assert.strictEqual(convieneOferta(FALTA, SOBRA, { trigo: 1 }, { madera: 2 }), true);
  });

  it("conviene si de lo que le dan solo una parte le sirve", () => {
    assert.strictEqual(convieneOferta(FALTA, SOBRA, { lana: 1, mineral: 3 }, { ladrillo: 1 }), true);
  });

  it("no conviene si le piden algo que necesita", () => {
    assert.strictEqual(convieneOferta(FALTA, SOBRA, { lana: 1 }, { trigo: 1 }), false);
  });

  it("no conviene si le piden mas de lo que le sobra", () => {
    assert.strictEqual(convieneOferta(FALTA, SOBRA, { lana: 1 }, { madera: 3 }), false);
  });

  it("no conviene si de varias cosas que piden una no le sobra", () => {
    assert.strictEqual(convieneOferta(FALTA, SOBRA, { lana: 1 }, { madera: 1, mineral: 1 }), false);
  });

  it("no conviene si no le dan nada que le falte", () => {
    assert.strictEqual(convieneOferta(FALTA, SOBRA, { mineral: 2 }, { madera: 1 }), false);
  });
});
