import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida } from "../src/common/enums.js";
import { verticesDelHexagono } from "../src/functions/verticesDelHexagono.js";
import { manejarMoverLadron } from "../src/rooms/handlers/ladron/moverLadron.js";
import type { Hexagono } from "../src/schemas/Hexagono.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const LUIS = "jugadorLuis";

//? Funcion que devuelve una sala en juego, en la fase de mover al ladron y con el turno de Angel
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan", [LUIS]: "Luis" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.LADRON;
  armado.partida.ordenJugadores.push(ANGEL, ALAN, LUIS);
  armado.partida.turnoActual = ANGEL;

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

describe("handler de mover al ladron", () => {

  it("rechaza si la partida ya finalizo", () => {
    const { sala, partida, destino } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.FINALIZADA;

    manejarMoverLadron(sala, client, { h: destino.h, d: destino.d });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ha finalizado" } }
    ]);
  });

  it("rechaza si no es su turno", () => {
    const { sala, destino } = armarJuego();
    const { client, enviados } = armarCliente(ALAN);

    manejarMoverLadron(sala, client, { h: destino.h, d: destino.d });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es tu turno" } }
    ]);
  });

  it("rechaza si aun no es la fase de juego", () => {
    const { sala, partida, destino } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.PRECONSTRUCCION;

    manejarMoverLadron(sala, client, { h: destino.h, d: destino.d });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es la fase de juego" } }
    ]);
  });

  it("rechaza si no es la fase de mover al ladron", () => {
    const { sala, partida, destino } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.ACCIONES;

    manejarMoverLadron(sala, client, { h: destino.h, d: destino.d });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es la fase de mover al ladron" } }
    ]);
  });

  it("avisa si el hexagono no existe y no cambia de fase", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);

    manejarMoverLadron(sala, client, { h: 99, d: 99 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "El hexagono seleccionado no existe" } }
    ]);
    assert.strictEqual(partida.faseJuego, FaseJuego.LADRON);
  });

  it("avisa si el ladron ya esta en ese hexagono", () => {
    const { sala, tablero } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);

    manejarMoverLadron(sala, client, { h: tablero.ladron.h, d: tablero.ladron.d });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "El ladron ya esta en ese hexagono" } }
    ]);
  });

  it("mueve al ladron al hexagono elegido", () => {
    const { sala, tablero, destino } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarMoverLadron(sala, client, { h: destino.h, d: destino.d });

    assert.strictEqual(tablero.ladron.h, destino.h);
    assert.strictEqual(tablero.ladron.d, destino.d);
    assert.strictEqual(destino.esLadron, true);
  });

  it("avisa en el log que el jugador movio al ladron", () => {
    const { sala, destino, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarMoverLadron(sala, client, { h: destino.h, d: destino.d });

    assert.deepStrictEqual(difundidos.filter((envio) => envio.tipo === "log"), [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha movido al ladron" } }
    ]);
  });

  it("avisa a todos que suene el ladron", () => {
    const { sala, destino, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarMoverLadron(sala, client, { h: destino.h, d: destino.d });

    assert.deepStrictEqual(difundidos.filter((envio) => envio.tipo === "sonido"), [
      { tipo: "sonido", mensaje: { nombre: "ladron" } }
    ]);
  });

  it("no manda el sonido si no se pudo mover al ladron", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarMoverLadron(sala, client, { h: 99, d: 99 });

    assert.strictEqual(difundidos.filter((envio) => envio.tipo === "sonido").length, 0);
  });

  it("pasa a las acciones si nadie puede ser robado", () => {
    const { sala, partida, destino } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarMoverLadron(sala, client, { h: destino.h, d: destino.d });

    assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
  });

  it("roba automaticamente si solo un jugador puede ser robado", () => {
    const { sala, partida, jugadores, tablero, destino } = armarJuego();
    const { client } = armarCliente(ANGEL);

    verticesDelHexagono(tablero.vertices, destino)[0].setPropietario(ALAN);
    jugadores.get(ALAN).recursos.set("madera", 1);

    manejarMoverLadron(sala, client, { h: destino.h, d: destino.d });

    assert.strictEqual(totalRecursos(jugadores.get(ALAN)), 0);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 1);
    assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
  });

  it("deja elegir a quien robar si hay dos jugadores que pueden ser robados", () => {
    const { sala, partida, jugadores, tablero, destino } = armarJuego();
    const { client } = armarCliente(ANGEL);

    const vertices = verticesDelHexagono(tablero.vertices, destino);
    vertices[0].setPropietario(ALAN);
    vertices[1].setPropietario(LUIS);
    
    jugadores.get(ALAN).recursos.set("madera", 1);
    jugadores.get(LUIS).recursos.set("trigo", 1);

    manejarMoverLadron(sala, client, { h: destino.h, d: destino.d });

    assert.strictEqual(partida.faseJuego, FaseJuego.ROBO);
    assert.deepStrictEqual(Array.from(partida.jugadoresParaRobar).sort(), [ALAN, LUIS].sort());
  });

});
