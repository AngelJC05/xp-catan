import { describe, it } from "mocha";
import assert from "node:assert";
import { MapSchema } from "@colyseus/schema";
import { jugadorParaRobar } from "../../../src/bots/criterios/jugadorParaRobar.js";
import { Jugador } from "../../../src/schemas/Jugador.js";

//? Funcion que arma los jugadores con sus puntos y su cantidad de trigo
function armarJugadores(datos: Record<string, { puntos: number, trigo: number }>) {
  const jugadores = new MapSchema<Jugador>();
  Object.entries(datos).forEach(([id, { puntos, trigo }]) => {
    const jugador = new Jugador(id);
    jugador.puntuacion = puntos;
    jugador.recursos.set("trigo", trigo);
    jugadores.set(id, jugador);
  });
  return jugadores;
}

describe("a quien le roba el bot", () => {

  it("le roba al que tiene mas puntos", () => {
    const jugadores = armarJugadores({ alan: { puntos: 3, trigo: 5 }, luis: { puntos: 6, trigo: 1 } });

    assert.strictEqual(jugadorParaRobar(jugadores, ["alan", "luis"]), "luis");
  });

  it("si empatan en puntos, le roba al que tiene mas recursos", () => {
    const jugadores = armarJugadores({ alan: { puntos: 4, trigo: 5 }, luis: { puntos: 4, trigo: 1 } });

    assert.strictEqual(jugadorParaRobar(jugadores, ["luis", "alan"]), "alan");
  });

  it("si tambien empatan en recursos, elige al azar entre ellos", () => {
    const jugadores = armarJugadores({
      alan: { puntos: 4, trigo: 2 },
      luis: { puntos: 4, trigo: 2 },
      maria: { puntos: 1, trigo: 9 }
    });

    assert.strictEqual(jugadorParaRobar(jugadores, ["alan", "maria", "luis"], () => 0), "alan");
    assert.strictEqual(jugadorParaRobar(jugadores, ["alan", "maria", "luis"], () => 0.99), "luis");
  });

  it("solo elige entre los que se pueden robar", () => {
    const jugadores = armarJugadores({ alan: { puntos: 9, trigo: 9 }, luis: { puntos: 1, trigo: 1 } });

    assert.strictEqual(jugadorParaRobar(jugadores, ["luis"]), "luis");
  });

  it("devuelve vacio si no hay nadie a quien robar", () => {
    assert.strictEqual(jugadorParaRobar(armarJugadores({}), []), "");
  });
});
