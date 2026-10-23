import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida, TipoPuerto } from "../src/common/enums.js";
import { manejarIntercambiarBanca } from "../src/rooms/handlers/comercio/intercambiarBanca.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en juego, en fase de acciones, con el turno de Angel y 4 de madera en su mano
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;
  armado.jugadores.get(ANGEL).recursos.set("madera", 4);
  return armado;
}

describe("handler de intercambiar con la banca", () => {

  it("rechaza si la partida ya finalizo", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.FINALIZADA;

    manejarIntercambiarBanca(sala, client, { recursoEntregado: "madera", recursoRecibido: "lana" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ha finalizado" } }
    ]);
  });

  it("rechaza si no es su turno", () => {
    const { sala } = armarJuego();
    const { client, enviados } = armarCliente(ALAN);

    manejarIntercambiarBanca(sala, client, { recursoEntregado: "madera", recursoRecibido: "lana" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es tu turno" } }
    ]);
  });

  it("rechaza si aun no se lanzaron los dados", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.DADOS;

    manejarIntercambiarBanca(sala, client, { recursoEntregado: "madera", recursoRecibido: "lana" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Debes lanzar los dados primero" } }
    ]);
  });

  it("avisa si los recursos no son validos", () => {
    const { sala } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);

    manejarIntercambiarBanca(sala, client, { recursoEntregado: "oro", recursoRecibido: "lana" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Los recursos seleccionados no son validos" } }
    ]);
  });

  it("avisa si intenta intercambiar el mismo recurso", () => {
    const { sala } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);

    manejarIntercambiarBanca(sala, client, { recursoEntregado: "madera", recursoRecibido: "madera" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No puedes intercambiar el mismo recurso" } }
    ]);
  });

  it("avisa si no tiene los recursos que pide la tasa", () => {
    const { sala, jugadores } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    jugadores.get(ANGEL).recursos.set("madera", 3);

    manejarIntercambiarBanca(sala, client, { recursoEntregado: "madera", recursoRecibido: "lana" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Necesitas al menos 4 para intercambiar" } }
    ]);
  });

  it("avisa si la banca no tiene el recurso pedido", () => {
    const { sala, banca } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    banca.recursos.set("lana", 0);

    manejarIntercambiarBanca(sala, client, { recursoEntregado: "madera", recursoRecibido: "lana" });

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La banca no tiene lana" } }
    ]);
  });

  it("sin puerto cambia cuatro del recurso entregado por uno del recibido", () => {
    const { sala, jugadores, banca } = armarJuego();
    const { client } = armarCliente(ANGEL);
    const maderaEnBanca = banca.recursos.get("madera");
    const lanaEnBanca = banca.recursos.get("lana");

    manejarIntercambiarBanca(sala, client, { recursoEntregado: "madera", recursoRecibido: "lana" });

    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 0);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("lana"), 1);
    assert.strictEqual(banca.recursos.get("madera"), maderaEnBanca + 4);
    assert.strictEqual(banca.recursos.get("lana"), lanaEnBanca - 1);
  });

  it("con un puerto generico solo cuesta tres", () => {
    const { sala, jugadores, tablero } = armarJuego();
    const { client } = armarCliente(ANGEL);
    for (const puerto of tablero.puertos.values()) {
      if (puerto.tipo === TipoPuerto.GENERICO) {
        tablero.vertices.get(puerto.vertice1).setPropietario(ANGEL);
        break;
      }
    }

    manejarIntercambiarBanca(sala, client, { recursoEntregado: "madera", recursoRecibido: "lana" });

    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 1);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("lana"), 1);
  });

  it("avisa en el log el intercambio y no escribe nada si falla", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarIntercambiarBanca(sala, client, { recursoEntregado: "madera", recursoRecibido: "madera" });
    assert.strictEqual(difundidos.length, 0);

    manejarIntercambiarBanca(sala, client, { recursoEntregado: "madera", recursoRecibido: "lana" });
    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha realizado un intecambio con la banca" } }
    ]);
  });

});
