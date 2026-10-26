import { describe, it } from "mocha";
import assert from "node:assert";
import { Construccion, FaseJuego, FasePartida } from "../src/common/enums.js";
import { manejarAsentamientoJuego } from "../src/rooms/handlers/construccion/asentamientoJuego.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en juego, en fase de acciones, con el turno de Angel y todo listo para construir en 0,0,0
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;

  //* Angel tiene los recursos del asentamiento y un camino que llega al vertice 0,0,0
  const angel = armado.jugadores.get(ANGEL);
  ["madera", "ladrillo", "trigo", "lana"].forEach((recurso) => angel.recursos.set(recurso, 1));
  armado.tablero.aristas.get("0,0,0").setPropietario(ANGEL);
  return armado;
}

describe("handler de asentamiento en juego", () => {

  it("avisa que hay que lanzar los dados si aun no se hace", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.DADOS;

    manejarAsentamientoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Debes lanzar los dados primero" } }
    ]);
  });

  it("avisa si no tiene los recursos necesarios", () => {
    const { sala, jugadores } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    jugadores.get(ANGEL).recursos.set("lana", 0);

    manejarAsentamientoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No tienes los recursos necesarios" } }
    ]);
  });

  it("avisa si el asentamiento no conecta con un camino propio", () => {
    const { sala, tablero } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    tablero.aristas.get("0,0,0").setPropietario("");

    manejarAsentamientoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Necesitas conectar con un camino" } }
    ]);
  });

  it("no revisa el camino mas largo si no se pudo construir", () => {
    const { sala, estado } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarAsentamientoJuego(sala, client, { h: 99, d: 99, p: 0 });

    assert.strictEqual(estado.revisionesCamino, 0);
  });

  it("construye el asentamiento y cobra los recursos", () => {
    const { sala, tablero, jugadores } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarAsentamientoJuego(sala, client, { h: 0, d: 0, p: 0 });

    const vertice = tablero.vertices.get("0,0,0");
    assert.strictEqual(vertice.propietario, ANGEL);
    assert.strictEqual(vertice.constuccion, Construccion.ASENTAMIENTO);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 0);
  });

  it("avisa en el log que el jugador construyo un asentamiento", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarAsentamientoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(difundidos.filter((envio) => envio.tipo === "log"), [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha construido un asentamiento" } }
    ]);
  });

  it("avisa a todos que suene el asentamiento", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarAsentamientoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.deepStrictEqual(difundidos.filter((envio) => envio.tipo === "sonido"), [
      { tipo: "sonido", mensaje: { nombre: "asentamiento" } }
    ]);
  });

  it("no manda el sonido si no se pudo construir", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarAsentamientoJuego(sala, client, { h: 99, d: 99, p: 0 });

    assert.strictEqual(difundidos.filter((envio) => envio.tipo === "sonido").length, 0);
  });

  it("revisa el camino mas largo despues de construir", () => {
    const { sala, estado } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarAsentamientoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(estado.revisionesCamino, 1);
  });

  it("termina la partida si el asentamiento da el ultimo punto", () => {
    const { sala, partida, jugadores } = armarJuego();
    const { client } = armarCliente(ANGEL);
    jugadores.get(ANGEL).puntosParaGanar = 1;

    manejarAsentamientoJuego(sala, client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(partida.fase, FasePartida.FINALIZADA);
    assert.strictEqual(partida.ganador, ANGEL);
  });

});
