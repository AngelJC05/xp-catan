import { describe, it } from "mocha";
import assert from "node:assert";
import { MapSchema } from "@colyseus/schema";
import type { Client } from "colyseus";
import type { CatanRoom } from "../src/rooms/CatanRoom.js";
import { Jugador } from "../src/schemas/Jugador.js";
import {
  enviarError,
  registrarLogDeJugador,
  registrarLogSistema
} from "../src/rooms/ayudantes/notificaciones.js";

const ANGEL = "jugadorAngel";

interface Envio {
  tipo: string;
  mensaje: unknown;
}

//? Funcion que devuelve un cliente falso que guarda todo lo que se le envia
function armarCliente() {
  const enviados: Envio[] = [];
  const client = {
    send: (tipo: string, mensaje: unknown) => enviados.push({ tipo, mensaje })
  } as unknown as Client;
  return { client, enviados };
}

//? Funcion que devuelve una sala falsa con Angel como jugador y que guarda todo lo que se difunde
function armarSala() {
  const difundidos: Envio[] = [];
  const jugadores = new MapSchema<Jugador>();
  jugadores.set(ANGEL, new Jugador("Angel"));
  const sala = {
    jugadores,
    broadcast: (tipo: string, mensaje: unknown) => difundidos.push({ tipo, mensaje })
  } as unknown as CatanRoom;
  return { sala, difundidos };
}

describe("notificaciones de la sala", () => {

  it("enviarError manda un mensaje de error al cliente", () => {
    const { client, enviados } = armarCliente();

    enviarError(client, "No es tu turno");

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es tu turno" } }
    ]);
  });

  it("registrarLogDeJugador difunde el log con el nombre del jugador", () => {
    const { sala, difundidos } = armarSala();

    registrarLogDeJugador(sala, ANGEL, " ha pasado su turno");

    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha pasado su turno" } }
    ]);
  });

  it("registrarLogSistema difunde el log a nombre del sistema", () => {
    const { sala, difundidos } = armarSala();

    registrarLogSistema(sala, "Todos los jugadores han terminado de descartar");

    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Sistema: ", mensaje: "Todos los jugadores han terminado de descartar" } }
    ]);
  });

});
