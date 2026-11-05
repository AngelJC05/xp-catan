import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida } from "../../../../src/common/enums.js";
import { manejarResponderIntercambio } from "../../../../src/rooms/handlers/comercio/responderIntercambio.js";
import { armarCliente, armarSala } from "../../../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const LUIS = "jugadorLuis";

//? Funcion que devuelve una sala con una oferta activa: Angel da 2 de madera por 1 de trigo, y Alan tiene el trigo
function armarOferta() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan", [LUIS]: "Luis" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.ordenJugadores.push(ANGEL, ALAN, LUIS);
  armado.partida.turnoActual = ANGEL;
  armado.partida.ofertaIntercambio.setOfertaMixta(
    ANGEL, armado.jugadores, { madera: 2 }, { trigo: 1 }
  );
  armado.jugadores.get(ANGEL).recursos.set("madera", 2);
  armado.jugadores.get(ALAN).recursos.set("trigo", 1);
  return armado;
}

describe("handler de responder un intercambio", () => {

  it("rechaza si no hay una oferta activa", () => {
    const { sala, partida } = armarOferta();
    const { client, enviados } = armarCliente(ALAN);
    partida.ofertaIntercambio.limpiarOferta();

    manejarResponderIntercambio(sala, client, { respuesta: 1 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No hay una oferta activa" } }
    ]);
  });

  it("rechaza que responda quien hizo la oferta", () => {
    const { sala } = armarOferta();
    const { client, enviados } = armarCliente(ANGEL);

    manejarResponderIntercambio(sala, client, { respuesta: 1 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No puedes responder a esta oferta" } }
    ]);
  });

  it("rechaza que responda dos veces", () => {
    const { sala, partida } = armarOferta();
    const { client, enviados } = armarCliente(ALAN);
    partida.ofertaIntercambio.registrarRespuesta(ALAN, -1);

    manejarResponderIntercambio(sala, client, { respuesta: 1 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Ya respondiste a esta oferta" } }
    ]);
  });

  it("rechaza una respuesta que no sea 1 ni -1", () => {
    const { sala, partida } = armarOferta();
    const { client, enviados } = armarCliente(ALAN);

    manejarResponderIntercambio(sala, client, { respuesta: 0 });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Respuesta invalida" } }
    ]);
    assert.strictEqual(partida.ofertaIntercambio.respuestas.get(ALAN), 0);
  });

  it("con -1 rechaza la oferta", () => {
    const { sala, partida, difundidos } = armarOferta();
    const { client } = armarCliente(ALAN);

    manejarResponderIntercambio(sala, client, { respuesta: -1 });

    assert.strictEqual(partida.ofertaIntercambio.respuestas.get(ALAN), -1);
    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Alan", mensaje: " ha rechazado la oferta de intercambio" } }
    ]);
  });

  it("con 1 acepta la oferta y se hace el intercambio", () => {
    const { sala, partida, jugadores, difundidos } = armarOferta();
    const { client } = armarCliente(ALAN);

    manejarResponderIntercambio(sala, client, { respuesta: 1 });

    assert.strictEqual(jugadores.get(ANGEL).recursos.get("trigo"), 1);
    assert.strictEqual(jugadores.get(ALAN).recursos.get("madera"), 2);
    assert.strictEqual(partida.ofertaIntercambio.jugador, "");
    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Alan", mensaje: " ha aceptado la oferta de intercambio" } }
    ]);
  });

});
