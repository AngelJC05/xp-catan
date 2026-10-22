import { describe, it } from "mocha";
import assert from "node:assert";
import { ColorJugador, FasePartida } from "../src/common/enums.js";
import { manejarIniciarPartida } from "../src/rooms/handlers/partida/iniciarPartida.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

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
