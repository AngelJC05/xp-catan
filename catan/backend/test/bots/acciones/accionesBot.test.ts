import { describe, it } from "mocha";
import assert from "node:assert";
import { accionAbundancia } from "../../../src/bots/acciones/accionAbundancia.js";
import { accionConstruir } from "../../../src/bots/acciones/accionConstruir.js";
import { ACCIONES_BOT } from "../../../src/bots/acciones/accionesBot.js";

describe("acciones del bot", () => {

  it("primero intenta la carta de abundancia y despues construir", () => {
    assert.deepStrictEqual(ACCIONES_BOT, [accionAbundancia, accionConstruir]);
  });
});
