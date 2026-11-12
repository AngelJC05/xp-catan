import { describe, it } from "mocha";
import assert from "node:assert";
import { accionComprarCarta } from "../../../src/bots/acciones/accionComprarCarta.js";
import { accionConstruir } from "../../../src/bots/acciones/accionConstruir.js";
import { ACCIONES_BOT } from "../../../src/bots/acciones/accionesBot.js";

describe("acciones del bot", () => {

  it("la lista de acciones trae construir y despues comprar carta", () => {
    assert.deepStrictEqual(ACCIONES_BOT, [accionConstruir, accionComprarCarta]);
  });
});
