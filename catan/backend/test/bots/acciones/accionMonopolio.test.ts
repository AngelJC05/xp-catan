import { describe, it } from "mocha";
import assert from "node:assert";
import { accionMonopolio } from "../../../src/bots/acciones/accionMonopolio.js";
import { Desarrollo, FaseJuego } from "../../../src/common/enums.js";
import { ALAN, ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";

const MONOPOLIO = `${Desarrollo.MONOPOLIO}`;

//* Angel es el bot y no tiene construcciones: su objetivo es una carta (lana, trigo y mineral)
//? Funcion que devuelve la fase de acciones de Angel con una carta de monopolio
function armarMonopolio() {
  const armado = armarJuegoConReloj();
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.cartaJugable = true;
  armado.jugadores.get(ANGEL).cartas_usables.set(MONOPOLIO, 1);
  return armado;
}

type Armado = ReturnType<typeof armarMonopolio>;

//? Le da recursos a un jugador sacandolos de la banca, como pasa en la partida
function dar(armado: Armado, sessionId: string, recursos: Record<string, number>) {
  Object.entries(recursos).forEach(([recurso, cantidad]) => {
    const jugador = armado.jugadores.get(sessionId);
    jugador.recursos.set(recurso, jugador.recursos.get(recurso) + cantidad);
    armado.banca.recursos.set(recurso, armado.banca.recursos.get(recurso) - cantidad);
  });
}

function recursoDe(armado: Armado, sessionId: string, recurso: string) {
  return armado.jugadores.get(sessionId).recursos.get(recurso);
}

describe("accion del bot con la carta de monopolio", () => {

  it("si le falta un solo tipo de recurso, se queda con todo ese recurso de los demas", () => {
    const armado = armarMonopolio();
    dar(armado, ANGEL, { trigo: 1, mineral: 1 });
    dar(armado, ALAN, { lana: 2 });

    assert.strictEqual(accionMonopolio(armado.sala, ANGEL), true);

    assert.strictEqual(recursoDe(armado, ANGEL, "lana"), 2);
    assert.strictEqual(recursoDe(armado, ALAN, "lana"), 0);
    assert.strictEqual(armado.jugadores.get(ANGEL).cartas_usables.get(MONOPOLIO), 0);
    assert.strictEqual(armado.partida.cartaJugable, false);
  });

  it("si le falta un solo tipo pero nadie lo tiene, se guarda la carta", () => {
    const armado = armarMonopolio();
    dar(armado, ANGEL, { trigo: 1, mineral: 1 });

    assert.strictEqual(accionMonopolio(armado.sala, ANGEL), false);
    assert.strictEqual(armado.jugadores.get(ANGEL).cartas_usables.get(MONOPOLIO), 1);
  });

  it("si los demas juntan 5 o mas de un recurso, se queda con ese", () => {
    const armado = armarMonopolio();
    dar(armado, ALAN, { madera: 6 });

    assert.strictEqual(accionMonopolio(armado.sala, ANGEL), true);
    assert.strictEqual(recursoDe(armado, ANGEL, "madera"), 6);
  });

  it("si hay varios con 5 o mas, elige el que mas tienen los demas", () => {
    const armado = armarMonopolio();
    dar(armado, ALAN, { madera: 5, ladrillo: 7 });

    assert.strictEqual(accionMonopolio(armado.sala, ANGEL), true);
    assert.strictEqual(recursoDe(armado, ANGEL, "ladrillo"), 7);
    assert.strictEqual(recursoDe(armado, ANGEL, "madera"), 0);
  });

  it("elige el que mas tienen aunque vaya antes en la banca", () => {
    const armado = armarMonopolio();
    dar(armado, ALAN, { madera: 7, ladrillo: 5 });

    assert.strictEqual(accionMonopolio(armado.sala, ANGEL), true);
    assert.strictEqual(recursoDe(armado, ANGEL, "madera"), 7);
    assert.strictEqual(recursoDe(armado, ANGEL, "ladrillo"), 0);
  });

  it("con menos de 5 en manos de los demas, se guarda la carta", () => {
    const armado = armarMonopolio();
    dar(armado, ALAN, { madera: 4 });

    assert.strictEqual(accionMonopolio(armado.sala, ANGEL), false);
  });

  it("cuenta lo de los demas viendo la banca, sin mirar sus cartas", () => {
    //* Alan tiene 6 maderas pero la banca sigue llena: para el bot nadie tiene madera
    const armado = armarMonopolio();
    armado.jugadores.get(ALAN).recursos.set("madera", 6);

    assert.strictEqual(accionMonopolio(armado.sala, ANGEL), false);
  });

  it("no cuenta lo que tiene el propio bot como si fuera de los demas", () => {
    const armado = armarMonopolio();
    dar(armado, ANGEL, { madera: 6 });

    assert.strictEqual(accionMonopolio(armado.sala, ANGEL), false);
  });

  it("no la usa sin la carta, si ya uso otra carta, fuera de acciones o fuera de su turno", () => {
    const sinCarta = armarMonopolio();
    dar(sinCarta, ALAN, { madera: 6 });
    sinCarta.jugadores.get(ANGEL).cartas_usables.set(MONOPOLIO, 0);
    assert.strictEqual(accionMonopolio(sinCarta.sala, ANGEL), false);

    const yaUso = armarMonopolio();
    dar(yaUso, ALAN, { madera: 6 });
    yaUso.partida.cartaJugable = false;
    assert.strictEqual(accionMonopolio(yaUso.sala, ANGEL), false);

    const fueraDeFase = armarMonopolio();
    dar(fueraDeFase, ALAN, { madera: 6 });
    fueraDeFase.partida.faseJuego = FaseJuego.DADOS;
    assert.strictEqual(accionMonopolio(fueraDeFase.sala, ANGEL), false);

    const otroTurno = armarMonopolio();
    dar(otroTurno, ALAN, { madera: 6 });
    otroTurno.partida.turnoActual = ALAN;
    assert.strictEqual(accionMonopolio(otroTurno.sala, ANGEL), false);
  });
});
