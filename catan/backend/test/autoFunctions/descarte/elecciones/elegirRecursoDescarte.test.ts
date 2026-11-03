import { describe, it } from "mocha";
import assert from "node:assert";
import { Jugador } from "../../../../src/schemas/Jugador.js";
import { elegirRecursoDescarte } from "../../../../src/autoFunctions/descarte/elecciones/elegirRecursoDescarte.js";

//? Funcion que devuelve un jugador con 6 maderas y 1 lana: 7 cartas en total
function armarJugador() {
  const jugador = new Jugador("Alan");
  jugador.recursos.set("madera", 6);
  jugador.recursos.set("lana", 1);
  return jugador;
}

describe("elegir el recurso a descartar", () => {

  it("cada carta cuenta igual: las primeras 6 de 7 posiciones son madera", () => {
    const jugador = armarJugador();

    assert.strictEqual(elegirRecursoDescarte(jugador, () => 0), "madera");
    assert.strictEqual(elegirRecursoDescarte(jugador, () => 5.9 / 7), "madera");
  });

  it("la ultima posicion es la lana", () => {
    const jugador = armarJugador();

    assert.strictEqual(elegirRecursoDescarte(jugador, () => 6 / 7), "lana");
    assert.strictEqual(elegirRecursoDescarte(jugador, () => 0.999), "lana");
  });

  it("nunca elige un recurso que el jugador no tiene", () => {
    const jugador = armarJugador();

    for (let i = 0; i < 100; i++) {
      const recurso = elegirRecursoDescarte(jugador);
      assert.ok(jugador.recursos.get(recurso) > 0);
    }
  });

  it("devuelve vacio si el jugador no tiene recursos", () => {
    const jugador = new Jugador("Alan");

    assert.strictEqual(elegirRecursoDescarte(jugador), "");
  });
});
