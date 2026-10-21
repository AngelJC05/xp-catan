import { describe, it } from "mocha";
import assert from "node:assert";
import { Construccion, FaseJuego, FasePartida } from "../src/common/enums.js";
import { manejarColocarCiudad } from "../src/rooms/handlers/construccion/colocarCiudad.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en juego, en fase de acciones, con el turno de Angel, un asentamiento suyo en 0,0,0 y recursos para una ciudad
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;

  const angel = armado.jugadores.get(ANGEL);
  angel.recursos.set("trigo", 2);
  angel.recursos.set("mineral", 3);

  const vertice = armado.tablero.vertices.get("0,0,0");
  vertice.setPropietario(ANGEL);
  vertice.setConstruccion(Construccion.ASENTAMIENTO);
  return armado;
}

describe("handler de colocar ciudad", () => {

  it("rechaza si la partida ya finalizo", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.FINALIZADA;

    manejarColocarCiudad(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ha finalizado" } }
    ]);
  });

  it("rechaza si no es su turno", () => {
    const { sala } = armarJuego();
    const { client, enviados } = armarCliente(ALAN);

    manejarColocarCiudad(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es tu turno" } }
    ]);
  });

  it("rechaza si aun no es la fase de juego", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.PRECONSTRUCCION;

    manejarColocarCiudad(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es la fase de juego" } }
    ]);
  });

  it("rechaza si aun no se lanzaron los dados", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.DADOS;

    manejarColocarCiudad(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Debes lanzar los dados primero" } }
    ]);
  });

  it("avisa si el lugar no existe", () => {
    const { sala } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);

    manejarColocarCiudad(sala, client, { h: 99, d: 99, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "El lugar seleccionado no es valido" } }
    ]);
  });

  it("avisa si el asentamiento no le pertenece", () => {
    const { sala, tablero } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    tablero.vertices.get("0,0,0").setPropietario(ALAN);

    manejarColocarCiudad(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "El asentamiento no te pertenece" } }
    ]);
  });

  it("avisa si ya hay una ciudad en ese lugar", () => {
    const { sala, tablero } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    tablero.vertices.get("0,0,0").setConstruccion(Construccion.CIUDAD);

    manejarColocarCiudad(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Ya hay una ciudad en este lugar" } }
    ]);
  });

  it("avisa si no tiene los recursos y no escribe en el log", () => {
    const { sala, jugadores, difundidos } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    jugadores.get(ANGEL).recursos.set("mineral", 2);

    manejarColocarCiudad(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No tienes recursos para construir una ciduad" } }
    ]);
    assert.strictEqual(difundidos.length, 0);
  });

  it("convierte el asentamiento en ciudad", () => {
    const { sala, tablero } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarColocarCiudad(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(tablero.vertices.get("0,0,0").constuccion, Construccion.CIUDAD);
    assert.strictEqual(tablero.vertices.get("0,0,0").propietario, ANGEL);
  });

  it("cobra dos de trigo y tres de mineral y los manda a la banca", () => {
    const { sala, jugadores, banca } = armarJuego();
    const { client } = armarCliente(ANGEL);
    const trigoEnBanca = banca.recursos.get("trigo");
    const mineralEnBanca = banca.recursos.get("mineral");

    manejarColocarCiudad(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(jugadores.get(ANGEL).recursos.get("trigo"), 0);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("mineral"), 0);
    assert.strictEqual(banca.recursos.get("trigo"), trigoEnBanca + 2);
    assert.strictEqual(banca.recursos.get("mineral"), mineralEnBanca + 3);
  });

  it("devuelve el asentamiento al jugador y le suma un punto", () => {
    const { sala, jugadores } = armarJuego();
    const { client } = armarCliente(ANGEL);
    const angel = jugadores.get(ANGEL);
    const asentamientosAntes = angel.construccionesDisponibles.get(`${Construccion.ASENTAMIENTO}`);
    const puntosAntes = angel.puntuacion;

    manejarColocarCiudad(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(angel.construccionesDisponibles.get(`${Construccion.ASENTAMIENTO}`), asentamientosAntes + 1);
    assert.strictEqual(angel.puntuacion, puntosAntes + 1);
  });

  it("avisa en el log que el jugador construyo una ciudad", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarColocarCiudad(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha construido una ciudad" } }
    ]);
  });

  it("termina la partida si la ciudad da el ultimo punto", () => {
    const { sala, partida, jugadores } = armarJuego();
    const { client } = armarCliente(ANGEL);
    jugadores.get(ANGEL).puntosParaGanar = 1;

    manejarColocarCiudad(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(partida.fase, FasePartida.FINALIZADA);
    assert.strictEqual(partida.ganador, ANGEL);
  });

});
