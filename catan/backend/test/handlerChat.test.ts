import { describe, it } from "mocha";
import assert from "node:assert";
import { FasePartida } from "../src/common/enums.js";
import { manejarChat } from "../src/rooms/handlers/chat/chat.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";

describe("handler de chat", () => {

  it("difunde el mensaje a toda la sala con el nombre del jugador", () => {
    const { sala, difundidos } = armarSala({ [ANGEL]: "Angel" });
    const { client } = armarCliente(ANGEL);

    manejarChat(sala, client, { mensaje: "Hola Alan" });

    assert.deepStrictEqual(difundidos, [
      { tipo: "chat", mensaje: { jugador: "Angel", mensaje: "Hola Alan" } }
    ]);
  });

  it("ignora un mensaje vacio", () => {
    const { sala, difundidos } = armarSala({ [ANGEL]: "Angel" });
    const { client, enviados } = armarCliente(ANGEL);

    manejarChat(sala, client, { mensaje: "" });

    assert.deepStrictEqual(difundidos, []);
    assert.deepStrictEqual(enviados, []);
  });

  it("ignora un mensaje con solo espacios", () => {
    const { sala, difundidos } = armarSala({ [ANGEL]: "Angel" });
    const { client } = armarCliente(ANGEL);

    manejarChat(sala, client, { mensaje: "   " });

    assert.deepStrictEqual(difundidos, []);
  });

  it("rechaza el mensaje si la partida ya finalizo", () => {
    const { sala, partida, difundidos } = armarSala({ [ANGEL]: "Angel" });
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.FINALIZADA;

    manejarChat(sala, client, { mensaje: "Hola Alan" });

    assert.deepStrictEqual(difundidos, []);
    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ha finalizado" } }
    ]);
  });

});
