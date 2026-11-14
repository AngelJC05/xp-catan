import { describe, it } from "mocha";
import assert from "node:assert";
import { quitarBot } from "../../src/bots/quitarBot.js";
import { registrarBot } from "../../src/bots/registrarBot.js";
import { armarSala } from "../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en el lobby con Angel como creador y Alan como segundo jugador
function armarLobby() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.creador = ANGEL;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.sala.metadata = { alias: "Sala", anfitrion: "Angel" };
  return armado;
}

describe("quitarBot", () => {

  it("saca al bot de los jugadores y del orden", () => {
    const { sala, partida, jugadores } = armarLobby();
    const { sessionId } = registrarBot(sala);

    const resultado = quitarBot(sala, sessionId);

    assert.strictEqual(resultado.error, false);
    assert.strictEqual(jugadores.has(sessionId), false);
    assert.deepStrictEqual([...partida.ordenJugadores], [ANGEL, ALAN]);
  });

  it("solo quita al bot que se pidio", () => {
    const { sala, jugadores } = armarLobby();
    const primero = registrarBot(sala).sessionId;
    const segundo = registrarBot(sala).sessionId;

    quitarBot(sala, primero);

    assert.strictEqual(jugadores.has(primero), false);
    assert.strictEqual(jugadores.has(segundo), true);
  });

  it("rechaza si el jugador no existe", () => {
    const { sala } = armarLobby();

    const resultado = quitarBot(sala, "bot-9");

    assert.deepStrictEqual(resultado, { error: true, mensaje: "No se encontro al bot" });
  });

  it("rechaza quitar a un humano y no lo saca", () => {
    const { sala, jugadores, partida } = armarLobby();

    const resultado = quitarBot(sala, ALAN);

    assert.deepStrictEqual(resultado, { error: true, mensaje: "Solo se pueden quitar bots" });
    assert.strictEqual(jugadores.has(ALAN), true);
    assert.deepStrictEqual([...partida.ordenJugadores], [ANGEL, ALAN]);
  });

  it("libera el lugar que ocupaba en la sala", () => {
    const { sala } = armarLobby();
    const { sessionId } = registrarBot(sala);
    assert.strictEqual(sala.maxClients, 3);

    quitarBot(sala, sessionId);

    assert.strictEqual(sala.maxClients, 4);
  });

  it("no libera ningun lugar si no se quito nada", () => {
    const { sala } = armarLobby();
    registrarBot(sala);

    quitarBot(sala, ALAN);
    quitarBot(sala, "bot-9");

    assert.strictEqual(sala.maxClients, 3);
  });

  it("actualiza en la metadata cuantos bots quedan", () => {
    const { sala } = armarLobby();
    registrarBot(sala);
    const { sessionId } = registrarBot(sala);
    assert.deepStrictEqual(sala.metadata, { alias: "Sala", anfitrion: "Angel", bots: 2 });

    quitarBot(sala, sessionId);

    assert.deepStrictEqual(sala.metadata, { alias: "Sala", anfitrion: "Angel", bots: 1 });
  });

});
