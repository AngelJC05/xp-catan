import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida, FasePreconstruccion } from "../src/common/enums.js";
import { manejarCaminoPreconstruccion } from "../src/rooms/handlers/construccion/caminoPreconstruccion.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en preconstruccion, en el paso del camino y con el turno de Angel 
function armarPreconstruccion() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.fase = FasePartida.PRECONSTRUCCION;
  armado.partida.fasePreconstruccion = FasePreconstruccion.CAMINO;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;
  armado.jugadores.get(ANGEL).ultimoAsentamiento = "0,0,0";
  armado.jugadores.get(ALAN).ultimoAsentamiento = "0,0,0";
  return armado;
}

describe("handler de camino en preconstruccion", () => {

  it("avisa que falta el asentamiento si aun no se coloca", () => {
    const { sala, partida } = armarPreconstruccion();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fasePreconstruccion = FasePreconstruccion.ASENTAMIENTO;

    manejarCaminoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Coloca primero un asentamiento" } }
    ]);
  });

  it("avisa si el camino no conecta con el ultimo asentamiento", () => {
    const { sala } = armarPreconstruccion();
    const { client, enviados } = armarCliente(ANGEL);

    manejarCaminoPreconstruccion(sala, client, { h: 0, d: 0, p: 2 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "El camino debe conectar con el último asentamiento" } }
    ]);
  });

  it("no cambia de paso ni de turno si no se pudo construir", () => {
    const { sala, partida } = armarPreconstruccion();
    const { client } = armarCliente(ANGEL);

    manejarCaminoPreconstruccion(sala, client, { h: 0, d: 0, p: 2 });

    assert.strictEqual(partida.fasePreconstruccion, FasePreconstruccion.CAMINO);
    assert.strictEqual(partida.turnoActual, ANGEL);
  });

  it("construye el camino a nombre del jugador", () => {
    const { sala, tablero } = armarPreconstruccion();
    const { client } = armarCliente(ANGEL);

    manejarCaminoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(tablero.aristas.get("0,0,0").propietario, ANGEL);
  });

  it("avisa en el log que el jugador construyo un camino", () => {
    const { sala, difundidos } = armarPreconstruccion();
    const { client } = armarCliente(ANGEL);

    manejarCaminoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(difundidos.filter((envio) => envio.tipo === "log"), [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha construido un camino" } }
    ]);
  });

  it("avisa a todos que suene el camino", () => {
    const { sala, difundidos } = armarPreconstruccion();
    const { client } = armarCliente(ANGEL);

    manejarCaminoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(difundidos.filter((envio) => envio.tipo === "sonido"), [
      { tipo: "sonido", mensaje: { nombre: "camino" } }
    ]);
  });

  it("no manda el sonido si no se pudo construir", () => {
    const { sala, difundidos } = armarPreconstruccion();
    const { client } = armarCliente(ANGEL);

    manejarCaminoPreconstruccion(sala, client, { h: 0, d: 0, p: 2 });

    assert.strictEqual(difundidos.filter((envio) => envio.tipo === "sonido").length, 0);
  });

  it("vuelve al paso del asentamiento y pasa el turno al siguiente en la ida", () => {
    const { sala, partida } = armarPreconstruccion();
    const { client } = armarCliente(ANGEL);

    manejarCaminoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(partida.fasePreconstruccion, FasePreconstruccion.ASENTAMIENTO);
    assert.strictEqual(partida.turnoActual, ALAN);
  });

  it("invierte la direccion y conserva el turno cuando el ultimo termina la ida", () => {
    const { sala, partida } = armarPreconstruccion();
    const { client } = armarCliente(ALAN);
    partida.turnoActual = ALAN;

    manejarCaminoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(partida.direccionPreconstruccion, -1);
    assert.strictEqual(partida.turnoActual, ALAN);
  });

  it("pasa el turno al anterior en la vuelta de regreso", () => {
    const { sala, partida } = armarPreconstruccion();
    const { client } = armarCliente(ALAN);
    partida.turnoActual = ALAN;
    partida.direccionPreconstruccion = -1;

    manejarCaminoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(partida.turnoActual, ANGEL);
  });

  it("empieza el juego cuando el primero termina la vuelta de regreso", () => {
    const { sala, partida } = armarPreconstruccion();
    const { client } = armarCliente(ANGEL);
    partida.direccionPreconstruccion = -1;

    manejarCaminoPreconstruccion(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(partida.fase, FasePartida.JUEGO);
    assert.strictEqual(partida.faseJuego, FaseJuego.DADOS);
  });

});
