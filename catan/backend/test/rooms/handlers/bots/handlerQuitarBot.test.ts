import { describe, it } from "mocha";
import assert from "node:assert";
import { registrarBot } from "../../../../src/bots/registrarBot.js";
import { FasePartida } from "../../../../src/common/enums.js";
import { manejarQuitarBot } from "../../../../src/rooms/handlers/bots/quitarBot.js";
import { armarCliente, armarSala } from "../../../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en el lobby con Angel como creador, Alan y un bot
function armarLobbyConBot() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.creador = ANGEL;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  const bot = registrarBot(armado.sala);
  return { ...armado, bot: bot.sessionId };
}

describe("handler de quitar bot", () => {

  it("rechaza si quien lo pide no es el creador", () => {
    const { sala, jugadores, bot } = armarLobbyConBot();
    const { client, enviados } = armarCliente(ALAN);

    manejarQuitarBot(sala, client, { sessionId: bot });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Solo el creador de la sala puede hacer esto" } }
    ]);
    assert.strictEqual(jugadores.has(bot), true);
  });

  it("rechaza si la partida ya comenzo", () => {
    const { sala, partida, jugadores, bot } = armarLobbyConBot();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.JUEGO;

    manejarQuitarBot(sala, client, { sessionId: bot });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ya ha comenzado" } }
    ]);
    assert.strictEqual(jugadores.has(bot), true);
  });

  it("rechaza si el bot no existe", () => {
    const { sala } = armarLobbyConBot();
    const { client, enviados } = armarCliente(ANGEL);

    manejarQuitarBot(sala, client, { sessionId: "bot-9" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No se encontro al bot" } }
    ]);
  });

  it("rechaza si no llega el sessionId", () => {
    const { sala } = armarLobbyConBot();
    const { client, enviados } = armarCliente(ANGEL);

    manejarQuitarBot(sala, client, {} as { sessionId: string });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No se encontro al bot" } }
    ]);
  });

  it("nunca saca a un humano", () => {
    const { sala, jugadores } = armarLobbyConBot();
    const { client, enviados } = armarCliente(ANGEL);

    manejarQuitarBot(sala, client, { sessionId: ALAN });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Solo se pueden quitar bots" } }
    ]);
    assert.strictEqual(jugadores.has(ALAN), true);
  });

  it("el creador no puede sacarse a si mismo con este mensaje", () => {
    const { sala, jugadores } = armarLobbyConBot();
    const { client } = armarCliente(ANGEL);

    manejarQuitarBot(sala, client, { sessionId: ANGEL });

    assert.strictEqual(jugadores.has(ANGEL), true);
  });

  it("saca al bot, libera su lugar y actualiza la metadata", () => {
    const { sala, jugadores, partida, bot } = armarLobbyConBot();
    const { client, enviados } = armarCliente(ANGEL);
    assert.strictEqual(sala.maxClients, 3);

    manejarQuitarBot(sala, client, { sessionId: bot });

    assert.strictEqual(jugadores.has(bot), false);
    assert.deepStrictEqual([...partida.ordenJugadores], [ANGEL, ALAN]);
    assert.strictEqual(sala.maxClients, 4);
    assert.strictEqual((sala.metadata as { bots: number }).bots, 0);
    assert.strictEqual(enviados.length, 0);
  });

});
