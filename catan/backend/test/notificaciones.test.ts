import { describe, it } from "mocha";
import assert from "node:assert";
import {
  enviarError,
  registrarLogDeJugador,
  registrarLogSistema
} from "../src/rooms/ayudantes/notificaciones.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";

describe("notificaciones de la sala", () => {

  it("enviarError manda un mensaje de error al cliente", () => {
    const { client, enviados } = armarCliente();

    enviarError(client, "No es tu turno");

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es tu turno" } }
    ]);
  });

  it("registrarLogDeJugador difunde el log con el nombre del jugador", () => {
    const { sala, difundidos } = armarSala({ [ANGEL]: "Angel" });

    registrarLogDeJugador(sala, ANGEL, " ha pasado su turno");

    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha pasado su turno" } }
    ]);
  });

  it("registrarLogSistema difunde el log a nombre del sistema", () => {
    const { sala, difundidos } = armarSala({ [ANGEL]: "Angel" });

    registrarLogSistema(sala, "Todos los jugadores han terminado de descartar");

    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Sistema: ", mensaje: "Todos los jugadores han terminado de descartar" } }
    ]);
  });

});
