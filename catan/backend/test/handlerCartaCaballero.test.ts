import { describe, it } from "mocha";
import assert from "node:assert";
import { Desarrollo, FaseJuego, FasePartida } from "../src/common/enums.js";
import { verticesDelHexagono } from "../src/functions/verticesDelHexagono.js";
import { manejarCartaCaballero } from "../src/rooms/handlers/cartas/cartaCaballero.js";
import type { Hexagono } from "../src/schemas/Hexagono.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const LUIS = "jugadorLuis";
const CABALLERO = `${Desarrollo.CABALLERO}`;

//? Funcion que devuelve una sala en juego, en fase de acciones, con el turno de Angel, que tiene una carta de caballero lista para usar
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan", [LUIS]: "Luis" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.ordenJugadores.push(ANGEL, ALAN, LUIS);
  armado.partida.turnoActual = ANGEL;
  armado.partida.cartaJugable = true;
  armado.jugadores.get(ANGEL).cartas_usables.set(CABALLERO, 1);

  //* Se elige un hexagono distinto al que tiene el ladron como destino
  let destino: Hexagono | undefined;
  armado.tablero.hexagonos.forEach((hexagono) => {
    const tieneLadron = hexagono.h === armado.tablero.ladron.h && hexagono.d === armado.tablero.ladron.d;
    if (!destino && !tieneLadron) destino = hexagono;
  });

  return { ...armado, destino: destino as Hexagono };
}

//? Funcion que suma todos los recursos que tiene un jugador
function totalRecursos(jugador: { recursos: Map<string, number> }) {
  let total = 0;
  jugador.recursos.forEach((cantidad) => { total += cantidad; });
  return total;
}

describe("handler de la carta de caballero", () => {

  it("rechaza si la partida ya finalizo", () => {
    const { sala, partida, destino } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.FINALIZADA;

    manejarCartaCaballero(sala, client, { h: destino.h, d: destino.d });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ha finalizado" } }
    ]);
  });

  it("rechaza si no es su turno", () => {
    const { sala, destino } = armarJuego();
    const { client, enviados } = armarCliente(ALAN);

    manejarCartaCaballero(sala, client, { h: destino.h, d: destino.d });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es tu turno" } }
    ]);
  });

  it("rechaza si aun no se lanzaron los dados", () => {
    const { sala, partida, destino } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.DADOS;

    manejarCartaCaballero(sala, client, { h: destino.h, d: destino.d });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Debes lanzar los dados primero" } }
    ]);
  });

  it("rechaza si ya uso una carta este turno", () => {
    const { sala, partida, destino } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.cartaJugable = false;

    manejarCartaCaballero(sala, client, { h: destino.h, d: destino.d });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Solo una carta por turno" } }
    ]);
  });

  it("rechaza si no tiene la carta de caballero", () => {
    const { sala, jugadores, destino } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    jugadores.get(ANGEL).cartas_usables.set(CABALLERO, 0);

    manejarCartaCaballero(sala, client, { h: destino.h, d: destino.d });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No tienes la carta de caballero" } }
    ]);
  });

  it("si el ladron no se puede mover avisa y no gasta la carta", () => {
    const { sala, partida, jugadores, tablero, difundidos } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);

    manejarCartaCaballero(sala, client, { h: tablero.ladron.h, d: tablero.ladron.d });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "El ladron ya esta en ese hexagono" } }
    ]);
    assert.strictEqual(jugadores.get(ANGEL).cartas_usables.get(CABALLERO), 1);
    assert.strictEqual(partida.cartaJugable, true);
    assert.strictEqual(difundidos.length, 0);
  });

  it("mueve al ladron al hexagono elegido", () => {
    const { sala, tablero, destino } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCartaCaballero(sala, client, { h: destino.h, d: destino.d });

    assert.strictEqual(tablero.ladron.h, destino.h);
    assert.strictEqual(tablero.ladron.d, destino.d);
  });

  it("gasta la carta, cuenta el caballero y bloquea otra carta este turno", () => {
    const { sala, partida, jugadores, destino } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCartaCaballero(sala, client, { h: destino.h, d: destino.d });

    assert.strictEqual(jugadores.get(ANGEL).cartas_usables.get(CABALLERO), 0);
    assert.strictEqual(jugadores.get(ANGEL).caballerosJugados, 1);
    assert.strictEqual(partida.cartaJugable, false);
  });

  it("avisa en el log que el jugador jugo una carta de caballero", () => {
    const { sala, destino, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCartaCaballero(sala, client, { h: destino.h, d: destino.d });

    assert.deepStrictEqual(difundidos.filter((envio) => envio.tipo === "log"), [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha jugado una carta de caballero" } }
    ]);
  });

  it("avisa a todos que suene el ladron al jugar el caballero", () => {
    const { sala, destino, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCartaCaballero(sala, client, { h: destino.h, d: destino.d });

    assert.deepStrictEqual(difundidos.filter((envio) => envio.tipo === "sonido"), [
      { tipo: "sonido", mensaje: { nombre: "ladron" } }
    ]);
  });

  it("pasa a las acciones si nadie puede ser robado", () => {
    const { sala, partida, destino } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCartaCaballero(sala, client, { h: destino.h, d: destino.d });

    assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
  });

  it("roba automaticamente si solo un jugador puede ser robado", () => {
    const { sala, jugadores, tablero, destino } = armarJuego();
    const { client } = armarCliente(ANGEL);
    verticesDelHexagono(tablero.vertices, destino)[0].setPropietario(ALAN);
    jugadores.get(ALAN).recursos.set("madera", 1);

    manejarCartaCaballero(sala, client, { h: destino.h, d: destino.d });

    assert.strictEqual(totalRecursos(jugadores.get(ALAN)), 0);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 1);
  });

  it("deja elegir a quien robar si hay dos jugadores que pueden ser robados", () => {
    const { sala, partida, jugadores, tablero, destino } = armarJuego();
    const { client } = armarCliente(ANGEL);
    const vertices = verticesDelHexagono(tablero.vertices, destino);
    vertices[0].setPropietario(ALAN);
    vertices[1].setPropietario(LUIS);
    jugadores.get(ALAN).recursos.set("madera", 1);
    jugadores.get(LUIS).recursos.set("trigo", 1);

    manejarCartaCaballero(sala, client, { h: destino.h, d: destino.d });

    assert.strictEqual(partida.faseJuego, FaseJuego.ROBO);
    assert.deepStrictEqual(Array.from(partida.jugadoresParaRobar).sort(), [ALAN, LUIS].sort());
  });

  it("con tres caballeros jugados obtiene el ejercito mas grande", () => {
    const { sala, partida, jugadores, destino } = armarJuego();
    const { client } = armarCliente(ANGEL);
    jugadores.get(ANGEL).caballerosJugados = 2;

    manejarCartaCaballero(sala, client, { h: destino.h, d: destino.d });

    assert.strictEqual(partida.ejercitoMasGrande, ANGEL);
  });

  it("termina la partida si el ejercito mas grande da el ultimo punto", () => {
    const { sala, partida, jugadores, destino } = armarJuego();
    const { client } = armarCliente(ANGEL);
    jugadores.get(ANGEL).caballerosJugados = 2;
    jugadores.get(ANGEL).puntosParaGanar = 2;

    manejarCartaCaballero(sala, client, { h: destino.h, d: destino.d });

    assert.strictEqual(partida.fase, FasePartida.FINALIZADA);
    assert.strictEqual(partida.ganador, ANGEL);
  });

});
