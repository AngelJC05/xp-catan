import { describe, it } from "mocha";
import assert from "node:assert";
import { accionConstruir } from "../../../src/bots/acciones/accionConstruir.js";
import { ACCIONES_BOT } from "../../../src/bots/acciones/accionesBot.js";

describe("acciones del bot", () => {

  it("la lista de acciones solo trae la de construir por ahora", () => {
    assert.deepStrictEqual(ACCIONES_BOT, [accionConstruir]);
  });
});
