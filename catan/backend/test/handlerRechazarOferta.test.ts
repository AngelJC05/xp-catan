import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida } from "../src/common/enums.js";
import { rechazarOferta } from "../src/rooms/handlers/comercio/rechazarOferta.js";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const LUIS = "jugadorLuis";

//? Funcion que devuelve una sala con una oferta activa de Angel que Alan y Luis todavia no responden
function armarOferta() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan", [LUIS]: "Luis" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.ordenJugadores.push(ANGEL, ALAN, LUIS);
  armado.partida.turnoActual = ANGEL;
  armado.partida.ofertaIntercambio.setOfertaMixta(
    ANGEL, armado.jugadores, { madera: 1 }, { trigo: 1 }
  );
  return armado;
}

describe("rechazar una oferta de intercambio", () => {

  it("registra el rechazo del jugador", () => {
    const { sala, partida } = armarOferta();
    const { client } = armarCliente(ALAN);

    rechazarOferta(sala, client);

    assert.strictEqual(partida.ofertaIntercambio.respuestas.get(ALAN), -1);
    assert.strictEqual(partida.ofertaIntercambio.respuestas.get(LUIS), 0);
  });

  it("avisa en el log que el jugador rechazo la oferta", () => {
    const { sala, difundidos } = armarOferta();
    const { client } = armarCliente(ALAN);

    rechazarOferta(sala, client);

    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Alan", mensaje: " ha rechazado la oferta de intercambio" } }
    ]);
  });

  it("deja la oferta activa mientras falten jugadores por responder", () => {
    const { sala, partida } = armarOferta();
    const { client } = armarCliente(ALAN);

    rechazarOferta(sala, client);

    assert.strictEqual(partida.ofertaIntercambio.jugador, ANGEL);
  });

  it("cancela la oferta y avisa cuando todos la rechazaron", () => {
    const { sala, partida, difundidos } = armarOferta();
    partida.ofertaIntercambio.registrarRespuesta(ALAN, -1);
    const { client } = armarCliente(LUIS);

    rechazarOferta(sala, client);

    assert.strictEqual(partida.ofertaIntercambio.jugador, "");
    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Luis", mensaje: " ha rechazado la oferta de intercambio" } },
      { tipo: "log", mensaje: { jugador: "Sistema: ", mensaje: "Todos los jugadores han rechazado la oferta de intercambio" } }
    ]);
  });

});
