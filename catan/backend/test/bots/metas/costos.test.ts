import { describe, it } from "mocha";
import assert from "node:assert";
import { COSTOS } from "../../../src/bots/metas/costos.js";

describe("costos de los objetivos del bot", () => {

  it("la ciudad cuesta 3 mineral y 2 trigo", () => {
    assert.deepStrictEqual(COSTOS.ciudad, { mineral: 3, trigo: 2 });
  });

  it("el poblado cuesta madera, ladrillo, trigo y lana", () => {
    assert.deepStrictEqual(COSTOS.poblado, { madera: 1, ladrillo: 1, trigo: 1, lana: 1 });
  });

  it("el camino cuesta madera y ladrillo", () => {
    assert.deepStrictEqual(COSTOS.camino, { madera: 1, ladrillo: 1 });
  });

  it("la carta cuesta mineral, trigo y lana", () => {
    assert.deepStrictEqual(COSTOS.carta, { mineral: 1, trigo: 1, lana: 1 });
  });
});
