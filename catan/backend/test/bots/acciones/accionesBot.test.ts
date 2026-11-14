import { describe, it } from "mocha";
import assert from "node:assert";
import { accionAbundancia } from "../../../src/bots/acciones/accionAbundancia.js";
import { accionComercioBanca } from "../../../src/bots/acciones/accionComercioBanca.js";
import { accionCaballero } from "../../../src/bots/acciones/accionCaballero.js";
import { accionCarreteras } from "../../../src/bots/acciones/accionCarreteras.js";
import { accionComprarCarta } from "../../../src/bots/acciones/accionComprarCarta.js";
import { accionConstruir } from "../../../src/bots/acciones/accionConstruir.js";
import { accionMonopolio } from "../../../src/bots/acciones/accionMonopolio.js";
import { accionOfertar } from "../../../src/bots/acciones/accionOfertar.js";
import { accionConstruirCamino } from "../../../src/bots/acciones/accionConstruirCamino.js";
import { ACCIONES_BOT } from "../../../src/bots/acciones/accionesBot.js";

describe("acciones del bot", () => {

  it("primero intenta cartas (carreteras antes que caballero), despues comerciar con la banca, construir, construir camino, proponer ofertas de intercambio y al final comprar carta", () => {
    assert.deepStrictEqual(ACCIONES_BOT, [
      accionAbundancia,
      accionMonopolio,
      accionCarreteras,
      accionCaballero,
      accionComercioBanca,
      accionConstruir,
      accionConstruirCamino,
      accionOfertar,
      accionComprarCarta
    ]);
  });
});
