import { describe, it } from "mocha";
import assert from "node:assert";
import { accionComercioBanca } from "../../../src/bots/acciones/accionComercioBanca.js";
import { accionCaballero } from "../../../src/bots/acciones/accionCaballero.js";
import { accionComprarCarta } from "../../../src/bots/acciones/accionComprarCarta.js";
import { accionConstruir } from "../../../src/bots/acciones/accionConstruir.js";
import { accionConstruirCamino } from "../../../src/bots/acciones/accionConstruirCamino.js";
import { ACCIONES_BOT } from "../../../src/bots/acciones/accionesBot.js";

describe("acciones del bot", () => {

  it("primero intenta el caballero, despues comerciar con la banca, construir, construir camino y al final comprar carta", () => {
    assert.deepStrictEqual(ACCIONES_BOT, [
      accionCaballero,
      accionComercioBanca,
      accionConstruir,
      accionConstruirCamino,
      accionComprarCarta
    ]);
  });
});
