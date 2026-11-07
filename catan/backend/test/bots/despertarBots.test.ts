import { describe, it } from "mocha";
import assert from "node:assert";
import type { DecisionesBot } from "../../src/bots/decisionesBot.js";
import { despertarBots, limpiarRelojesBots, PAUSA_BOT_MS } from "../../src/bots/despertarBots.js";
import { FaseJuego, FasePartida } from "../../src/common/enums.js";
import { armarReloj } from "../ayudas/relojFalso.js";
import { armarSala } from "../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const BOT = "bot-1";
const BOT_2 = "bot-2";

//? Funcion que devuelve una sala en juego con Angel y dos bots, en la fase de acciones con el turno del primer bot
function armarConBots() {
  const armado = armarSala({ [ANGEL]: "Angel", [BOT]: "Kernel", [BOT_2]: "Pixel" });
  armado.jugadores.get(BOT)!.esBot = true;
  armado.jugadores.get(BOT_2)!.esBot = true;
  armado.partida.ordenJugadores.push(ANGEL, BOT, BOT_2);
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.turnoActual = BOT;
  return { ...armado, ...armarReloj() };
}

//? Funcion que devuelve decisiones falsas que guardan a que bot le tocaron, sin cambiar el estado de la partida
function armarDecisiones() {
  const llamadas: string[] = [];
  const decisiones: DecisionesBot = {
    acciones: (_sala, sessionId) => { llamadas.push(sessionId); },
    descarte: (_sala, sessionId) => { llamadas.push(sessionId); }
  };
  return { decisiones, llamadas };
}

describe("despertarBots", () => {

  describe("cuando programa", () => {

    it("programa la accion del bot con la pausa de pensar", () => {
      const { sala, reloj, programados } = armarConBots();
      const { decisiones } = armarDecisiones();

      despertarBots(sala, reloj, decisiones);

      assert.strictEqual(programados.length, 1);
      assert.strictEqual(programados[0].milisegundos, PAUSA_BOT_MS);
    });

    it("no programa nada si el bot no tiene nada que hacer", () => {
      const { sala, partida, reloj, programados } = armarConBots();
      const { decisiones } = armarDecisiones();
      partida.turnoActual = ANGEL;

      despertarBots(sala, reloj, decisiones);

      assert.strictEqual(programados.length, 0);
    });

    it("no programa nada si no hay decision para su situacion", () => {
      const { sala, reloj, programados } = armarConBots();

      despertarBots(sala, reloj, {});

      assert.strictEqual(programados.length, 0);
    });

    it("no programa nada para un humano aunque sea su turno", () => {
      const { sala, partida, reloj, programados } = armarConBots();
      const { decisiones } = armarDecisiones();
      partida.turnoActual = ANGEL;

      despertarBots(sala, reloj, decisiones);

      assert.strictEqual(programados.length, 0);
    });

    it("no programa dos veces al mismo bot si lo despiertan de nuevo", () => {
      const { sala, reloj, programados } = armarConBots();
      const { decisiones } = armarDecisiones();

      despertarBots(sala, reloj, decisiones);
      despertarBots(sala, reloj, decisiones);

      assert.strictEqual(programados.length, 1);
    });

    it("programa una accion por cada bot que tenga algo que hacer", () => {
      const { sala, partida, reloj, programados } = armarConBots();
      const { decisiones } = armarDecisiones();
      partida.faseJuego = FaseJuego.DESCARTE;
      partida.turnoActual = ANGEL;
      partida.jugadoresParaDescartar.set(BOT, 4);
      partida.jugadoresParaDescartar.set(BOT_2, 5);

      despertarBots(sala, reloj, decisiones);

      assert.strictEqual(programados.length, 2);
    });
  });

  describe("cuando se cumple la pausa", () => {

    it("ejecuta la decision del bot", () => {
      const { sala, reloj, vencer } = armarConBots();
      const { decisiones, llamadas } = armarDecisiones();
      despertarBots(sala, reloj, decisiones);

      vencer(0);

      assert.deepStrictEqual(llamadas, [BOT]);
    });

    it("no ejecuta la decision si ya no le toca al bot", () => {
      const { sala, partida, reloj, programados, vencer } = armarConBots();
      const { decisiones, llamadas } = armarDecisiones();
      despertarBots(sala, reloj, decisiones);
      partida.turnoActual = ANGEL;

      assert.strictEqual(programados.length, 1);
      vencer(0);

      assert.deepStrictEqual(llamadas, []);
    });

    it("programa de nuevo al bot si despues de actuar todavia tiene algo pendiente", () => {
      const { sala, reloj, programados, vencer } = armarConBots();
      const { decisiones } = armarDecisiones();
      despertarBots(sala, reloj, decisiones);

      vencer(0);

      assert.strictEqual(programados.length, 2);
      assert.strictEqual(programados[1].milisegundos, PAUSA_BOT_MS);
    });

    it("despierta al siguiente bot cuando el turno le pasa a otro bot", () => {
      const { sala, partida, reloj, programados, vencer } = armarConBots();
      const llamadas: string[] = [];
      const decisiones: DecisionesBot = {
        acciones: (_sala, sessionId) => {
          llamadas.push(sessionId);
          if (sessionId === BOT) partida.turnoActual = BOT_2;
        }
      };
      despertarBots(sala, reloj, decisiones);

      vencer(0);
      vencer(1);

      assert.deepStrictEqual(llamadas, [BOT, BOT_2]);
    });
  });

  describe("limpiarRelojesBots", () => {

    it("cancela lo que estaba programado", () => {
      const { sala, reloj, programados } = armarConBots();
      const { decisiones } = armarDecisiones();
      despertarBots(sala, reloj, decisiones);

      limpiarRelojesBots(sala);

      assert.strictEqual(programados[0].cancelado, true);
    });

    it("permite programar de nuevo despues de limpiar", () => {
      const { sala, reloj, programados } = armarConBots();
      const { decisiones } = armarDecisiones();
      despertarBots(sala, reloj, decisiones);
      limpiarRelojesBots(sala);

      despertarBots(sala, reloj, decisiones);

      assert.strictEqual(programados.length, 2);
    });
  });
});
