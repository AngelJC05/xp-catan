import { describe, it } from "mocha";
import assert from "node:assert";
import { accionComercioBanca } from "../../../src/bots/acciones/accionComercioBanca.js";
import { accionConstruir } from "../../../src/bots/acciones/accionConstruir.js";
import { ACCIONES_BOT } from "../../../src/bots/acciones/accionesBot.js";

describe("acciones del bot", () => {

  it("primero intenta comerciar con la banca y despues construir", () => {
    assert.deepStrictEqual(ACCIONES_BOT, [accionComercioBanca, accionConstruir]);
  });
});
