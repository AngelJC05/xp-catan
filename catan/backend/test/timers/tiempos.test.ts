import { describe, it } from "mocha";
import assert from "node:assert";
import { TIEMPOS_POR_DEFECTO, TIEMPOS_PERMITIDOS, leerTiempos } from "../../src/timers/tiempos.js";

describe("tiempos de la sala", () => {

  describe("TIEMPOS_POR_DEFECTO", () => {

    it("tiene un tiempo para cada accion", () => {
      assert.deepStrictEqual(Object.keys(TIEMPOS_POR_DEFECTO).sort(), [
        "acciones", "dados", "descarte", "ladron", "oferta", "preconstruccion", "robo"
      ]);
    });

    it("todos son segundos positivos", () => {
      for (const segundos of Object.values(TIEMPOS_POR_DEFECTO)) {
        assert.ok(Number.isFinite(segundos) && segundos > 0);
      }
    });

  });

  describe("TIEMPOS_POR_DEFECTO elegidos", () => {

    it("ladron, robo y oferta duran 20 segundos", () => {
      assert.strictEqual(TIEMPOS_POR_DEFECTO.ladron, 20);
      assert.strictEqual(TIEMPOS_POR_DEFECTO.robo, 20);
      assert.strictEqual(TIEMPOS_POR_DEFECTO.oferta, 20);
    });

  });

  describe("TIEMPOS_PERMITIDOS", () => {

    it("tiene una lista para cada accion", () => {
      assert.deepStrictEqual(
        Object.keys(TIEMPOS_PERMITIDOS).sort(),
        Object.keys(TIEMPOS_POR_DEFECTO).sort()
      );
    });

    it("las listas son las que se pueden elegir en la sala", () => {
      assert.deepStrictEqual(TIEMPOS_PERMITIDOS, {
        preconstruccion: [20, 40, 45, 60],
        dados: [15],
        acciones: [30, 60, 90, 120, 150],
        oferta: [20],
        ladron: [20],
        robo: [20],
        descarte: [15, 30]
      });
    });

    it("el tiempo por defecto de cada accion esta entre sus opciones", () => {
      for (const [accion, segundos] of Object.entries(TIEMPOS_POR_DEFECTO)) {
        const opciones = TIEMPOS_PERMITIDOS[accion as keyof typeof TIEMPOS_PERMITIDOS];
        assert.ok(opciones.includes(segundos), `${accion}: ${segundos} no esta en ${opciones}`);
      }
    });

  });

  describe("leerTiempos", () => {

    it("usa los valores por defecto si no llega ninguna opcion", () => {
      assert.deepStrictEqual(leerTiempos({}), TIEMPOS_POR_DEFECTO);
    });

    it("usa los valores por defecto si las opciones no existen", () => {
      assert.deepStrictEqual(leerTiempos(undefined), TIEMPOS_POR_DEFECTO);
    });

    it("respeta los tiempos que si llegan y deja el resto por defecto", () => {
      const tiempos = leerTiempos({ dados: 20, acciones: 90 });

      assert.strictEqual(tiempos.dados, 20);
      assert.strictEqual(tiempos.acciones, 90);
      assert.strictEqual(tiempos.robo, TIEMPOS_POR_DEFECTO.robo);
    });

    it("el 0 significa sin limite de tiempo", () => {
      const tiempos = leerTiempos({ acciones: 0 });
      assert.strictEqual(tiempos.acciones, 0);
    });

    it("ignora los tiempos negativos", () => {
      const tiempos = leerTiempos({ dados: -5 });
      assert.strictEqual(tiempos.dados, TIEMPOS_POR_DEFECTO.dados);
    });

    it("ignora lo que no es un numero", () => {
      const tiempos = leerTiempos({ dados: "10", robo: NaN, oferta: Infinity, ladron: null });

      assert.strictEqual(tiempos.dados, TIEMPOS_POR_DEFECTO.dados);
      assert.strictEqual(tiempos.robo, TIEMPOS_POR_DEFECTO.robo);
      assert.strictEqual(tiempos.oferta, TIEMPOS_POR_DEFECTO.oferta);
      assert.strictEqual(tiempos.ladron, TIEMPOS_POR_DEFECTO.ladron);
    });

    it("ignora las acciones que no existen", () => {
      const tiempos = leerTiempos({ disparar: 5 });

      assert.deepStrictEqual(tiempos, TIEMPOS_POR_DEFECTO);
    });

    it("devuelve una copia, cambiarla no altera los valores por defecto", () => {
      const tiempos = leerTiempos({});
      tiempos.dados = 1;

      assert.notStrictEqual(TIEMPOS_POR_DEFECTO.dados, 1);
    });

  });

});
