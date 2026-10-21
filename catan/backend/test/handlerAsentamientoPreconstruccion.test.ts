import { describe, it } from "mocha";
import assert from "node:assert";
import { Construccion, FasePartida, FasePreconstruccion, Terreno } from "../src/common/enums.js";
import { manejarAsentamientoPreconstruccion } from "../src/rooms/handlers/construccion/asentamientoPreconstruccion.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en preconstruccion, en el paso del asentamiento y con el turno de Angel
function armarPreconstruccion() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.fase = FasePartida.PRECONSTRUCCION;
  armado.partida.fasePreconstruccion = FasePreconstruccion.ASENTAMIENTO;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;
  return armado;
}

//? Funcion que suma todos los recursos que tiene un jugador
function totalRecursos(jugador: { recursos: Map<string, number> }) {
  let total = 0;
  jugador.recursos.forEach((cantidad) => { total += cantidad; });
  return total;
}

describe("handler de asentamiento en preconstruccion", () => {

  it("avisa que falta el camino si ya se coloco el asentamiento", () => {
    const { sala, partida } = armarPreconstruccion();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fasePreconstruccion = FasePreconstruccion.CAMINO;

    manejarAsentamientoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Debes colocar un camino" } }
    ]);
  });

  it("avisa si el lugar elegido no existe en el tablero", () => {
    const { sala } = armarPreconstruccion();
    const { client, enviados } = armarCliente(ANGEL);

    manejarAsentamientoPreconstruccion(sala, client, { h: 99, d: 99, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "El lugar seleccionado, no es valido!" } }
    ]);
  });

  it("no cambia de paso si no se pudo construir", () => {
    const { sala, partida, tablero } = armarPreconstruccion();
    const { client } = armarCliente(ANGEL);
    tablero.vertices.get("0,0,0").setPropietario(ALAN);

    manejarAsentamientoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(partida.fasePreconstruccion, FasePreconstruccion.ASENTAMIENTO);
  });

  it("construye el asentamiento a nombre del jugador", () => {
    const { sala, tablero } = armarPreconstruccion();
    const { client } = armarCliente(ANGEL);

    manejarAsentamientoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    const vertice = tablero.vertices.get("0,0,0");
    assert.strictEqual(vertice.propietario, ANGEL);
    assert.strictEqual(vertice.constuccion, Construccion.ASENTAMIENTO);
  });

  it("avisa en el log que el jugador construyo un asentamiento", () => {
    const { sala, difundidos } = armarPreconstruccion();
    const { client } = armarCliente(ANGEL);

    manejarAsentamientoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha construido un asentamiento" } }
    ]);
  });

  it("pasa al paso del camino despues de construir", () => {
    const { sala, partida } = armarPreconstruccion();
    const { client } = armarCliente(ANGEL);

    manejarAsentamientoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(partida.fasePreconstruccion, FasePreconstruccion.CAMINO);
  });

  it("no da material inicial en la vuelta de ida", () => {
    const { sala, jugadores } = armarPreconstruccion();
    const { client } = armarCliente(ANGEL);

    manejarAsentamientoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(totalRecursos(jugadores.get(ANGEL)), 0);
  });

  it("da un recurso por cada hexagono con terreno en la vuelta de regreso", () => {
    const { sala, partida, jugadores, tablero } = armarPreconstruccion();
    const { client } = armarCliente(ANGEL);
    partida.direccionPreconstruccion = -1;

    manejarAsentamientoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    const hexagonosVecinos = ["0,0", "1,-1", "0,-1"].map((clave) => tablero.hexagonos.get(clave));
    const esperados = hexagonosVecinos.filter((hexagono) => hexagono.terreno !== Terreno.DESIERTO).length;
    assert.strictEqual(totalRecursos(jugadores.get(ANGEL)), esperados);
  });

});
