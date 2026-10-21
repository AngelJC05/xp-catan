import { describe, it } from "mocha";
import assert from "node:assert";
import { Desarrollo, FaseJuego, FasePartida } from "../src/common/enums.js";
import { manejarCartaMonopolio } from "../src/rooms/handlers/cartas/cartaMonopolio.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const LUIS = "jugadorLuis";
const MONOPOLIO = `${Desarrollo.MONOPOLIO}`;

//? Funcion que devuelve una sala en juego, en fase de acciones, con el turno de Angel, que tiene una carta de monopolio lista para usar
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan", [LUIS]: "Luis" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.ordenJugadores.push(ANGEL, ALAN, LUIS);
  armado.partida.turnoActual = ANGEL;
  armado.partida.cartaJugable = true;
  armado.jugadores.get(ANGEL).cartas_usables.set(MONOPOLIO, 1);
  return armado;
}

describe("handler de la carta de monopolio", () => {

  it("rechaza si la partida ya finalizo", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.FINALIZADA;

    manejarCartaMonopolio(sala, client, { recurso: "madera" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ha finalizado" } }
    ]);
  });

  it("rechaza si no es su turno", () => {
    const { sala } = armarJuego();
    const { client, enviados } = armarCliente(ALAN);

    manejarCartaMonopolio(sala, client, { recurso: "madera" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es tu turno" } }
    ]);
  });

  it("rechaza si aun no se lanzaron los dados", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.DADOS;

    manejarCartaMonopolio(sala, client, { recurso: "madera" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Debes lanzar los dados primero" } }
    ]);
  });

  it("rechaza si ya uso una carta este turno", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.cartaJugable = false;

    manejarCartaMonopolio(sala, client, { recurso: "madera" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Solo una carta por turno" } }
    ]);
  });

  it("rechaza si no tiene la carta de monopolio", () => {
    const { sala, jugadores } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    jugadores.get(ANGEL).cartas_usables.set(MONOPOLIO, 0);

    manejarCartaMonopolio(sala, client, { recurso: "madera" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No tienes la carta de monopolio" } }
    ]);
  });

  it("avisa si el recurso no existe y no gasta la carta", () => {
    const { sala, partida, jugadores, difundidos } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);

    manejarCartaMonopolio(sala, client, { recurso: "oro" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "El recurso no existe" } }
    ]);
    assert.strictEqual(jugadores.get(ANGEL).cartas_usables.get(MONOPOLIO), 1);
    assert.strictEqual(partida.cartaJugable, true);
    assert.strictEqual(difundidos.length, 0);
  });

  it("le quita a todos los demas todo el recurso elegido y se lo da al jugador", () => {
    const { sala, jugadores } = armarJuego();
    const { client } = armarCliente(ANGEL);
    jugadores.get(ANGEL).recursos.set("madera", 1);
    jugadores.get(ALAN).recursos.set("madera", 3);
    jugadores.get(LUIS).recursos.set("madera", 2);

    manejarCartaMonopolio(sala, client, { recurso: "madera" });

    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 6);
    assert.strictEqual(jugadores.get(ALAN).recursos.get("madera"), 0);
    assert.strictEqual(jugadores.get(LUIS).recursos.get("madera"), 0);
  });

  it("no toca los demas recursos de los otros jugadores", () => {
    const { sala, jugadores } = armarJuego();
    const { client } = armarCliente(ANGEL);
    jugadores.get(ALAN).recursos.set("madera", 3);
    jugadores.get(ALAN).recursos.set("trigo", 4);

    manejarCartaMonopolio(sala, client, { recurso: "madera" });

    assert.strictEqual(jugadores.get(ALAN).recursos.get("trigo"), 4);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("trigo"), 0);
  });

  it("gasta la carta y bloquea otra carta este turno", () => {
    const { sala, partida, jugadores } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCartaMonopolio(sala, client, { recurso: "madera" });

    assert.strictEqual(jugadores.get(ANGEL).cartas_usables.get(MONOPOLIO), 0);
    assert.strictEqual(partida.cartaJugable, false);
  });

  it("avisa en el log que el jugador uso la carta de monopolio", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCartaMonopolio(sala, client, { recurso: "madera" });

    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha usado la carta de monopolio" } }
    ]);
  });

});
