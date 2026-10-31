import { describe, it } from "mocha";
import assert from "node:assert";
import { Temporizador } from "../src/timers/Temporizador.js";
import { armarReloj } from "./ayudas/relojFalso.js";

describe("temporizador", () => {

  describe("programar", () => {

    it("programa el reloj con los segundos pasados a milisegundos", () => {
      const { reloj, programados } = armarReloj();
      const temporizador = new Temporizador(reloj);

      temporizador.programar("dados", 15, () => {});

      assert.strictEqual(programados.length, 1);
      assert.strictEqual(programados[0].milisegundos, 15000);
    });

    it("la accion no se ejecuta antes de que venza", () => {
      const { reloj } = armarReloj();
      const temporizador = new Temporizador(reloj);
      let ejecuciones = 0;

      temporizador.programar("dados", 15, () => { ejecuciones++; });

      assert.strictEqual(ejecuciones, 0);
    });

    it("al vencer ejecuta la accion una sola vez", () => {
      const { reloj, vencer } = armarReloj();
      const temporizador = new Temporizador(reloj);
      let ejecuciones = 0;

      temporizador.programar("dados", 15, () => { ejecuciones++; });
      vencer(0);

      assert.strictEqual(ejecuciones, 1);
    });

    it("mientras corre la accion esta activa y al vencer deja de estarlo", () => {
      const { reloj, vencer } = armarReloj();
      const temporizador = new Temporizador(reloj);

      temporizador.programar("dados", 15, () => {});
      assert.strictEqual(temporizador.estaActivo("dados"), true);

      vencer(0);
      assert.strictEqual(temporizador.estaActivo("dados"), false);
    });

    it("programar la misma accion cancela el reloj anterior y empieza de nuevo", () => {
      const { reloj, programados, vencer } = armarReloj();
      const temporizador = new Temporizador(reloj);
      const vencidos: string[] = [];

      temporizador.programar("preconstruccion", 45, () => { vencidos.push("primero"); });
      temporizador.programar("preconstruccion", 45, () => { vencidos.push("segundo"); });
      vencer(0);
      vencer(1);

      assert.strictEqual(programados[0].cancelado, true);
      assert.deepStrictEqual(vencidos, ["segundo"]);
    });

    it("acciones distintas pueden tener su reloj a la vez", () => {
      const { reloj, programados } = armarReloj();
      const temporizador = new Temporizador(reloj);

      temporizador.programar("acciones", 90, () => {});
      temporizador.programar("oferta", 20, () => {});

      assert.strictEqual(programados[0].cancelado, false);
      assert.strictEqual(temporizador.estaActivo("acciones"), true);
      assert.strictEqual(temporizador.estaActivo("oferta"), true);
    });

    it("con 0 segundos no programa nada porque no hay limite", () => {
      const { reloj, programados } = armarReloj();
      const temporizador = new Temporizador(reloj);

      temporizador.programar("acciones", 0, () => {});

      assert.strictEqual(programados.length, 0);
      assert.strictEqual(temporizador.estaActivo("acciones"), false);
    });

    it("con 0 segundos tambien cancela el reloj anterior de esa accion", () => {
      const { reloj, programados } = armarReloj();
      const temporizador = new Temporizador(reloj);

      temporizador.programar("acciones", 90, () => {});
      temporizador.programar("acciones", 0, () => {});

      assert.strictEqual(programados[0].cancelado, true);
      assert.strictEqual(temporizador.estaActivo("acciones"), false);
    });

    it("al vencer la accion puede programar de nuevo el mismo reloj", () => {
      const { reloj, programados } = armarReloj();
      const temporizador = new Temporizador(reloj);

      temporizador.programar("robo", 15, () => {
        temporizador.programar("robo", 15, () => {});
      });
      programados[0].accion();

      assert.strictEqual(programados.length, 2);
      assert.strictEqual(temporizador.estaActivo("robo"), true);
    });

  });

  describe("cancelar", () => {

    it("cancela el reloj y la accion ya no se ejecuta", () => {
      const { reloj, programados, vencer } = armarReloj();
      const temporizador = new Temporizador(reloj);
      let ejecuciones = 0;

      temporizador.programar("ladron", 25, () => { ejecuciones++; });
      temporizador.cancelar("ladron");
      vencer(0);

      assert.strictEqual(programados[0].cancelado, true);
      assert.strictEqual(ejecuciones, 0);
      assert.strictEqual(temporizador.estaActivo("ladron"), false);
    });

    it("solo cancela la accion indicada", () => {
      const { reloj, programados } = armarReloj();
      const temporizador = new Temporizador(reloj);

      temporizador.programar("ladron", 25, () => {});
      temporizador.programar("robo", 15, () => {});
      temporizador.cancelar("ladron");

      assert.strictEqual(programados[1].cancelado, false);
      assert.strictEqual(temporizador.estaActivo("robo"), true);
    });

    it("cancelar una accion sin reloj no hace nada", () => {
      const { reloj } = armarReloj();
      const temporizador = new Temporizador(reloj);

      assert.doesNotThrow(() => temporizador.cancelar("descarte"));
    });

  });

  describe("limpiar", () => {

    it("cancela todos los relojes activos", () => {
      const { reloj, programados } = armarReloj();
      const temporizador = new Temporizador(reloj);

      temporizador.programar("acciones", 90, () => {});
      temporizador.programar("oferta", 20, () => {});
      temporizador.limpiar();

      assert.strictEqual(programados.every((programado) => programado.cancelado), true);
      assert.strictEqual(temporizador.estaActivo("acciones"), false);
      assert.strictEqual(temporizador.estaActivo("oferta"), false);
    });

    it("despues de limpiar se puede programar de nuevo", () => {
      const { reloj } = armarReloj();
      const temporizador = new Temporizador(reloj);

      temporizador.programar("dados", 15, () => {});
      temporizador.limpiar();
      temporizador.programar("dados", 15, () => {});

      assert.strictEqual(temporizador.estaActivo("dados"), true);
    });

  });

});
