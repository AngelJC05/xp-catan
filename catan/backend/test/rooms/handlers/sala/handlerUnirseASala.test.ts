import { describe, it } from "mocha";
import assert from "node:assert";
import { FasePartida } from "../../../../src/common/enums.js";
import { manejarUnirse } from "../../../../src/rooms/handlers/sala/unirseASala.js";
import { armarCliente, armarSala } from "../../../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

describe("handler de unirse a la sala", () => {

  it("rechaza si la partida ya comenzo", () => {
    const { sala, partida } = armarSala();
    const { client } = armarCliente(ANGEL);
    partida.fase = FasePartida.JUEGO;

    assert.throws(
      () => manejarUnirse(sala, client, { nombre: "Angel" }),
      { message: "La partida ya ha comenzado, no puedes unirte" }
    );
  });

  it("rechaza si la sala tiene codigo y no se manda ninguno", () => {
    const { sala } = armarSala();
    const { client } = armarCliente(ANGEL);
    sala.codigoAcceso = "1234";

    assert.throws(
      () => manejarUnirse(sala, client, { nombre: "Angel" }),
      { message: "Codigo de acceso incorrecto" }
    );
  });

  it("rechaza si el codigo de acceso es incorrecto", () => {
    const { sala } = armarSala();
    const { client } = armarCliente(ANGEL);
    sala.codigoAcceso = "1234";

    assert.throws(
      () => manejarUnirse(sala, client, { nombre: "Angel", codigoAcceso: "9999" }),
      { message: "Codigo de acceso incorrecto" }
    );
  });

  it("no registra al jugador cuando lo rechaza", () => {
    const { sala, partida, jugadores } = armarSala();
    const { client } = armarCliente(ANGEL);
    sala.codigoAcceso = "1234";

    assert.throws(() => manejarUnirse(sala, client, { nombre: "Angel" }));

    assert.strictEqual(jugadores.size, 0);
    assert.strictEqual(partida.ordenJugadores.length, 0);
    assert.strictEqual(partida.creador, "");
  });

  it("acepta a un jugador si el codigo de acceso es correcto", () => {
    const { sala, jugadores } = armarSala();
    const { client } = armarCliente(ANGEL);
    sala.codigoAcceso = "1234";

    manejarUnirse(sala, client, { nombre: "Angel", codigoAcceso: "1234" });

    assert.strictEqual(jugadores.get(ANGEL)?.nombre, "Angel");
  });

  it("acepta a cualquiera si la sala no tiene codigo", () => {
    const { sala, jugadores } = armarSala();
    const { client } = armarCliente(ANGEL);

    manejarUnirse(sala, client, { nombre: "Angel" });

    assert.strictEqual(jugadores.get(ANGEL)?.nombre, "Angel");
  });

  it("agrega al jugador al orden de jugadores", () => {
    const { sala, partida } = armarSala();

    manejarUnirse(sala, armarCliente(ANGEL).client, { nombre: "Angel" });
    manejarUnirse(sala, armarCliente(ALAN).client, { nombre: "Alan" });

    assert.deepStrictEqual([...partida.ordenJugadores], [ANGEL, ALAN]);
  });

  it("el primero en entrar es el creador y los demas no lo cambian", () => {
    const { sala, partida } = armarSala();

    manejarUnirse(sala, armarCliente(ANGEL).client, { nombre: "Angel" });
    manejarUnirse(sala, armarCliente(ALAN).client, { nombre: "Alan" });

    assert.strictEqual(partida.creador, ANGEL);
  });

  it("crea al jugador con el nombre recibido y valores iniciales", () => {
    const { sala, jugadores } = armarSala();

    manejarUnirse(sala, armarCliente(ANGEL).client, { nombre: "Angel" });

    const jugador = jugadores.get(ANGEL);
    assert.strictEqual(jugador?.nombre, "Angel");
    assert.strictEqual(jugador?.puntuacion, 0);
    assert.strictEqual(jugador?.puntosParaGanar, 10);
  });

  it("si no se manda nombre el jugador queda con nombre vacio", () => {
    const { sala, jugadores } = armarSala();

    manejarUnirse(sala, armarCliente(ANGEL).client, {});

    assert.strictEqual(jugadores.get(ANGEL)?.nombre, "");
  });

});
