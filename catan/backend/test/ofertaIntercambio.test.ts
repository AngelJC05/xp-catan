import { describe, it } from "mocha";
import assert from "node:assert";
import { OfertaIntercambio } from "../src/schemas/OfertaIntercambio.js";

describe("OfertaIntercambio", () => {

  it("todosRechazaron es false si alguien no ha respondido", () => {
    const oferta = new OfertaIntercambio();
    oferta.registrarRespuesta("jugadorA", -1);
    oferta.registrarRespuesta("jugadorB", 0);

    assert.strictEqual(oferta.todosRechazaron(), false);
  });

  it("todosRechazaron es true si todos rechazaron", () => {
    const oferta = new OfertaIntercambio();
    oferta.registrarRespuesta("jugadorA", -1);
    oferta.registrarRespuesta("jugadorB", -1);

    assert.strictEqual(oferta.todosRechazaron(), true);
  });
  
});
