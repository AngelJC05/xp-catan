import { describe, it } from "mocha";
import assert from "node:assert";
import { NOMBRES_BOT } from "../../src/bots/nombresBot.js";
import { registrarBot } from "../../src/bots/registrarBot.js";
import { ColorJugador, FasePartida } from "../../src/common/enums.js";
import { manejarChat } from "../../src/rooms/handlers/chat/chat.js";
import { manejarElegirColor } from "../../src/rooms/handlers/partida/elegirColor.js";
import { armarSala } from "../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en el lobby con Angel como creador y Alan como segundo jugador
function armarLobby() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.creador = ANGEL;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  return armado;
}

describe("nombres de los bots", () => {

  it("hay al menos 10 nombres", () => {
    assert.ok(NOMBRES_BOT.length >= 10);
  });

  it("ningun nombre esta vacio ni repetido", () => {
    assert.ok(NOMBRES_BOT.every((nombre) => nombre.trim() !== ""));
    assert.strictEqual(new Set(NOMBRES_BOT).size, NOMBRES_BOT.length);
  });

});

describe("registrarBot", () => {

  it("crea un jugador marcado como bot en la sala", () => {
    const { sala, jugadores } = armarLobby();

    const cliente = registrarBot(sala);

    const bot = jugadores.get(cliente.sessionId);
    assert.ok(bot);
    assert.strictEqual(bot.esBot, true);
    assert.strictEqual(jugadores.size, 3);
  });

  it("los humanos no se marcan como bots", () => {
    const { sala, jugadores } = armarLobby();

    registrarBot(sala);

    assert.strictEqual(jugadores.get(ANGEL).esBot, false);
    assert.strictEqual(jugadores.get(ALAN).esBot, false);
  });

  it("el sessionId es bot-1, bot-2... en el orden en que se crean", () => {
    const { sala } = armarLobby();

    assert.strictEqual(registrarBot(sala).sessionId, "bot-1");
    assert.strictEqual(registrarBot(sala).sessionId, "bot-2");
    assert.strictEqual(registrarBot(sala).sessionId, "bot-3");
  });

  it("entra al final del orden de jugadores", () => {
    const { sala, partida } = armarLobby();

    const cliente = registrarBot(sala);

    assert.deepStrictEqual([...partida.ordenJugadores], [ANGEL, ALAN, cliente.sessionId]);
  });

  it("el creador sigue siendo el humano", () => {
    const { sala, partida } = armarLobby();

    registrarBot(sala);

    assert.strictEqual(partida.creador, ANGEL);
  });

  it("un bot nunca queda de creador, ni en una sala sin creador", () => {
    const { sala, partida } = armarSala();

    registrarBot(sala);

    assert.strictEqual(partida.creador, "");
  });

  it("el nombre sale de la lista de nombres", () => {
    const { sala, jugadores } = armarLobby();

    const cliente = registrarBot(sala);

    assert.ok(NOMBRES_BOT.includes(jugadores.get(cliente.sessionId).nombre));
  });

  it("los bots de una misma sala no repiten nombre", () => {
    const { sala, jugadores } = armarLobby();

    const ids = [registrarBot(sala), registrarBot(sala), registrarBot(sala)].map((c) => c.sessionId);
    const nombres = ids.map((id) => jugadores.get(id).nombre);

    assert.strictEqual(new Set(nombres).size, 3);
  });

  it("puede haber tantos bots como nombres sin que se repitan", () => {
    const { sala, jugadores } = armarSala();

    for (let i = 0; i < NOMBRES_BOT.length; i++) registrarBot(sala);

    const nombres = [...jugadores.values()].map((jugador) => jugador.nombre);
    assert.strictEqual(new Set(nombres).size, NOMBRES_BOT.length);
  });

});

describe("cliente falso del bot", () => {

  it("recibir un mensaje no hace nada ni falla", () => {
    const { sala } = armarLobby();
    const cliente = registrarBot(sala);

    assert.doesNotThrow(() => cliente.send("error", { mensajeError: "cualquier cosa" }));
  });

});

describe("un bot ejecutando handlers reales", () => {

  it("elige color como cualquier jugador", () => {
    const { sala, jugadores } = armarLobby();
    const cliente = registrarBot(sala);

    manejarElegirColor(sala, cliente, { color: ColorJugador.AMARILLO });

    assert.strictEqual(jugadores.get(cliente.sessionId).color, ColorJugador.AMARILLO);
  });

  it("no puede quedarse con un color que ya tiene un humano", () => {
    const { sala, jugadores } = armarLobby();
    const cliente = registrarBot(sala);
    jugadores.get(ANGEL).color = ColorJugador.AMARILLO;

    manejarElegirColor(sala, cliente, { color: ColorJugador.AMARILLO });

    assert.strictEqual(jugadores.get(cliente.sessionId).color, ColorJugador.SIN_COLOR);
  });

  it("si el handler lo rechaza, el bot no falla", () => {
    const { sala } = armarLobby();
    const cliente = registrarBot(sala);

    assert.doesNotThrow(() => manejarElegirColor(sala, cliente, { color: 999 }));
  });

  it("escribe en el chat con su nombre", () => {
    const { sala, partida, jugadores, difundidos } = armarLobby();
    const cliente = registrarBot(sala);
    partida.fase = FasePartida.JUEGO;

    manejarChat(sala, cliente, { mensaje: "hola" });

    assert.deepStrictEqual(difundidos, [
      { tipo: "chat", mensaje: { jugador: jugadores.get(cliente.sessionId).nombre, mensaje: "hola" } }
    ]);
  });

});
