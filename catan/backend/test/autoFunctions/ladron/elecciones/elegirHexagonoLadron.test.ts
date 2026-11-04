import { describe, it } from "mocha";
import assert from "node:assert";
import { armarSala } from "../../../ayudas/salaFalsa.js";
import { elegirHexagonoLadron } from "../../../../src/autoFunctions/ladron/elecciones/elegirHexagonoLadron.js";

describe("elegir el terreno al que se mueve el ladron", () => {

  it("nunca elige el terreno donde ya esta el ladron", () => {
    const { tablero } = armarSala();
    const actual = `${tablero.ladron.h},${tablero.ladron.d}`;

    for (let i = 0; i < 200; i++) {
      const [h, d] = elegirHexagonoLadron(tablero);
      assert.notStrictEqual(`${h},${d}`, actual);
    }
  });

  it("elige un terreno que existe en el tablero", () => {
    const { tablero } = armarSala();

    const [h, d] = elegirHexagonoLadron(tablero);

    assert.ok(tablero.hexagonos.has(`${h},${d}`));
  });

  it("cualquier otro terreno puede salir, del primero al ultimo", () => {
    const { tablero } = armarSala();
    const opciones = tablero.hexagonos.size - 1;

    const primero = elegirHexagonoLadron(tablero, () => 0);
    const ultimo = elegirHexagonoLadron(tablero, () => (opciones - 1) / opciones);

    assert.notDeepStrictEqual(primero, ultimo);
  });
});
