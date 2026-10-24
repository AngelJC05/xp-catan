import { describe, it } from "mocha";
import assert from "node:assert";
import { Desarrollo, FaseJuego, FasePartida } from "../src/common/enums.js";
import { manejarCartaAbundancia } from "../src/rooms/handlers/cartas/cartaAbundancia.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const ABUNDANCIA = `${Desarrollo.ABUNDANCIA}`;

//? Funcion que devuelve una sala en juego, en fase de acciones, con el turno de Angel, que tiene una carta de abundancia lista para usar
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;
  armado.partida.cartaJugable = true;
  armado.jugadores.get(ANGEL).cartas_usables.set(ABUNDANCIA, 1);
  return armado;
}

describe("handler de la carta de abundancia", () => {

  it("rechaza si la partida ya finalizo", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.FINALIZADA;

    manejarCartaAbundancia(sala, client, { recurso1: "madera", recurso2: "trigo" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ha finalizado" } }
    ]);
  });

  it("rechaza si no es su turno", () => {
    const { sala } = armarJuego();
    const { client, enviados } = armarCliente(ALAN);

    manejarCartaAbundancia(sala, client, { recurso1: "madera", recurso2: "trigo" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es tu turno" } }
    ]);
  });

  it("rechaza si aun no se lanzaron los dados", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.DADOS;

    manejarCartaAbundancia(sala, client, { recurso1: "madera", recurso2: "trigo" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Debes lanzar los dados primero" } }
    ]);
  });

  it("rechaza si ya uso una carta este turno", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.cartaJugable = false;

    manejarCartaAbundancia(sala, client, { recurso1: "madera", recurso2: "trigo" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Solo una carta por turno" } }
    ]);
  });

  it("rechaza si no tiene la carta de abundancia", () => {
    const { sala, jugadores } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    jugadores.get(ANGEL).cartas_usables.set(ABUNDANCIA, 0);

    manejarCartaAbundancia(sala, client, { recurso1: "madera", recurso2: "trigo" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No tienes la carta de abundancia" } }
    ]);
  });

  it("avisa si los recursos no son validos y no gasta la carta", () => {
    const { sala, partida, jugadores, difundidos } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);

    manejarCartaAbundancia(sala, client, { recurso1: "oro", recurso2: "plata" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Los recursos no son validos" } }
    ]);
    assert.strictEqual(jugadores.get(ANGEL).cartas_usables.get(ABUNDANCIA), 1);
    assert.strictEqual(partida.cartaJugable, true);
    assert.strictEqual(difundidos.length, 0);
  });

  it("avisa si solo el primer recurso es invalido y no crea claves nuevas", () => {
    const { sala, partida, jugadores, banca, difundidos } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);

    manejarCartaAbundancia(sala, client, { recurso1: "oro", recurso2: "madera" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Los recursos no son validos" } }
    ]);
    assert.strictEqual(jugadores.get(ANGEL).recursos.has("oro"), false);
    assert.strictEqual(banca.recursos.has("oro"), false);
    assert.strictEqual(jugadores.get(ANGEL).cartas_usables.get(ABUNDANCIA), 1);
    assert.strictEqual(partida.cartaJugable, true);
    assert.strictEqual(difundidos.length, 0);
  });

  it("avisa si solo el segundo recurso es invalido y no crea claves nuevas", () => {
    const { sala, partida, jugadores, banca, difundidos } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);

    manejarCartaAbundancia(sala, client, { recurso1: "madera", recurso2: "oro" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Los recursos no son validos" } }
    ]);
    assert.strictEqual(jugadores.get(ANGEL).recursos.has("oro"), false);
    assert.strictEqual(banca.recursos.has("oro"), false);
    assert.strictEqual(jugadores.get(ANGEL).cartas_usables.get(ABUNDANCIA), 1);
    assert.strictEqual(partida.cartaJugable, true);
    assert.strictEqual(difundidos.length, 0);
  });

  it("avisa si la banca no tiene los dos recursos pedidos", () => {
    const { sala, banca } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    banca.recursos.set("trigo", 0);

    manejarCartaAbundancia(sala, client, { recurso1: "madera", recurso2: "trigo" });

    assert.strictEqual(enviados.length, 1);
    assert.strictEqual(enviados[0].tipo, "error");
  });

  it("avisa si pide dos del mismo recurso y la banca solo tiene uno", () => {
    const { sala, banca } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    banca.recursos.set("madera", 1);

    manejarCartaAbundancia(sala, client, { recurso1: "madera", recurso2: "madera" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La banca no tiene suficientes recursos" } }
    ]);
  });

  it("da los dos recursos elegidos al jugador y se los quita a la banca", () => {
    const { sala, jugadores, banca } = armarJuego();
    const { client } = armarCliente(ANGEL);
    const maderaEnBanca = banca.recursos.get("madera");
    const trigoEnBanca = banca.recursos.get("trigo");

    manejarCartaAbundancia(sala, client, { recurso1: "madera", recurso2: "trigo" });

    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 1);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("trigo"), 1);
    assert.strictEqual(banca.recursos.get("madera"), maderaEnBanca - 1);
    assert.strictEqual(banca.recursos.get("trigo"), trigoEnBanca - 1);
  });

  it("permite pedir dos del mismo recurso", () => {
    const { sala, jugadores } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCartaAbundancia(sala, client, { recurso1: "mineral", recurso2: "mineral" });

    assert.strictEqual(jugadores.get(ANGEL).recursos.get("mineral"), 2);
  });

  it("gasta la carta y bloquea otra carta este turno", () => {
    const { sala, partida, jugadores } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCartaAbundancia(sala, client, { recurso1: "madera", recurso2: "trigo" });

    assert.strictEqual(jugadores.get(ANGEL).cartas_usables.get(ABUNDANCIA), 0);
    assert.strictEqual(partida.cartaJugable, false);
  });

  it("avisa en el log que el jugador uso la carta de abundancia", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarCartaAbundancia(sala, client, { recurso1: "madera", recurso2: "trigo" });

    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha usado la carta de abundancia" } }
    ]);
  });

});
