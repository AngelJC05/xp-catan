import { describe, it } from "mocha";
import assert from "node:assert";
import { Desarrollo, FaseJuego, FasePartida } from "../../../../src/common/enums.js";
import { manejarCartaCarreteras } from "../../../../src/rooms/handlers/cartas/cartaCarreteras.js";
import { armarCliente, armarSala } from "../../../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const CARRETERA = `${Desarrollo.CARRETERA}`;

//? Funcion que devuelve una sala en juego, en fase de acciones, con el turno de Angel, que tiene una carta de carreteras lista para usar
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;
  armado.partida.cartaJugable = true;
  armado.jugadores.get(ANGEL).cartas_usables.set(CARRETERA, 1);
  return armado;
}

describe("handler de la carta de carreteras", () => {

  it("rechaza si la partida ya finalizo", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.FINALIZADA;

    manejarCartaCarreteras(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ha finalizado" } }
    ]);
  });

  it("rechaza si no es su turno", () => {
    const { sala } = armarJuego();
    const { client, enviados } = armarCliente(ALAN);

    manejarCartaCarreteras(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es tu turno" } }
    ]);
  });

  it("rechaza si ya uso una carta este turno", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.cartaJugable = false;

    manejarCartaCarreteras(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Solo una carta por turno" } }
    ]);
  });

  it("rechaza si aun no se lanzaron los dados", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.DADOS;

    manejarCartaCarreteras(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Debes lanzar los dados primero" } }
    ]);
  });

  it("rechaza si no tiene la carta de carreteras y no cambia nada", () => {
    const { sala, partida, jugadores, difundidos } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    jugadores.get(ANGEL).cartas_usables.set(CARRETERA, 0);

    manejarCartaCarreteras(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No tienes la carta de carreteras" } }
    ]);
    assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
    assert.strictEqual(partida.cartaJugable, true);
    assert.strictEqual(difundidos.length, 0);
  });

  it("gasta la carta", () => {
    const { sala, jugadores } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCartaCarreteras(sala, client);

    assert.strictEqual(jugadores.get(ANGEL).cartas_usables.get(CARRETERA), 0);
  });

  it("da dos carreteras gratis y pasa a la fase de carreteras", () => {
    const { sala, partida } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCartaCarreteras(sala, client);

    assert.strictEqual(partida.carreterasGratis, 2);
    assert.strictEqual(partida.faseJuego, FaseJuego.CARRETERAS);
  });

  it("bloquea el uso de otra carta este turno", () => {
    const { sala, partida } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCartaCarreteras(sala, client);

    assert.strictEqual(partida.cartaJugable, false);
  });

  it("avisa en el log que el jugador jugo una carta de carreteras", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCartaCarreteras(sala, client);

    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha jugado una carta de carreteras" } }
    ]);
  });

});
