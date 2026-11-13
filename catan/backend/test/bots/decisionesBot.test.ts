import { describe, it } from "mocha";
import assert from "node:assert";
import { DECISIONES_BOT } from "../../src/bots/decisionesBot.js";
import { decidirAcciones } from "../../src/bots/decisiones/decidirAcciones.js";
import { decidirCarreteras } from "../../src/bots/decisiones/decidirCarreteras.js";
import { decidirDados } from "../../src/bots/decisiones/decidirDados.js";
import { decidirDescarte } from "../../src/bots/decisiones/decidirDescarte.js";
import { decidirLadron } from "../../src/bots/decisiones/decidirLadron.js";
import { decidirOferta } from "../../src/bots/decisiones/decidirOferta.js";
import { decidirPreconstruccion } from "../../src/bots/decisiones/decidirPreconstruccion.js";
import { decidirRobo } from "../../src/bots/decisiones/decidirRobo.js";

describe("DECISIONES_BOT", () => {

  it("tiene la decision de cada situacion que el bot ya sabe resolver", () => {
    assert.strictEqual(DECISIONES_BOT.asentamientoInicial, decidirPreconstruccion);
    assert.strictEqual(DECISIONES_BOT.caminoInicial, decidirPreconstruccion);
    assert.strictEqual(DECISIONES_BOT.acciones, decidirAcciones);
    assert.strictEqual(DECISIONES_BOT.dados, decidirDados);
    assert.strictEqual(DECISIONES_BOT.descarte, decidirDescarte);
    assert.strictEqual(DECISIONES_BOT.ladron, decidirLadron);
    assert.strictEqual(DECISIONES_BOT.robo, decidirRobo);
    assert.strictEqual(DECISIONES_BOT.carreteras, decidirCarreteras);
    assert.strictEqual(DECISIONES_BOT.oferta, decidirOferta);
  });
});
