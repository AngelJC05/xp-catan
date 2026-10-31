import { describe, it } from "mocha";
import assert from "node:assert";
import { manejarDestruccion } from "../src/rooms/handlers/sala/destruirSala.js";
import { armarSala } from "./ayudas/salaFalsa.js";

describe("handler de destruir la sala", () => {

  it("limpia los relojes de la partida", () => {
    const { sala, estado } = armarSala();

    manejarDestruccion(sala);

    assert.strictEqual(estado.relojesLimpiados, 1);
  });

});
