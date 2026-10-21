import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida } from "../src/common/enums.js";
import { manejarDescartarRecursos } from "../src/rooms/handlers/descarte/descartarRecursos.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en la fase de descarte: Angel debe descartar 2 recursos y Alan 1, y el turno es de Alan
function armarDescarte() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.DESCARTE;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ALAN;
  armado.partida.jugadoresParaDescartar.set(ANGEL, 2);
  armado.partida.jugadoresParaDescartar.set(ALAN, 1);
  armado.jugadores.get(ANGEL).recursos.set("madera", 5);
  return armado;
}

describe("handler de descartar recursos", () => {

  it("rechaza si no es la fase de descarte", () => {
    const { sala, partida } = armarDescarte();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.ACCIONES;

    manejarDescartarRecursos(sala, client, { recurso: "madera" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es la fase de descarte" } }
    ]);
  });

  it("rechaza a quien no tiene que descartar", () => {
    const { sala, partida } = armarDescarte();
    const { client, enviados } = armarCliente(ANGEL);
    partida.jugadoresParaDescartar.delete(ANGEL);

    manejarDescartarRecursos(sala, client, { recurso: "madera" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No tienes que descartar" } }
    ]);
  });

  it("avisa si el recurso no es valido", () => {
    const { sala, partida } = armarDescarte();
    const { client, enviados } = armarCliente(ANGEL);

    manejarDescartarRecursos(sala, client, { recurso: "oro" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "El recurso seleccionado no es valido" } }
    ]);
    assert.strictEqual(partida.jugadoresParaDescartar.get(ANGEL), 2);
  });

  it("avisa si el jugador no tiene ese recurso", () => {
    const { sala } = armarDescarte();
    const { client, enviados } = armarCliente(ANGEL);

    manejarDescartarRecursos(sala, client, { recurso: "trigo" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Ese recurso no lo tiene" } }
    ]);
  });

  it("descarta el recurso a la banca aunque no sea su turno", () => {
    const { sala, jugadores, banca } = armarDescarte();
    const { client } = armarCliente(ANGEL);
    const enBancaAntes = banca.recursos.get("madera");

    manejarDescartarRecursos(sala, client, { recurso: "madera" });

    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 4);
    assert.strictEqual(banca.recursos.get("madera"), enBancaAntes + 1);
  });

  it("le resta uno a lo que le falta por descartar", () => {
    const { sala, partida } = armarDescarte();
    const { client } = armarCliente(ANGEL);

    manejarDescartarRecursos(sala, client, { recurso: "madera" });

    assert.strictEqual(partida.jugadoresParaDescartar.get(ANGEL), 1);
    assert.strictEqual(partida.faseJuego, FaseJuego.DESCARTE);
  });

  it("lo saca de la lista y avisa en el log cuando termina de descartar", () => {
    const { sala, partida, difundidos } = armarDescarte();
    const { client } = armarCliente(ANGEL);
    partida.jugadoresParaDescartar.set(ANGEL, 1);

    manejarDescartarRecursos(sala, client, { recurso: "madera" });

    assert.strictEqual(partida.jugadoresParaDescartar.has(ANGEL), false);
    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha terminado de descartar" } }
    ]);
    assert.strictEqual(partida.faseJuego, FaseJuego.DESCARTE);
  });

  it("pasa a mover al ladron cuando ya nadie debe descartar", () => {
    const { sala, partida, difundidos } = armarDescarte();
    const { client } = armarCliente(ANGEL);
    partida.jugadoresParaDescartar.delete(ALAN);
    partida.jugadoresParaDescartar.set(ANGEL, 1);

    manejarDescartarRecursos(sala, client, { recurso: "madera" });

    assert.strictEqual(partida.faseJuego, FaseJuego.LADRON);
    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha terminado de descartar" } },
      { tipo: "log", mensaje: { jugador: "Sistema: ", mensaje: "Todos los jugadores han terminado de descartar" } }
    ]);
  });

});
