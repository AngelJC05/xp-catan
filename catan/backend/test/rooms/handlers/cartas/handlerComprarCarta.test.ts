import { describe, it } from "mocha";
import assert from "node:assert";
import { Desarrollo, FaseJuego, FasePartida } from "../../../../src/common/enums.js";
import { manejarComprarCarta } from "../../../../src/rooms/handlers/cartas/comprarCarta.js";
import { armarCliente, armarSala } from "../../../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en juego, en fase de acciones, con el turno de Angel
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;

  const angel = armado.jugadores.get(ANGEL);
  ["trigo", "lana", "mineral"].forEach((recurso) => angel.recursos.set(recurso, 1));

  armado.banca.cartas.clear();
  armado.banca.cartas.push(Desarrollo.CABALLERO);
  return armado;
}

describe("handler de comprar carta", () => {

  it("rechaza si la partida ya finalizo", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.FINALIZADA;

    manejarComprarCarta(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ha finalizado" } }
    ]);
  });

  it("rechaza si no es su turno", () => {
    const { sala } = armarJuego();
    const { client, enviados } = armarCliente(ALAN);

    manejarComprarCarta(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es tu turno" } }
    ]);
  });

  it("rechaza si aun no se lanzaron los dados", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.DADOS;

    manejarComprarCarta(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Debes lanzar los dados primero" } }
    ]);
  });

  it("avisa si la banca no tiene cartas", () => {
    const { sala, banca } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    banca.cartas.clear();

    manejarComprarCarta(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La banca no tiene cartas disponibles" } }
    ]);
  });

  it("avisa si no tiene recursos suficientes y no escribe en el log", () => {
    const { sala, jugadores, difundidos } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    jugadores.get(ANGEL).recursos.set("mineral", 0);

    manejarComprarCarta(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No tienes recursos suficientes para comprar una carta" } }
    ]);
    assert.strictEqual(difundidos.length, 0);
  });

  it("le da la carta al jugador como todavia no usable y la saca de la banca", () => {
    const { sala, jugadores, banca } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarComprarCarta(sala, client);

    assert.strictEqual(jugadores.get(ANGEL).cartas_inusables.get(`${Desarrollo.CABALLERO}`), 1);
    assert.strictEqual(banca.cartas.length, 0);
  });

  it("cobra trigo, lana y mineral y los manda a la banca", () => {
    const { sala, jugadores, banca } = armarJuego();
    const { client } = armarCliente(ANGEL);
    const enBancaAntes = banca.recursos.get("trigo");

    manejarComprarCarta(sala, client);

    assert.strictEqual(jugadores.get(ANGEL).recursos.get("trigo"), 0);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("lana"), 0);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("mineral"), 0);
    assert.strictEqual(banca.recursos.get("trigo"), enBancaAntes + 1);
  });

  it("avisa en el log que el jugador compro una carta", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarComprarCarta(sala, client);

    assert.deepStrictEqual(difundidos.filter((envio) => envio.tipo === "log"), [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha comprado una carta de desarrollo" } }
    ]);
  });

  it("avisa a todos que suene la compra de la carta", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarComprarCarta(sala, client);

    assert.deepStrictEqual(difundidos.filter((envio) => envio.tipo === "sonido"), [
      { tipo: "sonido", mensaje: { nombre: "comprarCarta" } }
    ]);
  });

  it("una carta de puntos de victoria acerca al jugador a ganar", () => {
    const { sala, jugadores, banca } = armarJuego();
    const { client } = armarCliente(ANGEL);
    banca.cartas.clear();
    banca.cartas.push(Desarrollo.PUNTOS_VICTORIA);

    manejarComprarCarta(sala, client);

    assert.strictEqual(jugadores.get(ANGEL).puntosParaGanar, 9);
  });

  it("termina la partida si la carta da el ultimo punto", () => {
    const { sala, partida, jugadores, banca } = armarJuego();
    const { client } = armarCliente(ANGEL);
    banca.cartas.clear();
    banca.cartas.push(Desarrollo.PUNTOS_VICTORIA);
    jugadores.get(ANGEL).puntosParaGanar = 1;

    manejarComprarCarta(sala, client);

    assert.strictEqual(partida.fase, FasePartida.FINALIZADA);
    assert.strictEqual(partida.ganador, ANGEL);
  });

});
