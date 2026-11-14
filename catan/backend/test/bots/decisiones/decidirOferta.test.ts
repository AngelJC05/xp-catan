import { describe, it } from "mocha";
import assert from "node:assert";
import { decidirOferta } from "../../../src/bots/decisiones/decidirOferta.js";
import { FaseJuego } from "../../../src/common/enums.js";
import { manejarOfrecerIntercambio } from "../../../src/rooms/handlers/comercio/ofrecerIntercambio.js";
import { ALAN, ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";
import { armarCliente } from "../../ayudas/salaFalsa.js";

//* Alan es el bot y no tiene construcciones: su objetivo es una carta (lana, trigo y mineral)
//? Funcion que devuelve la partida con una oferta de Angel ya publicada
//? Alan tiene 2 maderas, 1 trigo y 1 mineral: le falta lana y le sobran las maderas
function armarOferta(ofrecidos: Record<string, number>, solicitados: Record<string, number>) {
  const armado = armarJuegoConReloj();
  armado.partida.faseJuego = FaseJuego.ACCIONES;

  const angel = armado.jugadores.get(ANGEL);
  angel.recursos.set("lana", 2);
  angel.recursos.set("ladrillo", 2);

  const alan = armado.jugadores.get(ALAN);
  alan.recursos.set("madera", 2);
  alan.recursos.set("trigo", 1);
  alan.recursos.set("mineral", 1);

  manejarOfrecerIntercambio(armado.sala, armarCliente(ANGEL).client, { ofrecidos, solicitados });
  return armado;
}

describe("decision del bot ante una oferta de intercambio", () => {

  it("acepta si le dan lo que le falta por algo que le sobra y se hace el cambio", () => {
    const { sala, partida, jugadores } = armarOferta({ lana: 1 }, { madera: 1 });

    decidirOferta(sala, ALAN);

    assert.strictEqual(jugadores.get(ALAN).recursos.get("lana"), 1);
    assert.strictEqual(jugadores.get(ALAN).recursos.get("madera"), 1);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("madera"), 1);
    assert.strictEqual(partida.ofertaIntercambio.jugador, "");
  });

  it("rechaza si le piden algo que necesita para su objetivo", () => {
    const { sala, partida, jugadores } = armarOferta({ lana: 1 }, { trigo: 1 });

    decidirOferta(sala, ALAN);

    assert.strictEqual(jugadores.get(ALAN).recursos.get("trigo"), 1);
    assert.strictEqual(jugadores.get(ALAN).recursos.get("lana"), 0);
    //* Era el unico que podia responder, asi que la oferta se cancela
    assert.strictEqual(partida.ofertaIntercambio.jugador, "");
  });

  it("rechaza si no le dan nada que le falte", () => {
    const { sala, difundidos } = armarOferta({ ladrillo: 1 }, { madera: 1 });

    decidirOferta(sala, ALAN);

    const rechazos = difundidos.filter((envio) =>
      envio.tipo === "log" && JSON.stringify(envio.mensaje).includes("rechazado"));
    assert.ok(rechazos.length > 0);
  });

  it("al responder se cancela el reloj de la oferta", () => {
    const { sala } = armarOferta({ lana: 1 }, { madera: 1 });
    assert.strictEqual(sala.temporizador.estaActivo("oferta"), true);

    decidirOferta(sala, ALAN);

    assert.strictEqual(sala.temporizador.estaActivo("oferta"), false);
  });

  it("no hace nada si no hay una oferta", () => {
    const armado = armarJuegoConReloj();
    armado.jugadores.get(ALAN).recursos.set("madera", 2);

    decidirOferta(armado.sala, ALAN);

    assert.strictEqual(armado.jugadores.get(ALAN).recursos.get("madera"), 2);
    assert.strictEqual(armado.partida.ofertaIntercambio.respuestas.size, 0);
    assert.strictEqual(armado.difundidos.filter((envio) => envio.tipo === "log").length, 0);
  });

  it("no vuelve a responder una oferta que ya respondio", () => {
    const { sala, partida, difundidos } = armarOferta({ lana: 1 }, { madera: 1 });
    partida.ofertaIntercambio.registrarRespuesta(ALAN, -1);
    const avisosAntes = difundidos.length;

    decidirOferta(sala, ALAN);

    assert.strictEqual(partida.ofertaIntercambio.respuestas.get(ALAN), -1);
    assert.strictEqual(difundidos.length, avisosAntes);
  });
});
