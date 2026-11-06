import { describe, it } from "mocha";
import assert from "node:assert";
import { Jugador } from "../../src/schemas/Jugador.js";

describe("Jugador", () => {

  it("un jugador nuevo no es un bot", () => {
    const jugador = new Jugador("Angel");

    assert.strictEqual(jugador.esBot, false);
  });

  it("se puede marcar a un jugador como bot", () => {
    const jugador = new Jugador("Kernel");
    jugador.esBot = true;

    assert.strictEqual(jugador.esBot, true);
  });

});
