import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida } from "../src/common/enums.js";
import { manejarLanzarDados } from "../src/rooms/handlers/dados/lanzarDados.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en juego, en la fase de dados y con el turno de Angel
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.DADOS;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;
  return armado;
}

describe("handler de lanzar dados", () => {

  it("rechaza si la partida ya finalizo", () => {
    const { sala, partida, difundidos } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.FINALIZADA;

    manejarLanzarDados(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "La partida ha finalizado" } }
    ]);
    assert.strictEqual(difundidos.length, 0);
  });

  it("rechaza si no es su turno", () => {
    const { sala, difundidos } = armarJuego();
    const { client, enviados } = armarCliente(ALAN);

    manejarLanzarDados(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es tu turno" } }
    ]);
    assert.strictEqual(difundidos.length, 0);
  });

  it("rechaza si aun no es la fase de juego", () => {
    const { sala, partida } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.fase = FasePartida.PRECONSTRUCCION;

    manejarLanzarDados(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "No es la fase de juego" } }
    ]);
  });

  it("rechaza si ya lanzo los dados", () => {
    const { sala, partida, difundidos } = armarJuego();
    const { client, enviados } = armarCliente(ANGEL);
    partida.faseJuego = FaseJuego.ACCIONES;

    manejarLanzarDados(sala, client);

    assert.deepStrictEqual(enviados, [
      { tipo: "error", mensaje: { mensajeError: "Ya lanzaste los dados" } }
    ]);
    assert.strictEqual(difundidos.length, 0);
  });

  it("tira dos dados validos y avisa a todos el resultado", () => {
    const { sala, difundidos } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarLanzarDados(sala, client);

    const dados = difundidos.filter((envio) => envio.tipo === "dados");
    assert.strictEqual(dados.length, 1);

    const { dado1, dado2, suma } = dados[0].mensaje as { dado1: number, dado2: number, suma: number };
    assert.ok(dado1 >= 1 && dado1 <= 6);
    assert.ok(dado2 >= 1 && dado2 <= 6);
    assert.strictEqual(suma, dado1 + dado2);
  });

  it("deja la fase de dados despues de tirar", () => {
    const { sala, partida } = armarJuego();
    const { client } = armarCliente(ANGEL);

    manejarLanzarDados(sala, client);

    assert.notStrictEqual(partida.faseJuego, FaseJuego.DADOS);
  });

});
