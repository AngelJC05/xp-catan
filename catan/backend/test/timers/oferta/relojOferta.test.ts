import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego } from "../../../src/common/enums.js";
import { Jugador } from "../../../src/schemas/Jugador.js";
import { TIEMPOS_POR_DEFECTO } from "../../../src/timers/tiempos.js";
import { vencerOferta } from "../../../src/autoFunctions/comercio/vencerOferta.js";
import { manejarOfrecerIntercambio } from "../../../src/rooms/handlers/comercio/ofrecerIntercambio.js";
import { manejarResponderIntercambio } from "../../../src/rooms/handlers/comercio/responderIntercambio.js";
import { manejarPasarTurno } from "../../../src/rooms/handlers/turno/pasarTurno.js";
import { manejarSalida } from "../../../src/rooms/handlers/sala/salirDeSala.js";
import { ALAN, ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";
import { armarCliente } from "../../ayudas/salaFalsa.js";

const LUIS = "jugadorLuis";

const OFERTA = { ofrecidos: { madera: 2 }, solicitados: { trigo: 1 } };

//? Funcion que devuelve el juego con tres jugadores, en la fase de acciones de Angel y con recursos para cambiar
function armarComercioConReloj() {
  const armado = armarJuegoConReloj();
  armado.jugadores.set(LUIS, new Jugador("Luis"));
  armado.partida.ordenJugadores.push(LUIS);
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.jugadores.get(ANGEL).recursos.set("madera", 2);
  armado.jugadores.get(ALAN).recursos.set("trigo", 1);
  return armado;
}

//? Funcion que devuelve el comercio con la oferta de Angel ya publicada y su reloj en marcha
function armarOfertaPublicada() {
  const armado = armarComercioConReloj();
  manejarOfrecerIntercambio(armado.sala, armarCliente(ANGEL).client, OFERTA);
  return armado;
}

//? Responde la oferta activa como un jugador: 1 acepta y -1 rechaza
function responder(armado: ReturnType<typeof armarComercioConReloj>, sessionId: string, respuesta: number) {
  manejarResponderIntercambio(armado.sala, armarCliente(sessionId).client, { respuesta });
}

describe("reloj de oferta al publicar una oferta", () => {

  it("programa el reloj con el tiempo de oferta de la sala", () => {
    const { sala, programados } = armarOfertaPublicada();

    assert.strictEqual(programados.length, 1);
    assert.strictEqual(programados[0].milisegundos, TIEMPOS_POR_DEFECTO.oferta * 1000);
    assert.strictEqual(sala.temporizador.estaActivo("oferta"), true);
  });

  it("no programa el reloj si la oferta no es valida", () => {
    const { sala, programados } = armarComercioConReloj();

    manejarOfrecerIntercambio(sala, armarCliente(ANGEL).client, { ofrecidos: {}, solicitados: { trigo: 1 } });

    assert.strictEqual(programados.length, 0);
    assert.strictEqual(sala.temporizador.estaActivo("oferta"), false);
  });
});

describe("reloj de oferta cuando la oferta se cierra antes de tiempo", () => {

  it("se cancela si alguien acepta", () => {
    const armado = armarOfertaPublicada();

    responder(armado, ALAN, 1);

    assert.strictEqual(armado.partida.ofertaIntercambio.jugador, "");
    assert.strictEqual(armado.programados[0].cancelado, true);
    assert.strictEqual(armado.sala.temporizador.estaActivo("oferta"), false);
  });

  it("se cancela si todos rechazan", () => {
    const armado = armarOfertaPublicada();

    responder(armado, ALAN, -1);
    responder(armado, LUIS, -1);

    assert.strictEqual(armado.partida.ofertaIntercambio.jugador, "");
    assert.strictEqual(armado.sala.temporizador.estaActivo("oferta"), false);
  });

  it("sigue corriendo si todavia falta alguien por responder", () => {
    const armado = armarOfertaPublicada();

    responder(armado, ALAN, -1);

    assert.strictEqual(armado.programados[0].cancelado, false);
    assert.strictEqual(armado.sala.temporizador.estaActivo("oferta"), true);
  });

  it("se cancela al pasar el turno", () => {
    const { sala } = armarOfertaPublicada();

    manejarPasarTurno(sala, armarCliente(ANGEL).client);

    assert.strictEqual(sala.temporizador.estaActivo("oferta"), false);
  });

  it("se cancela si sale de la partida quien hizo la oferta", () => {
    const { sala, partida } = armarOfertaPublicada();

    manejarSalida(sala, armarCliente(ANGEL).client);

    assert.strictEqual(partida.ofertaIntercambio.jugador, "");
    assert.strictEqual(sala.temporizador.estaActivo("oferta"), false);
  });

  it("sigue corriendo si sale alguien y todavia falta otro por responder", () => {
    const { sala, programados } = armarOfertaPublicada();

    manejarSalida(sala, armarCliente(LUIS).client);

    assert.strictEqual(programados[0].cancelado, false);
    assert.strictEqual(sala.temporizador.estaActivo("oferta"), true);
  });
});

describe("reloj de oferta al vencer", () => {

  it("toma como rechazo a quien no respondio y cierra la oferta", () => {
    const armado = armarOfertaPublicada();
    responder(armado, ALAN, -1);

    armado.vencer(0);

    assert.strictEqual(armado.partida.ofertaIntercambio.jugador, "");
    assert.strictEqual(armado.sala.temporizador.estaActivo("oferta"), false);
  });

  it("avisa en el registro que la oferta vencio", () => {
    const { difundidos, vencer } = armarOfertaPublicada();

    vencer(0);

    const avisos = difundidos.filter((envio) =>
      envio.tipo === "log" && JSON.stringify(envio.mensaje).includes("tiempo"));
    assert.strictEqual(avisos.length, 1);
  });

  it("deja proponer otra oferta", () => {
    const { sala, partida, vencer } = armarOfertaPublicada();
    vencer(0);
    const { client, enviados } = armarCliente(ANGEL);

    manejarOfrecerIntercambio(sala, client, OFERTA);

    assert.deepStrictEqual(enviados, []);
    assert.strictEqual(partida.ofertaIntercambio.jugador, ANGEL);
    assert.strictEqual(sala.temporizador.estaActivo("oferta"), true);
  });

  it("no hace nada si ya no hay una oferta activa", () => {
    const { sala, difundidos } = armarComercioConReloj();

    vencerOferta(sala);

    assert.strictEqual(difundidos.length, 0);
  });
});
