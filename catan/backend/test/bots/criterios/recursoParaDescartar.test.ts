import { describe, it } from "mocha";
import assert from "node:assert";
import { recursoParaDescartar } from "../../../src/bots/criterios/recursoParaDescartar.js";
import { COSTOS } from "../../../src/bots/metas/costos.js";
import { Jugador } from "../../../src/schemas/Jugador.js";

//? Funcion que devuelve un jugador con estos recursos y 0 en los demas
//? Sus recursos siempre van en el orden del juego: madera, trigo, lana, ladrillo y mineral
function jugadorCon(recursos: Record<string, number>) {
  const jugador = new Jugador("Bot");
  Object.entries(recursos).forEach(([recurso, cantidad]) => jugador.recursos.set(recurso, cantidad));
  return jugador;
}

describe("recurso que descarta el bot", () => {

  it("primero descarta lo que no le sirve para su objetivo", () => {
    const jugador = jugadorCon({ madera: 1, ladrillo: 1, trigo: 1, lana: 1, mineral: 3 });

    assert.strictEqual(recursoParaDescartar(jugador, COSTOS.poblado), "mineral");
  });

  it("de lo que le sobra, descarta del recurso que mas le sobra", () => {
    //* Para un camino le sobran 2 maderas y 4 lanas
    const jugador = jugadorCon({ madera: 3, ladrillo: 1, lana: 4 });

    assert.strictEqual(recursoParaDescartar(jugador, COSTOS.camino), "lana");
  });

  it("cuenta como sobrante lo que tiene de mas aunque el objetivo lo pida", () => {
    //* Para un camino le sobran 4 maderas y solo 3 lanas
    const jugador = jugadorCon({ madera: 5, ladrillo: 1, lana: 3 });

    assert.strictEqual(recursoParaDescartar(jugador, COSTOS.camino), "madera");
  });

  it("cuida lo que necesita aunque sea de lo que mas tiene", () => {
    //* Para una ciudad tiene 4 minerales (le sobra 1) y 2 lanas (le sobran 2)
    const jugador = jugadorCon({ mineral: 4, lana: 2 });

    assert.strictEqual(recursoParaDescartar(jugador, COSTOS.ciudad), "lana");
  });

  it("si no le sobra nada, descarta lo que necesita de donde mas tiene", () => {
    const jugador = jugadorCon({ mineral: 3, trigo: 2 });

    assert.strictEqual(recursoParaDescartar(jugador, COSTOS.ciudad), "mineral");
  });

  it("en un empate elige el primero de sus recursos", () => {
    //* Para una carta le sobran 2 ladrillos y 2 maderas; la madera va antes en sus recursos
    const jugador = jugadorCon({ ladrillo: 2, madera: 2, lana: 1, trigo: 1, mineral: 1 });

    assert.strictEqual(recursoParaDescartar(jugador, COSTOS.carta), "madera");
  });

  it("devuelve vacio si no tiene nada que descartar", () => {
    const jugador = jugadorCon({ madera: 0, lana: 0 });

    assert.strictEqual(recursoParaDescartar(jugador, COSTOS.carta), "");
  });
});
