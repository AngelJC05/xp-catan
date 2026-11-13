import { describe, it } from "mocha";
import assert from "node:assert";
import { accionAbundancia } from "../../../src/bots/acciones/accionAbundancia.js";
import { Desarrollo, FaseJuego } from "../../../src/common/enums.js";
import { ALAN, ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";

const ABUNDANCIA = `${Desarrollo.ABUNDANCIA}`;

//* Angel es el bot y no tiene construcciones: su objetivo es una carta (lana, trigo y mineral)
//? Funcion que devuelve la fase de acciones de Angel con una carta de abundancia y los recursos elegidos
function armarAbundancia(recursos: Record<string, number> = {}) {
  const armado = armarJuegoConReloj();
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.cartaJugable = true;

  const angel = armado.jugadores.get(ANGEL);
  angel.cartas_usables.set(ABUNDANCIA, 1);
  Object.entries(recursos).forEach(([recurso, cantidad]) => angel.recursos.set(recurso, cantidad));

  return { ...armado, angel };
}

//? Suma todos los recursos de Angel
function totalDe(armado: ReturnType<typeof armarAbundancia>) {
  let total = 0;
  armado.angel.recursos.forEach((cantidad) => { total += cantidad; });
  return total;
}

describe("accion del bot con la carta de abundancia", () => {

  it("si le faltan justo 2 recursos, pide esos dos", () => {
    const armado = armarAbundancia({ mineral: 1 });

    assert.strictEqual(accionAbundancia(armado.sala, ANGEL), true);

    assert.strictEqual(armado.angel.recursos.get("lana"), 1);
    assert.strictEqual(armado.angel.recursos.get("trigo"), 1);
    assert.strictEqual(armado.angel.cartas_usables.get(ABUNDANCIA), 0);
    assert.strictEqual(armado.partida.cartaJugable, false);
  });

  it("si le falta 1 recurso, pide ese y otro al azar", () => {
    const armado = armarAbundancia({ mineral: 1, trigo: 1 });

    assert.strictEqual(accionAbundancia(armado.sala, ANGEL, () => 0.99), true);

    assert.ok(armado.angel.recursos.get("lana") >= 1);
    assert.strictEqual(totalDe(armado), 4);
  });

  it("el recurso al azar sale de los que tiene la banca", () => {
    const armado = armarAbundancia({ mineral: 1, trigo: 1 });
    ["madera", "trigo", "ladrillo", "mineral"].forEach((recurso) => armado.banca.recursos.set(recurso, 0));

    assert.strictEqual(accionAbundancia(armado.sala, ANGEL, () => 0), true);

    //* Solo queda lana en la banca, asi que las dos cartas son lana
    assert.strictEqual(armado.angel.recursos.get("lana"), 2);
  });

  it("si le faltan mas de 2 recursos, se guarda la carta", () => {
    const armado = armarAbundancia();

    assert.strictEqual(accionAbundancia(armado.sala, ANGEL), false);
    assert.strictEqual(armado.angel.cartas_usables.get(ABUNDANCIA), 1);
  });

  it("si no le falta nada, se guarda la carta", () => {
    const armado = armarAbundancia({ lana: 1, trigo: 1, mineral: 1 });

    assert.strictEqual(accionAbundancia(armado.sala, ANGEL), false);
    assert.strictEqual(armado.angel.cartas_usables.get(ABUNDANCIA), 1);
  });

  it("si la banca no tiene lo que le falta, no la usa", () => {
    const armado = armarAbundancia({ mineral: 1 });
    armado.banca.recursos.set("lana", 0);

    assert.strictEqual(accionAbundancia(armado.sala, ANGEL), false);
    assert.strictEqual(armado.angel.cartas_usables.get(ABUNDANCIA), 1);
  });

  it("no la usa sin la carta, si ya uso otra carta, fuera de acciones o fuera de su turno", () => {
    const sinCarta = armarAbundancia({ mineral: 1 });
    sinCarta.angel.cartas_usables.set(ABUNDANCIA, 0);
    assert.strictEqual(accionAbundancia(sinCarta.sala, ANGEL), false);

    const yaUso = armarAbundancia({ mineral: 1 });
    yaUso.partida.cartaJugable = false;
    assert.strictEqual(accionAbundancia(yaUso.sala, ANGEL), false);

    const fueraDeFase = armarAbundancia({ mineral: 1 });
    fueraDeFase.partida.faseJuego = FaseJuego.DADOS;
    assert.strictEqual(accionAbundancia(fueraDeFase.sala, ANGEL), false);

    const otroTurno = armarAbundancia({ mineral: 1 });
    otroTurno.partida.turnoActual = ALAN;
    assert.strictEqual(accionAbundancia(otroTurno.sala, ANGEL), false);
  });
});
