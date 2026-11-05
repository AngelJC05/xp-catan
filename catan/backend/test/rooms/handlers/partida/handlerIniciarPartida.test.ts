import { describe, it } from "mocha";
import assert from "node:assert";
import { ColorJugador, FasePartida } from "../../../../src/common/enums.js";
import { manejarIniciarPartida } from "../../../../src/rooms/handlers/partida/iniciarPartida.js";
import { Temporizador } from "../../../../src/timers/Temporizador.js";
import { PUNTOS_POR_DEFECTO } from "../../../../src/rooms/configuracion/puntosParaGanar.js";
import { TIEMPOS_POR_DEFECTO } from "../../../../src/timers/tiempos.js";
import { armarReloj } from "../../../ayudas/relojFalso.js";
import { armarCliente, armarSala } from "../../../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en el lobby con Angel como creador y Alan como segundo jugador
function armarLobby() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.creador = ANGEL;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  return armado;
}

describe("handler de iniciar partida", () => {

  it("rechaza si quien lo pide no es el creador", () => {
    const { sala, partida } = armarLobby();
    const { client, enviados } = armarCliente(ALAN);

    manejarIniciarPartida(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Solo el creador de la sala puede hacer esto" } }
    ]);
    assert.strictEqual(partida.fase, FasePartida.LOBBY);
  });

  it("rechaza si la partida ya comenzo", () => {
    const { sala, partida } = armarLobby();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.JUEGO;

    manejarIniciarPartida(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ya ha comenzado" } }
    ]);
  });

  it("rechaza si hay menos de 2 jugadores", () => {
    const { sala, partida } = armarSala({ [ANGEL]: "Angel" });
    const { client, enviados } = armarCliente(ANGEL);
    partida.creador = ANGEL;
    partida.ordenJugadores.push(ANGEL);

    manejarIniciarPartida(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Se necesitan al menos 2 jugadores para iniciar la partida" } }
    ]);
    assert.strictEqual(partida.fase, FasePartida.LOBBY);
  });

  it("nadie debe quedar sin color al iniciar la partida", () => {
    const { sala, partida } = armarLobby();
    const { client } = armarCliente(ANGEL);

    manejarIniciarPartida(sala, client);
    assert.notStrictEqual(sala.jugadores.get(ANGEL).color, ColorJugador.SIN_COLOR);
    assert.notStrictEqual(sala.jugadores.get(ALAN).color, ColorJugador.SIN_COLOR);
  })

  it("pasa la partida a preconstruccion", () => {
    const { sala, partida } = armarLobby();
    const { client } = armarCliente(ANGEL);

    manejarIniciarPartida(sala, client);

    assert.strictEqual(partida.fase, FasePartida.PRECONSTRUCCION);
  });

  it("da el primer turno al primer jugador del orden mezclado", () => {
    const { sala, partida } = armarLobby();
    const { client } = armarCliente(ANGEL);

    manejarIniciarPartida(sala, client);

    assert.strictEqual(partida.turnoActual, partida.ordenJugadores[0]);
    assert.deepStrictEqual([...partida.ordenJugadores].sort(), [ALAN, ANGEL].sort());
  });

  it("avisa a toda la sala que la partida comenzo", () => {
    const { sala, difundidos } = armarLobby();
    const { client } = armarCliente(ANGEL);

    manejarIniciarPartida(sala, client);

    assert.deepStrictEqual(difundidos, [
      { tipo: "inicio", mensaje: { mensaje: "La partida ha comenzado" } }
    ]);
  });

  it("marca la sala en juego conservando el resto de su informacion y la bloquea", () => {
    const { sala, estado } = armarLobby();
    const { client } = armarCliente(ANGEL);
    sala.metadata = { alias: "Sala de prueba", estado: "EN LOBBY" };

    manejarIniciarPartida(sala, client);

    assert.deepStrictEqual(sala.metadata, { alias: "Sala de prueba", estado: "EN JUEGO" });
    assert.strictEqual(estado.bloqueada, true);
  });

});

describe("configuracion al iniciar la partida", () => {

  it("pasa los tiempos de la configuracion a la sala", () => {
    const { sala, partida } = armarLobby();
    const { client } = armarCliente(ANGEL);
    Object.assign(partida.configuracion, {
      preconstruccion: 60, dados: 15, acciones: 120, oferta: 20, ladron: 20, robo: 20, descarte: 15
    });

    manejarIniciarPartida(sala, client);

    assert.deepStrictEqual(sala.tiempos, {
      preconstruccion: 60, dados: 15, acciones: 120, oferta: 20, ladron: 20, robo: 20, descarte: 15
    });
  });

  it("deja a cada jugador con los puntos para ganar de la configuracion", () => {
    const { sala, partida, jugadores } = armarLobby();
    const { client } = armarCliente(ANGEL);
    partida.configuracion.puntos = 7;

    manejarIniciarPartida(sala, client);

    assert.strictEqual(jugadores.get(ANGEL).puntosParaGanar, 7);
    assert.strictEqual(jugadores.get(ALAN).puntosParaGanar, 7);
  });

  it("si el creador no configuro nada quedan los valores por defecto", () => {
    const { sala, jugadores } = armarLobby();
    const { client } = armarCliente(ANGEL);

    manejarIniciarPartida(sala, client);

    assert.deepStrictEqual(sala.tiempos, TIEMPOS_POR_DEFECTO);
    assert.strictEqual(jugadores.get(ANGEL).puntosParaGanar, PUNTOS_POR_DEFECTO);
  });

  it("no cambia nada de la sala si no se pudo iniciar la partida", () => {
    const { sala, partida, jugadores } = armarLobby();
    const { client } = armarCliente(ALAN);
    Object.assign(partida.configuracion, { acciones: 120, puntos: 7 });

    manejarIniciarPartida(sala, client);

    assert.strictEqual(sala.tiempos.acciones, TIEMPOS_POR_DEFECTO.acciones);
    assert.strictEqual(jugadores.get(ANGEL).puntosParaGanar, PUNTOS_POR_DEFECTO);
  });

});

describe("reloj al iniciar la partida", () => {

  //? Funcion que devuelve el lobby con el temporizador real que usa el reloj falso
  function armarLobbyConReloj() {
    const armado = armarLobby();
    const { reloj, programados } = armarReloj();
    Object.assign(armado.sala, {
      temporizador: new Temporizador(reloj),
      tiempos: { ...TIEMPOS_POR_DEFECTO }
    });
    return { ...armado, programados };
  }

  it("arranca el reloj de la preconstruccion", () => {
    const { sala, programados } = armarLobbyConReloj();
    const { client } = armarCliente(ANGEL);

    manejarIniciarPartida(sala, client);

    assert.strictEqual(programados.length, 1);
    assert.strictEqual(programados[0].milisegundos, TIEMPOS_POR_DEFECTO.preconstruccion * 1000);
    assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), true);
  });

  it("el reloj de la preconstruccion usa el tiempo configurado", () => {
    const { sala, partida, programados } = armarLobbyConReloj();
    const { client } = armarCliente(ANGEL);
    partida.configuracion.preconstruccion = 60;

    manejarIniciarPartida(sala, client);

    assert.strictEqual(programados[0].milisegundos, 60 * 1000);
  });

  it("no arranca el reloj si no se pudo iniciar la partida", () => {
    const { sala, programados } = armarLobbyConReloj();
    const { client } = armarCliente(ALAN);

    manejarIniciarPartida(sala, client);

    assert.strictEqual(programados.length, 0);
  });

});
