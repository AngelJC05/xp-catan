import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida } from "../../../../src/common/enums.js";
import { manejarRobarJugador } from "../../../../src/rooms/handlers/ladron/robarJugador.js";
import { armarCliente, armarSala } from "../../../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const LUIS = "jugadorLuis";

//? Funcion que devuelve una sala en la fase de robo: Angel movio al ladron y puede robarle a Alan o a Luis
function armarRobo() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan", [LUIS]: "Luis" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ROBO;
  armado.partida.ordenJugadores.push(ANGEL, ALAN, LUIS);
  armado.partida.turnoActual = ANGEL;
  armado.partida.jugadoresParaRobar.push(ALAN, LUIS);
  armado.jugadores.get(ALAN).recursos.set("madera", 1);
  armado.jugadores.get(LUIS).recursos.set("trigo", 1);
  return armado;
}

//? Funcion que suma todos los recursos que tiene un jugador
function totalRecursos(jugador: { recursos: Map<string, number> }) {
  let total = 0;
  jugador.recursos.forEach((cantidad) => { total += cantidad; });
  return total;
}

describe("handler de robar a un jugador", () => {

  it("rechaza si la partida ya finalizo", () => {
    const { sala, partida } = armarRobo();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.FINALIZADA;

    manejarRobarJugador(sala, client, { jugadorRobado: ALAN });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ha finalizado" } }
    ]);
  });

  it("rechaza si no es su turno", () => {
    const { sala } = armarRobo();
    const { client, enviados } = armarCliente(ALAN);

    manejarRobarJugador(sala, client, { jugadorRobado: LUIS });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es tu turno" } }
    ]);
  });

  it("rechaza si no es la fase de robar", () => {
    const { sala, partida } = armarRobo();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.ACCIONES;

    manejarRobarJugador(sala, client, { jugadorRobado: ALAN });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es la fase de robar" } }
    ]);
  });

  it("rechaza a un jugador que no esta en la lista de robo", () => {
    const { sala, partida, jugadores } = armarRobo();
    const { client, enviados } = armarCliente(ANGEL);
    partida.jugadoresParaRobar.clear();
    partida.jugadoresParaRobar.push(LUIS);

    manejarRobarJugador(sala, client, { jugadorRobado: ALAN });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "El jugador elegido no esta en la lista de robo" } }
    ]);
    assert.strictEqual(totalRecursos(jugadores.get(ALAN)), 1);
  });

  it("le roba un recurso al jugador elegido y no a los demas", () => {
    const { sala, jugadores } = armarRobo();
    const { client } = armarCliente(ANGEL);

    manejarRobarJugador(sala, client, { jugadorRobado: ALAN });

    assert.strictEqual(totalRecursos(jugadores.get(ALAN)), 0);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 1);
    assert.strictEqual(totalRecursos(jugadores.get(LUIS)), 1);
  });

  it("avisa el robo en el log", () => {
    const { sala, difundidos } = armarRobo();
    const { client } = armarCliente(ANGEL);

    manejarRobarJugador(sala, client, { jugadorRobado: ALAN });

    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha robado un recurso a Alan" } }
    ]);
  });

  it("limpia la lista de robo y vuelve a las acciones", () => {
    const { sala, partida } = armarRobo();
    const { client } = armarCliente(ANGEL);

    manejarRobarJugador(sala, client, { jugadorRobado: ALAN });

    assert.strictEqual(partida.jugadoresParaRobar.length, 0);
    assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
  });

});
