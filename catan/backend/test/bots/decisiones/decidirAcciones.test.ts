import { describe, it } from "mocha";
import assert from "node:assert";
import type { AccionBot } from "../../../src/bots/acciones/accionesBot.js";
import { decidirAcciones } from "../../../src/bots/decisiones/decidirAcciones.js";
import { FaseJuego } from "../../../src/common/enums.js";
import { iniciarRelojAcciones } from "../../../src/timers/acciones/iniciarRelojAcciones.js";
import { ALAN, ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";

//? Funcion que devuelve el juego en la fase de acciones del turno de Angel, con el reloj humano de acciones en marcha
function armarAcciones() {
  const armado = armarJuegoConReloj();
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  iniciarRelojAcciones(armado.sala);
  return armado;
}

//? Funcion que devuelve una accion falsa que anota su nombre y devuelve lo indicado
function accionFalsa(nombre: string, llamadas: string[], resultado: boolean): AccionBot {
  return () => {
    llamadas.push(nombre);
    return resultado;
  };
}

describe("decision del bot en la fase de acciones", () => {

  describe("cuando no queda nada por hacer", () => {

    it("pasa el turno si la lista de acciones esta vacia", () => {
      const { sala, partida } = armarAcciones();

      decidirAcciones(sala, ANGEL, []);

      assert.strictEqual(partida.turnoActual, ALAN);
      assert.strictEqual(partida.faseJuego, FaseJuego.DADOS);
    });

    it("prueba las acciones en orden de prioridad y pasa el turno si ninguna hizo algo", () => {
      const { sala, partida } = armarAcciones();
      const llamadas: string[] = [];

      decidirAcciones(sala, ANGEL, [
        accionFalsa("carta", llamadas, false),
        accionFalsa("banca", llamadas, false),
        accionFalsa("construir", llamadas, false)
      ]);

      assert.deepStrictEqual(llamadas, ["carta", "banca", "construir"]);
      assert.strictEqual(partida.turnoActual, ALAN);
    });

    it("cancela el reloj humano de las acciones y arranca el de los dados del siguiente", () => {
      const { sala, programados } = armarAcciones();

      decidirAcciones(sala, ANGEL, []);

      assert.strictEqual(programados[0].cancelado, true);
      assert.strictEqual(sala.temporizador.estaActivo("acciones"), false);
      assert.strictEqual(sala.temporizador.estaActivo("dados"), true);
    });

    it("avisa en el log que paso el turno, sin decir que se le acabo el tiempo", () => {
      const { sala, difundidos } = armarAcciones();

      decidirAcciones(sala, ANGEL, []);

      const avisos = difundidos.filter((envio) => envio.tipo === "log").map((envio) => JSON.stringify(envio.mensaje));
      assert.strictEqual(avisos.filter((aviso) => aviso.includes("ha pasado su turno")).length, 1);
      assert.strictEqual(avisos.filter((aviso) => aviso.includes("sin tiempo")).length, 0);
    });
  });

  describe("cuando una accion hace algo", () => {

    it("se detiene en esa accion, no prueba las siguientes y no pasa el turno", () => {
      const { sala, partida } = armarAcciones();
      const llamadas: string[] = [];

      decidirAcciones(sala, ANGEL, [
        accionFalsa("carta", llamadas, false),
        accionFalsa("banca", llamadas, true),
        accionFalsa("construir", llamadas, true)
      ]);

      assert.deepStrictEqual(llamadas, ["carta", "banca"]);
      assert.strictEqual(partida.turnoActual, ANGEL);
      assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
      assert.strictEqual(sala.temporizador.estaActivo("acciones"), true);
    });

    it("le pasa a la accion la sala y el sessionId del bot", () => {
      const { sala } = armarAcciones();
      const recibidos: unknown[] = [];

      decidirAcciones(sala, ANGEL, [(salaRecibida, sessionId) => {
        recibidos.push(salaRecibida, sessionId);
        return true;
      }]);

      assert.deepStrictEqual(recibidos, [sala, ANGEL]);
    });
  });
});
