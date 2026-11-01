import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida } from "../../../../src/common/enums.js";
import { resolverRobo } from "../../../../src/rooms/handlers/ladron/resolverRobo.js";
import { armarSala } from "../../../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const LUIS = "jugadorLuis";

//? Funcion que devuelve una sala en juego, con el ladron recien movido por Angel (fase LADRON)
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan", [LUIS]: "Luis" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.LADRON;
  armado.partida.ordenJugadores.push(ANGEL, ALAN, LUIS);
  armado.partida.turnoActual = ANGEL;
  return armado;
}

//? Funcion que suma todos los recursos que tiene un jugador
function totalRecursos(jugador: { recursos: Map<string, number> }) {
  let total = 0;
  jugador.recursos.forEach((cantidad) => { total += cantidad; });
  return total;
}

describe("resolver el robo despues de mover al ladron", () => {

  it("sin jugadores involucrados pasa directo a las acciones", () => {
    const { sala, partida, difundidos } = armarJuego();

    resolverRobo(sala, ANGEL, []);

    assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
    assert.strictEqual(difundidos.length, 0);
  });

  it("con un solo jugador le roba un recurso automaticamente", () => {
    const { sala, jugadores } = armarJuego();
    jugadores.get(ALAN).recursos.set("madera", 1);

    resolverRobo(sala, ANGEL, [ALAN]);

    assert.strictEqual(totalRecursos(jugadores.get(ALAN)), 0);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 1);
  });

  it("con un solo jugador avisa el robo en el log y pasa a las acciones", () => {
    const { sala, partida, jugadores, difundidos } = armarJuego();
    jugadores.get(ALAN).recursos.set("madera", 1);

    resolverRobo(sala, ANGEL, [ALAN]);

    assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha robado un recurso a Alan" } }
    ]);
  });

  it("con dos o mas jugadores deja elegir a quien robar", () => {
    const { sala, partida, jugadores } = armarJuego();
    jugadores.get(ALAN).recursos.set("madera", 1);
    jugadores.get(LUIS).recursos.set("trigo", 1);

    resolverRobo(sala, ANGEL, [ALAN, LUIS]);

    assert.strictEqual(partida.faseJuego, FaseJuego.ROBO);
    assert.deepStrictEqual(Array.from(partida.jugadoresParaRobar), [ALAN, LUIS]);
    assert.strictEqual(totalRecursos(jugadores.get(ANGEL)), 0);
  });

  it("con dos o mas jugadores reemplaza la lista de robo anterior", () => {
    const { sala, partida } = armarJuego();
    partida.jugadoresParaRobar.push(ANGEL);

    resolverRobo(sala, ANGEL, [ALAN, LUIS]);

    assert.deepStrictEqual(Array.from(partida.jugadoresParaRobar), [ALAN, LUIS]);
  });

});
