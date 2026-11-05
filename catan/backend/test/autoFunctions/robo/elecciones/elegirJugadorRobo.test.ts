import { describe, it } from "mocha";
import assert from "node:assert";
import { elegirJugadorRobo } from "../../../../src/autoFunctions/robo/elecciones/elegirJugadorRobo.js";

const POSIBLES = ["jugadorAlan", "jugadorLuis", "jugadorMaria"];

describe("elegir a quien robar", () => {

  it("cualquiera de la lista puede salir, del primero al ultimo", () => {
    assert.strictEqual(elegirJugadorRobo(POSIBLES, () => 0), "jugadorAlan");
    assert.strictEqual(elegirJugadorRobo(POSIBLES, () => 0.999), "jugadorMaria");
  });

  it("siempre elige a alguien de la lista", () => {
    for (let i = 0; i < 100; i++) {
      assert.ok(POSIBLES.includes(elegirJugadorRobo(POSIBLES)));
    }
  });

  it("devuelve vacio si no hay nadie a quien robar", () => {
    assert.strictEqual(elegirJugadorRobo([]), "");
  });
});
