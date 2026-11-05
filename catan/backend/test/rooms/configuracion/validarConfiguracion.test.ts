import { describe, it } from "mocha";
import assert from "node:assert";
import { validarConfiguracion } from "../../../src/rooms/configuracion/validarConfiguracion.js";

describe("validarConfiguracion", () => {

  it("acepta una configuracion con valores permitidos", () => {
    const resultado = validarConfiguracion({
      preconstruccion: 40,
      dados: 15,
      acciones: 120,
      oferta: 20,
      ladron: 20,
      robo: 20,
      descarte: 15,
      puntos: 12
    });

    assert.strictEqual(resultado.error, false);
  });

  it("acepta una configuracion parcial", () => {
    assert.strictEqual(validarConfiguracion({ acciones: 120 }).error, false);
  });

  it("acepta una configuracion vacia", () => {
    assert.strictEqual(validarConfiguracion({}).error, false);
  });

  it("rechaza un tiempo que no esta entre las opciones y dice cual", () => {
    const resultado = validarConfiguracion({ acciones: 100 });

    assert.ok(resultado.error);
    assert.match(resultado.mensaje, /acciones/);
  });

  it("rechaza cambiar un tiempo que solo tiene una opcion", () => {
    const resultado = validarConfiguracion({ dados: 30 });

    assert.ok(resultado.error);
    assert.match(resultado.mensaje, /dados/);
  });

  it("rechaza puntos fuera de 5 a 15", () => {
    for (const puntos of [4, 16, 0, -5]) {
      const resultado = validarConfiguracion({ puntos });

      assert.ok(resultado.error, `${puntos} deberia ser invalido`);
      assert.match(resultado.mensaje, /puntos/);
    }
  });

  it("acepta los extremos de los puntos", () => {
    assert.strictEqual(validarConfiguracion({ puntos: 5 }).error, false);
    assert.strictEqual(validarConfiguracion({ puntos: 15 }).error, false);
  });

  it("rechaza puntos que no son enteros", () => {
    const resultado = validarConfiguracion({ puntos: 7.5 });

    assert.ok(resultado.error);
    assert.match(resultado.mensaje, /puntos/);
  });

  it("rechaza valores que no son numeros", () => {
    for (const valor of ["60", null, NaN, Infinity, true]) {
      assert.ok(validarConfiguracion({ acciones: valor }).error, `${String(valor)} deberia ser invalido`);
    }
  });

  it("rechaza opciones que no existen", () => {
    const resultado = validarConfiguracion({ disparar: 5 });

    assert.ok(resultado.error);
    assert.match(resultado.mensaje, /disparar/);
  });

  it("si hay un valor invalido rechaza aunque los demas esten bien", () => {
    assert.ok(validarConfiguracion({ acciones: 120, puntos: 99 }).error);
  });

});
