import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida } from "../src/common/enums.js";
import { manejarCaminoJuego } from "../src/rooms/handlers/construccion/caminoJuego.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en juego, en fase de acciones, con turno de Angel y condiciones suficientes
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;

  const angel = armado.jugadores.get(ANGEL);
  ["madera", "ladrillo"].forEach((recurso) => angel.recursos.set(recurso, 1));
  armado.tablero.vertices.get("0,0,0").setPropietario(ANGEL);
  return armado;
}

//? Funcion que devuelve una sala en juego vertice 0,0,0 Alan y arista 0,0,1 Angel
function armarJuegoConVerticeRival() {
  const armado = armarJuego();
  armado.tablero.vertices.get("0,0,0").setPropietario(ALAN);
  armado.tablero.aristas.get("0,0,1").setPropietario(ANGEL);
  return armado;
}

describe("handler de camino en juego", () => {

  it("avisa que hay que lanzar los dados si aun no se hace", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.DADOS;

    manejarCaminoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Debes lanzar los dados primero" } }
    ]);
  });

  it("avisa si no tiene los recursos suficientes", () => {
    const { sala, jugadores } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    jugadores.get(ANGEL).recursos.set("ladrillo", 0);

    manejarCaminoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No tienes los recursos suficientes" } }
    ]);
  });

  it("avisa si el camino no conecta con una construccion propia", () => {
    const { sala, tablero } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    tablero.vertices.get("0,0,0").setPropietario("");

    manejarCaminoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "El camino debe conectar con alguna construccion tuya" } }
    ]);
  });

  it("no revisa el camino mas largo si no se pudo construir", () => {
    const { sala, estado } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCaminoJuego(sala, client, { h: 99, d: 99, p: 0 });

    assert.strictEqual(estado.revisionesCamino, 0);
  });

  it("construye el camino y cobra los recursos", () => {
    const { sala, tablero, jugadores } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCaminoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(tablero.aristas.get("0,0,0").propietario, ANGEL);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 0);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("ladrillo"), 0);
  });

  it("avisa en el log que el jugador construyo un camino", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCaminoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(difundidos.filter((envio) => envio.tipo === "log"), [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha construido un camino" } }
    ]);
  });

  it("avisa a todos que suene el camino", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCaminoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(difundidos.filter((envio) => envio.tipo === "sonido"), [
      { tipo: "sonido", mensaje: { nombre: "camino" } }
    ]);
  });

  it("no manda el sonido si no se pudo construir", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCaminoJuego(sala, client, { h: 99, d: 99, p: 0 });

    assert.strictEqual(difundidos.filter((envio) => envio.tipo === "sonido").length, 0);
  });

  it("revisa el camino mas largo despues de construir", () => {
    const { sala, estado } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCaminoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(estado.revisionesCamino, 1);
  });

  it("no deja construir un camino pasando por un vertice con una construccion rival", () => {
    const { sala, tablero, jugadores } = armarJuegoConVerticeRival();
    const { client, enviados } = armarCliente(ANGEL);

    manejarCaminoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Una construccion rival bloquea ese camino" } }
    ]);
    assert.strictEqual(tablero.aristas.get("0,0,0").propietario, "");
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 1);
  });

  it("deja seguir el camino por el otro extremo si ese vertice esta libre", () => {
    const { sala, tablero } = armarJuegoConVerticeRival();
    const { client, enviados } = armarCliente(ANGEL);

    manejarCaminoJuego(sala, client, { h: 0, d: 0, p: 2 });

    assert.strictEqual(enviados.length, 0);
    assert.strictEqual(tablero.aristas.get("0,0,2").propietario, ANGEL);
  });

  it("deja construir aunque choque con un camino rival si el vertice esta libre", () => {
    const { sala, tablero } = armarJuegoConVerticeRival();
    const { client, enviados } = armarCliente(ANGEL);
    tablero.vertices.get("0,0,0").setPropietario("");
    tablero.aristas.get("1,-1,2").setPropietario(ALAN);

    manejarCaminoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(enviados.length, 0);
    assert.strictEqual(tablero.aristas.get("0,0,0").propietario, ANGEL);
  });

  it("si tiene tu propia construccion en el vertice si puede construir", () => {
    const { sala, tablero } = armarJuegoConVerticeRival();
    const { client, enviados } = armarCliente(ANGEL);
    tablero.vertices.get("0,0,0").setPropietario(ANGEL);

    manejarCaminoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(enviados.length, 0);
    assert.strictEqual(tablero.aristas.get("0,0,0").propietario, ANGEL);
  });

});
