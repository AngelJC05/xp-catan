import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida } from "../src/common/enums.js";
import { manejarOfrecerIntercambio } from "../src/rooms/handlers/comercio/ofrecerIntercambio.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const LUIS = "jugadorLuis";

const OFERTA = { ofrecidos: { madera: 2 }, solicitados: { trigo: 1, lana: 1 } };

//? Funcion que devuelve una sala en juego, en fase de acciones, con el turno de Angel y sin ofertas activas
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan", [LUIS]: "Luis" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.ordenJugadores.push(ANGEL, ALAN, LUIS);
  armado.partida.turnoActual = ANGEL;
  return armado;
}

describe("handler de ofrecer un intercambio", () => {

  it("rechaza si la partida ya finalizo", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.FINALIZADA;

    manejarOfrecerIntercambio(sala, client, OFERTA);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ha finalizado" } }
    ]);
  });

  it("rechaza si no es su turno", () => {
    const { sala } = armarJuego();
    const { client, enviados } = armarCliente(ALAN);

    manejarOfrecerIntercambio(sala, client, OFERTA);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es tu turno" } }
    ]);
  });

  it("rechaza si aun no se lanzaron los dados", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.DADOS;

    manejarOfrecerIntercambio(sala, client, OFERTA);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Debes lanzar los dados primero" } }
    ]);
  });

  it("rechaza si ya existe una oferta activa", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.ofertaIntercambio.jugador = ANGEL;

    manejarOfrecerIntercambio(sala, client, OFERTA);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Ya existe una oferta activa" } }
    ]);
  });

  it("avisa si la oferta no es valida y no deja ninguna oferta ni log", () => {
    const { sala, partida, difundidos } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);

    manejarOfrecerIntercambio(sala, client, { ofrecidos: {}, solicitados: { trigo: 1 } });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Debes ofrecer al menos un recurso" } }
    ]);
    assert.strictEqual(partida.ofertaIntercambio.jugador, "");
    assert.strictEqual(difundidos.length, 0);
  });

  it("avisa en vez de fallar si el mensaje llega sin los recursos", () => {
    const { sala } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);

    manejarOfrecerIntercambio(sala, client, {} as { ofrecidos: Record<string, number>, solicitados: Record<string, number> });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Debes ofrecer al menos un recurso" } }
    ]);
  });

  it("avisa si pide y da el mismo recurso", () => {
    const { sala } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);

    manejarOfrecerIntercambio(sala, client, { ofrecidos: { madera: 1 }, solicitados: { madera: 1 } });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No puedes pedir y dar el mismo recurso" } }
    ]);
  });

  it("guarda la oferta con todos los recursos ofrecidos y solicitados", () => {
    const { sala, partida } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarOfrecerIntercambio(sala, client, OFERTA);

    const oferta = partida.ofertaIntercambio;
    assert.strictEqual(oferta.jugador, ANGEL);
    assert.strictEqual(oferta.recursosOfrecidos.get("madera"), 2);
    assert.strictEqual(oferta.recursosSolicitados.get("trigo"), 1);
    assert.strictEqual(oferta.recursosSolicitados.get("lana"), 1);
  });

  it("deja pendiente la respuesta de todos menos de quien ofrece", () => {
    const { sala, partida } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarOfrecerIntercambio(sala, client, OFERTA);

    const respuestas = partida.ofertaIntercambio.respuestas;
    assert.strictEqual(respuestas.has(ANGEL), false);
    assert.strictEqual(respuestas.get(ALAN), 0);
    assert.strictEqual(respuestas.get(LUIS), 0);
  });

  it("avisa en el log que el jugador hizo una oferta", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarOfrecerIntercambio(sala, client, OFERTA);

    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha hecho una oferta de intercambio" } }
    ]);
  });

});
