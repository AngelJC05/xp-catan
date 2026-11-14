import { describe, it } from "mocha";
import assert from "node:assert";
import { FasePartida } from "../../../../src/common/enums.js";
import { manejarAgregarBot } from "../../../../src/rooms/handlers/bots/agregarBot.js";
import { armarCliente, armarSala } from "../../../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const LUIS = "jugadorLuis";
const MARIA = "jugadorMaria";

//? Funcion que devuelve una sala en el lobby con Angel como creador y Alan como segundo jugador
function armarLobby() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.creador = ANGEL;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  return armado;
}

//? Cuenta los bots que hay en la sala
function contarBots(jugadores: Iterable<{ esBot: boolean }>) {
  return [...jugadores].filter((jugador) => jugador.esBot).length;
}

describe("handler de agregar bot", () => {

  it("rechaza si quien lo pide no es el creador", () => {
    const { sala, jugadores } = armarLobby();
    const { client, enviados } = armarCliente(ALAN);

    manejarAgregarBot(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Solo el creador de la sala puede hacer esto" } }
    ]);
    assert.strictEqual(contarBots(jugadores.values()), 0);
  });

  it("rechaza si la partida ya comenzo", () => {
    const { sala, partida, jugadores } = armarLobby();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.JUEGO;

    manejarAgregarBot(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ya ha comenzado" } }
    ]);
    assert.strictEqual(contarBots(jugadores.values()), 0);
  });

  it("rechaza si la sala ya esta llena", () => {
    const { sala, partida, jugadores } = armarSala({
      [ANGEL]: "Angel", [ALAN]: "Alan", [LUIS]: "Luis", [MARIA]: "Maria"
    });
    partida.creador = ANGEL;
    const { client, enviados } = armarCliente(ANGEL);

    manejarAgregarBot(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La sala esta llena" } }
    ]);
    assert.strictEqual(jugadores.size, 4);
  });

  it("agrega un bot cuando el creador lo pide en el lobby", () => {
    const { sala, jugadores, partida } = armarLobby();
    const { client, enviados } = armarCliente(ANGEL);

    manejarAgregarBot(sala, client);

    assert.strictEqual(jugadores.size, 3);
    assert.strictEqual(contarBots(jugadores.values()), 1);
    assert.strictEqual(partida.ordenJugadores.length, 3);
    assert.strictEqual(enviados.length, 0);
  });

  it("el bot ocupa un lugar y queda registrado en la metadata", () => {
    const { sala } = armarLobby();
    const { client } = armarCliente(ANGEL);

    manejarAgregarBot(sala, client);

    assert.strictEqual(sala.maxClients, 3);
    assert.strictEqual((sala.metadata as { bots: number }).bots, 1);
  });

  it("se puede llenar la sala con bots pero no pasar del maximo", () => {
    const { sala, jugadores } = armarLobby();
    const { client, enviados } = armarCliente(ANGEL);

    manejarAgregarBot(sala, client);
    manejarAgregarBot(sala, client);
    assert.strictEqual(jugadores.size, 4);
    assert.strictEqual(enviados.length, 0);

    manejarAgregarBot(sala, client);

    assert.strictEqual(jugadores.size, 4);
    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La sala esta llena" } }
    ]);
  });

  it("no difunde nada, el cambio llega por el estado de la sala", () => {
    const { sala, difundidos } = armarLobby();
    const { client } = armarCliente(ANGEL);

    manejarAgregarBot(sala, client);

    assert.strictEqual(difundidos.length, 0);
  });

});
