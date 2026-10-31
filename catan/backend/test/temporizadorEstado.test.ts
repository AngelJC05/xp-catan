import { describe, it } from "mocha";
import assert from "node:assert";
import { MapSchema } from "@colyseus/schema";
import { Partida } from "../src/schemas/Partida.js";
import { Reloj } from "../src/schemas/Reloj.js";
import { Temporizador } from "../src/timers/Temporizador.js";
import { armarReloj } from "./ayudas/relojFalso.js";

//? Funcion que devuelve un temporizador con su estado y una hora del servidor que se puede mover a mano
function armarTemporizador(horaInicial = 1000) {
  const { reloj, programados, vencer } = armarReloj();
  const relojes = new MapSchema<Reloj>();
  const hora = { actual: horaInicial };
  const temporizador = new Temporizador(reloj, relojes, () => hora.actual);

  return { temporizador, relojes, hora, programados, vencer };
}

describe("estado de los relojes", () => {

  it("la partida empieza sin relojes", () => {
    const partida = new Partida();
    assert.strictEqual(partida.relojes.size, 0);
  });

  it("programar guarda la hora de inicio y la de fin", () => {
    const { temporizador, relojes } = armarTemporizador(1000);

    temporizador.programar("dados", 15, () => {});

    assert.strictEqual(relojes.get("dados").inicio, 1000);
    assert.strictEqual(relojes.get("dados").fin, 16000);
  });

  it("acciones distintas guardan cada una su reloj", () => {
    const { temporizador, relojes } = armarTemporizador(1000);

    temporizador.programar("acciones", 90, () => {});
    temporizador.programar("oferta", 20, () => {});

    assert.strictEqual(relojes.get("acciones").fin, 91000);
    assert.strictEqual(relojes.get("oferta").fin, 21000);
  });

  it("programar de nuevo la misma accion reemplaza su inicio y su fin", () => {
    const { temporizador, relojes, hora } = armarTemporizador(1000);

    temporizador.programar("preconstruccion", 45, () => {});
    hora.actual = 5000;
    temporizador.programar("preconstruccion", 45, () => {});

    assert.strictEqual(relojes.size, 1);
    assert.strictEqual(relojes.get("preconstruccion").inicio, 5000);
    assert.strictEqual(relojes.get("preconstruccion").fin, 50000);
  });

  it("con 0 segundos no guarda ningun reloj", () => {
    const { temporizador, relojes } = armarTemporizador();

    temporizador.programar("acciones", 0, () => {});

    assert.strictEqual(relojes.size, 0);
  });

  it("con 0 segundos borra el reloj anterior de esa accion", () => {
    const { temporizador, relojes } = armarTemporizador();

    temporizador.programar("acciones", 90, () => {});
    temporizador.programar("acciones", 0, () => {});

    assert.strictEqual(relojes.has("acciones"), false);
  });

  it("al vencer se borra el reloj del estado", () => {
    const { temporizador, relojes, vencer } = armarTemporizador();

    temporizador.programar("dados", 15, () => {});
    vencer(0);

    assert.strictEqual(relojes.has("dados"), false);
  });

  it("si al vencer la accion programa de nuevo el reloj, queda el nuevo en el estado", () => {
    const { temporizador, relojes, hora, programados } = armarTemporizador(1000);

    temporizador.programar("robo", 15, () => {
      hora.actual = 20000;
      temporizador.programar("robo", 15, () => {});
    });
    programados[0].accion();

    assert.strictEqual(relojes.get("robo").inicio, 20000);
    assert.strictEqual(relojes.get("robo").fin, 35000);
  });

  it("cancelar borra el reloj del estado", () => {
    const { temporizador, relojes } = armarTemporizador();

    temporizador.programar("ladron", 25, () => {});
    temporizador.cancelar("ladron");

    assert.strictEqual(relojes.has("ladron"), false);
  });

  it("cancelar solo borra el reloj de esa accion", () => {
    const { temporizador, relojes } = armarTemporizador();

    temporizador.programar("ladron", 25, () => {});
    temporizador.programar("robo", 15, () => {});
    temporizador.cancelar("ladron");

    assert.strictEqual(relojes.has("robo"), true);
  });

  it("limpiar borra todos los relojes del estado", () => {
    const { temporizador, relojes } = armarTemporizador();

    temporizador.programar("acciones", 90, () => {});
    temporizador.programar("oferta", 20, () => {});
    temporizador.limpiar();

    assert.strictEqual(relojes.size, 0);
  });

});
