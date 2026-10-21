import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida } from "../src/common/enums.js";
import { aceptarOferta } from "../src/rooms/handlers/comercio/aceptarOferta.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const LUIS = "jugadorLuis";

//? Funcion que devuelve una sala con una oferta activa: Angel da 2 de madera por 1 de trigo y 1 de lana, y Alan tiene justo lo pedido
function armarOferta() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan", [LUIS]: "Luis" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.ordenJugadores.push(ANGEL, ALAN, LUIS);
  armado.partida.turnoActual = ANGEL;
  armado.partida.ofertaIntercambio.setOfertaMixta(
    ANGEL, armado.jugadores, { madera: 2 }, { trigo: 1, lana: 1 }
  );
  armado.jugadores.get(ANGEL).recursos.set("madera", 2);
  armado.jugadores.get(ALAN).recursos.set("trigo", 1);
  armado.jugadores.get(ALAN).recursos.set("lana", 1);
  return armado;
}

describe("aceptar una oferta de intercambio", () => {

  it("intercambia los recursos entre quien ofrece y quien acepta", () => {
    const { sala, jugadores } = armarOferta();
    const { client } = armarCliente(ALAN);

    aceptarOferta(sala, client);

    const angel = jugadores.get(ANGEL);
    const alan = jugadores.get(ALAN);
    assert.strictEqual(angel.recursos.get("madera"), 0);
    assert.strictEqual(angel.recursos.get("trigo"), 1);
    assert.strictEqual(angel.recursos.get("lana"), 1);
    assert.strictEqual(alan.recursos.get("madera"), 2);
    assert.strictEqual(alan.recursos.get("trigo"), 0);
    assert.strictEqual(alan.recursos.get("lana"), 0);
  });

  it("avisa en el log que acepto y cancela la oferta", () => {
    const { sala, partida, difundidos } = armarOferta();
    const { client } = armarCliente(ALAN);

    aceptarOferta(sala, client);

    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Alan", mensaje: " ha aceptado la oferta de intercambio" } }
    ]);
    assert.strictEqual(partida.ofertaIntercambio.jugador, "");
  });

  it("si a quien ofrecio ya no le alcanza, cancela la oferta y avisa a quien acepta", () => {
    const { sala, partida, jugadores, difundidos } = armarOferta();
    const { client, enviados } = armarCliente(ALAN);
    jugadores.get(ANGEL).recursos.set("madera", 0);

    aceptarOferta(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Oferta cancelada, el negociante no tiene ya recursos" } }
    ]);
    assert.strictEqual(partida.ofertaIntercambio.jugador, "");
    assert.strictEqual(jugadores.get(ALAN).recursos.get("trigo"), 1);
    assert.strictEqual(difundidos.length, 0);
  });

  it("si a quien acepta le faltan recursos, cuenta como rechazo y la oferta sigue", () => {
    const { sala, partida, jugadores, difundidos } = armarOferta();
    const { client, enviados } = armarCliente(ALAN);
    jugadores.get(ALAN).recursos.set("trigo", 0);

    aceptarOferta(sala, client);

    assert.strictEqual(partida.ofertaIntercambio.respuestas.get(ALAN), -1);
    assert.strictEqual(partida.ofertaIntercambio.jugador, ANGEL);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 2);
    assert.strictEqual(enviados.length, 0);
    assert.strictEqual(difundidos.length, 0);
  });

  it("si a quien acepta le faltan recursos y los demas ya rechazaron, cancela la oferta", () => {
    const { sala, partida, jugadores } = armarOferta();
    const { client } = armarCliente(ALAN);
    jugadores.get(ALAN).recursos.set("trigo", 0);
    partida.ofertaIntercambio.registrarRespuesta(LUIS, -1);

    aceptarOferta(sala, client);

    assert.strictEqual(partida.ofertaIntercambio.jugador, "");
  });

  it("avisa si la oferta no tiene recursos y no mueve nada", () => {
    const { sala, partida, jugadores, difundidos } = armarOferta();
    const { client, enviados } = armarCliente(ALAN);
    partida.ofertaIntercambio.recursosOfrecidos.clear();

    aceptarOferta(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La oferta no tiene recursos" } }
    ]);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 2);
    assert.strictEqual(difundidos.length, 0);
  });

});
