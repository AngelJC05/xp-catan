import { describe, it } from "mocha";
import assert from "node:assert";
import { validarConfiguracion } from "../../../src/rooms/configuracion/validarConfiguracion.js";

describe("validarConfiguracion", () => {

  it("acepta una configuracion con valores permitidos", () => {
    const error = validarConfiguracion({
      preconstruccion: 40,
      dados: 15,
      acciones: 120,
      oferta: 20,
      ladron: 20,
      robo: 20,
      descarte: 15,
      puntos: 12
    });

    assert.strictEqual(error, null);
  });

  it("acepta una configuracion parcial", () => {
    assert.strictEqual(validarConfiguracion({ acciones: 120 }), null);
  });

  it("acepta una configuracion vacia", () => {
    assert.strictEqual(validarConfiguracion({}), null);
  });

  it("rechaza un tiempo que no esta entre las opciones y dice cual", () => {
    const error = validarConfiguracion({ acciones: 100 });

    assert.ok(error);
    assert.match(error, /acciones/);
  });

  it("rechaza cambiar un tiempo que solo tiene una opcion", () => {
    const error = validarConfiguracion({ dados: 30 });

    assert.ok(error);
    assert.match(error, /dados/);
  });

  it("rechaza puntos fuera de 5 a 15", () => {
    for (const puntos of [4, 16, 0, -5]) {
      const error = validarConfiguracion({ puntos });

      assert.ok(error, `${puntos} deberia ser invalido`);
      assert.match(error, /puntos/);
    }
  });

  it("acepta los extremos de los puntos", () => {
    assert.strictEqual(validarConfiguracion({ puntos: 5 }), null);
    assert.strictEqual(validarConfiguracion({ puntos: 15 }), null);
  });

  it("rechaza puntos que no son enteros", () => {
    const error = validarConfiguracion({ puntos: 7.5 });

    assert.ok(error);
    assert.match(error, /puntos/);
  });

  it("rechaza valores que no son numeros", () => {
    for (const valor of ["60", null, NaN, Infinity, true]) {
      assert.ok(validarConfiguracion({ acciones: valor }), `${String(valor)} deberia ser invalido`);
    }
  });

  it("rechaza opciones que no existen", () => {
    const error = validarConfiguracion({ disparar: 5 });

    assert.ok(error);
    assert.match(error, /disparar/);
  });

  it("si hay un valor invalido rechaza aunque los demas esten bien", () => {
    assert.ok(validarConfiguracion({ acciones: 120, puntos: 99 }));
  });

});
