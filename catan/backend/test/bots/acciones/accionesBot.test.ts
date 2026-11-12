import { describe, it } from "mocha";
import assert from "node:assert";
import { accionConstruir } from "../../../src/bots/acciones/accionConstruir.js";
import { accionMonopolio } from "../../../src/bots/acciones/accionMonopolio.js";
import { ACCIONES_BOT } from "../../../src/bots/acciones/accionesBot.js";

describe("acciones del bot", () => {

  it("primero intenta la carta de monopolio y despues construir", () => {
    assert.deepStrictEqual(ACCIONES_BOT, [accionMonopolio, accionConstruir]);
  });
});
