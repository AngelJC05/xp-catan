import { describe, it } from "mocha";
import assert from "node:assert";
import { Construccion, FaseJuego, FasePartida } from "../src/common/enums.js";
import { manejarCaminoGratis } from "../src/rooms/handlers/cartas/caminoGratis.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en la fase de carreteras con el turno de Angel, dos caminos gratis y un asentamiento suyo en 0,0,0
function armarCarreteras() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.CARRETERAS;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;
  armado.partida.carreterasGratis = 2;
  armado.tablero.vertices.get("0,0,0").setPropietario(ANGEL);
  return armado;
}

describe("handler de camino gratis", () => {

  it("rechaza si la partida ya finalizo", () => {
    const { sala, partida } = armarCarreteras();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.FINALIZADA;

    manejarCaminoGratis(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ha finalizado" } }
    ]);
  });

  it("rechaza si no es su turno", () => {
    const { sala } = armarCarreteras();
    const { client, enviados } = armarCliente(ALAN);

    manejarCaminoGratis(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es tu turno" } }
    ]);
  });

  it("rechaza si no es la fase de carreteras", () => {
    const { sala, partida } = armarCarreteras();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.ACCIONES;

    manejarCaminoGratis(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es la fase de carreteras" } }
    ]);
    assert.strictEqual(partida.carreterasGratis, 2);
  });

  it("construye el camino sin cobrar recursos", () => {
    const { sala, tablero, jugadores } = armarCarreteras();
    const { client } = armarCliente(ANGEL);

    manejarCaminoGratis(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(tablero.aristas.get("0,0,0").propietario, ANGEL);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 0);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("ladrillo"), 0);
  });

  it("revisa el camino mas largo despues de construir", () => {
    const { sala, estado } = armarCarreteras();
    const { client } = armarCliente(ANGEL);

    manejarCaminoGratis(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(estado.revisionesCamino, 1);
  });

  it("con el primer camino le queda uno gratis y sigue en la fase de carreteras", () => {
    const { sala, partida } = armarCarreteras();
    const { client } = armarCliente(ANGEL);

    manejarCaminoGratis(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(partida.carreterasGratis, 1);
    assert.strictEqual(partida.faseJuego, FaseJuego.CARRETERAS);
  });

  it("con el segundo camino vuelve a las acciones", () => {
    const { sala, partida, tablero } = armarCarreteras();
    const { client } = armarCliente(ANGEL);

    manejarCaminoGratis(sala, client, { h: 0, d: 0, p: 0 });
    manejarCaminoGratis(sala, client, { h: 0, d: 0, p: 1 });

    assert.strictEqual(tablero.aristas.get("0,0,1").propietario, ANGEL);
    assert.strictEqual(partida.carreterasGratis, 0);
    assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
  });

  it("si el camino no se puede construir avisa y no gasta el camino gratis", () => {
    const { sala, partida, estado } = armarCarreteras();
    const { client, enviados } = armarCliente(ANGEL);

    manejarCaminoGratis(sala, client, { h: 99, d: 99, p: 0 });

    assert.strictEqual(enviados.length, 1);
    assert.strictEqual(enviados[0].tipo, "error");
    assert.strictEqual(partida.carreterasGratis, 2);
    assert.strictEqual(partida.faseJuego, FaseJuego.CARRETERAS);
    assert.strictEqual(estado.revisionesCamino, 0);
  });

  it("si ya no tiene caminos disponibles no avisa y se gasta el camino gratis igual", () => {
    const { sala, partida, jugadores, estado } = armarCarreteras();
    const { client, enviados } = armarCliente(ANGEL);
    jugadores.get(ANGEL).construccionesDisponibles.set(`${Construccion.CAMINO}`, 0);

    manejarCaminoGratis(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(enviados.length, 0);
    assert.strictEqual(partida.carreterasGratis, 1);
    assert.strictEqual(estado.revisionesCamino, 0);
  });

  it("avisa a todos que suene el camino", () => {
    const { sala, difundidos } = armarCarreteras();
    const { client } = armarCliente(ANGEL);

    manejarCaminoGratis(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(difundidos.filter((envio) => envio.tipo === "sonido"), [
      { tipo: "sonido", mensaje: { nombre: "camino" } }
    ]);
  });

  it("no manda el sonido si el camino no se pudo construir", () => {
    const { sala, difundidos } = armarCarreteras();
    const { client } = armarCliente(ANGEL);

    manejarCaminoGratis(sala, client, { h: 99, d: 99, p: 0 });

    assert.strictEqual(difundidos.filter((envio) => envio.tipo === "sonido").length, 0);
  });

  it("no manda el sonido si ya no tiene caminos disponibles", () => {
    const { sala, jugadores, difundidos } = armarCarreteras();
    const { client } = armarCliente(ANGEL);
    jugadores.get(ANGEL).construccionesDisponibles.set(`${Construccion.CAMINO}`, 0);

    manejarCaminoGratis(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(difundidos.filter((envio) => envio.tipo === "sonido").length, 0);
  });

});
