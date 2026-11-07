import { describe, it } from "mocha";
import assert from "node:assert";
import { situacionDelBot } from "../../src/bots/situacionDelBot.js";
import { FasePartida, FasePreconstruccion, FaseJuego } from "../../src/common/enums.js";
import { armarSala } from "../ayudas/salaFalsa.js";

const BOT = "bot-1";
const ANGEL = "jugadorAngel";

//? Funcion que devuelve una sala con Angel y un bot, sin turno asignado
function armarConBot() {
  const armado = armarSala({ [ANGEL]: "Angel", [BOT]: "Kernel" });
  armado.partida.ordenJugadores.push(ANGEL, BOT);
  return armado;
}

describe("situacionDelBot", () => {

  describe("sin partida en curso", () => {

    it("devuelve null en el lobby", () => {
      const { sala, partida } = armarConBot();
      partida.fase = FasePartida.LOBBY;
      partida.turnoActual = BOT;

      assert.strictEqual(situacionDelBot(sala, BOT), null);
    });

    it("devuelve null si la partida ya finalizo", () => {
      const { sala, partida } = armarConBot();
      partida.fase = FasePartida.FINALIZADA;
      partida.turnoActual = BOT;

      assert.strictEqual(situacionDelBot(sala, BOT), null);
    });

    it("devuelve null si el jugador no existe", () => {
      const { sala, partida } = armarConBot();
      partida.fase = FasePartida.JUEGO;

      assert.strictEqual(situacionDelBot(sala, "bot-99"), null);
    });
  });

  describe("preconstruccion", () => {

    it("devuelve asentamientoInicial si es su turno de poner asentamiento", () => {
      const { sala, partida } = armarConBot();
      partida.fase = FasePartida.PRECONSTRUCCION;
      partida.fasePreconstruccion = FasePreconstruccion.ASENTAMIENTO;
      partida.turnoActual = BOT;

      assert.strictEqual(situacionDelBot(sala, BOT), "asentamientoInicial");
    });

    it("devuelve caminoInicial si es su turno de poner camino", () => {
      const { sala, partida } = armarConBot();
      partida.fase = FasePartida.PRECONSTRUCCION;
      partida.fasePreconstruccion = FasePreconstruccion.CAMINO;
      partida.turnoActual = BOT;

      assert.strictEqual(situacionDelBot(sala, BOT), "caminoInicial");
    });

    it("devuelve null si el turno es de otro jugador", () => {
      const { sala, partida } = armarConBot();
      partida.fase = FasePartida.PRECONSTRUCCION;
      partida.fasePreconstruccion = FasePreconstruccion.ASENTAMIENTO;
      partida.turnoActual = ANGEL;

      assert.strictEqual(situacionDelBot(sala, BOT), null);
    });
  });

  describe("turno de juego", () => {

    //? Funcion que devuelve una sala en juego, en la fase indicada y con el turno del bot
    function enJuego(faseJuego: FaseJuego, turno = BOT) {
      const armado = armarConBot();
      armado.partida.fase = FasePartida.JUEGO;
      armado.partida.faseJuego = faseJuego;
      armado.partida.turnoActual = turno;
      return armado;
    }

    it("devuelve la situacion que corresponde a cada fase cuando es su turno", () => {
      const esperadas: [FaseJuego, string][] = [
        [FaseJuego.DADOS, "dados"],
        [FaseJuego.ACCIONES, "acciones"],
        [FaseJuego.LADRON, "ladron"],
        [FaseJuego.ROBO, "robo"],
        [FaseJuego.CARRETERAS, "carreteras"]
      ];

      for (const [fase, situacion] of esperadas) {
        const { sala } = enJuego(fase);
        assert.strictEqual(situacionDelBot(sala, BOT), situacion, `fase ${fase}`);
      }
    });

    it("devuelve null en todas las fases si el turno es de otro jugador", () => {
      for (const fase of [FaseJuego.DADOS, FaseJuego.ACCIONES, FaseJuego.LADRON, FaseJuego.ROBO, FaseJuego.CARRETERAS]) {
        const { sala } = enJuego(fase, ANGEL);
        assert.strictEqual(situacionDelBot(sala, BOT), null, `fase ${fase}`);
      }
    });

    it("en la fase de descarte el dueño del turno no tiene nada que hacer", () => {
      const { sala } = enJuego(FaseJuego.DESCARTE);

      assert.strictEqual(situacionDelBot(sala, BOT), null);
    });
  });

  describe("descarte", () => {

    it("devuelve descarte si el bot esta en la lista aunque no sea su turno", () => {
      const { sala, partida } = armarConBot();
      partida.fase = FasePartida.JUEGO;
      partida.faseJuego = FaseJuego.DESCARTE;
      partida.turnoActual = ANGEL;
      partida.jugadoresParaDescartar.set(BOT, 4);

      assert.strictEqual(situacionDelBot(sala, BOT), "descarte");
    });

    it("devuelve null si hay descartes pero el bot no esta en la lista", () => {
      const { sala, partida } = armarConBot();
      partida.fase = FasePartida.JUEGO;
      partida.faseJuego = FaseJuego.DESCARTE;
      partida.turnoActual = ANGEL;
      partida.jugadoresParaDescartar.set(ANGEL, 4);

      assert.strictEqual(situacionDelBot(sala, BOT), null);
    });
  });

  describe("oferta de intercambio", () => {

    //? Funcion que devuelve una sala en juego con una oferta de Angel abierta, con la respuesta del bot indicada
    function conOferta(respuestaBot: number) {
      const armado = armarConBot();
      armado.partida.fase = FasePartida.JUEGO;
      armado.partida.faseJuego = FaseJuego.ACCIONES;
      armado.partida.turnoActual = ANGEL;
      armado.partida.ofertaIntercambio.jugador = ANGEL;
      armado.partida.ofertaIntercambio.respuestas.set(BOT, respuestaBot);
      return armado;
    }

    it("devuelve oferta si el bot aun no respondio", () => {
      const { sala } = conOferta(0);

      assert.strictEqual(situacionDelBot(sala, BOT), "oferta");
    });

    it("devuelve null si el bot ya respondio", () => {
      for (const respuesta of [1, -1]) {
        const { sala } = conOferta(respuesta);
        assert.strictEqual(situacionDelBot(sala, BOT), null, `respuesta ${respuesta}`);
      }
    });

    it("ignora su propia oferta y sigue con la situacion de su turno", () => {
      const { sala, partida } = conOferta(0);
      partida.turnoActual = BOT;
      partida.ofertaIntercambio.jugador = BOT;
      partida.ofertaIntercambio.respuestas.delete(BOT);

      assert.strictEqual(situacionDelBot(sala, BOT), "acciones");
    });
  });
});
