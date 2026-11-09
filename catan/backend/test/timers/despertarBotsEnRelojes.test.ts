import { afterEach, beforeEach, describe, it } from "mocha";
import assert from "node:assert";
import { DECISIONES_BOT, type DecisionesBot } from "../../src/bots/decisionesBot.js";
import { despertarBots, PAUSA_BOT_MS } from "../../src/bots/despertarBots.js";
import type { SituacionBot } from "../../src/bots/situacionDelBot.js";
import { FaseJuego, FasePartida, FasePreconstruccion } from "../../src/common/enums.js";
import { manejarDestruccion } from "../../src/rooms/handlers/sala/destruirSala.js";
import type { CatanRoom } from "../../src/rooms/CatanRoom.js";
import { iniciarRelojAcciones } from "../../src/timers/acciones/iniciarRelojAcciones.js";
import { iniciarRelojDados } from "../../src/timers/dados/iniciarRelojDados.js";
import { iniciarRelojDescarte } from "../../src/timers/descarte/iniciarRelojDescarte.js";
import { iniciarRelojLadron } from "../../src/timers/ladron/iniciarRelojLadron.js";
import { iniciarRelojOferta } from "../../src/timers/oferta/iniciarRelojOferta.js";
import { iniciarRelojPreconstruccion } from "../../src/timers/preconstruccion/iniciarRelojPreconstruccion.js";
import { iniciarRelojRobo } from "../../src/timers/robo/iniciarRelojRobo.js";
import { armarReloj } from "../ayudas/relojFalso.js";
import { armarSala } from "../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const BOT = "bot-1";

const SITUACIONES: SituacionBot[] = [
  "asentamientoInicial", "dados", "acciones", "ladron", "robo", "descarte", "oferta"
];

//? Funcion que devuelve una sala con Angel y un bot, con un reloj falso en la sala para ver si se programa al bot
function armarConBot() {
  const armado = armarSala({ [ANGEL]: "Angel", [BOT]: "Kernel" });
  armado.jugadores.get(BOT)!.esBot = true;
  armado.partida.ordenJugadores.push(ANGEL, BOT);
  const { reloj, programados } = armarReloj();
  Object.assign(armado.sala, { clock: reloj });
  return { ...armado, reloj, programados };
}

//? Funcion que deja la sala en la situacion indicada para el bot
function ponerEnSituacion(sala: CatanRoom, situacion: SituacionBot) {
  const { partida } = sala;
  partida.fase = FasePartida.JUEGO;
  partida.turnoActual = BOT;

  switch (situacion) {
    case "asentamientoInicial":
      partida.fase = FasePartida.PRECONSTRUCCION;
      partida.fasePreconstruccion = FasePreconstruccion.ASENTAMIENTO;
      break;
    case "dados":
      partida.faseJuego = FaseJuego.DADOS;
      break;
    case "acciones":
      partida.faseJuego = FaseJuego.ACCIONES;
      break;
    case "ladron":
      partida.faseJuego = FaseJuego.LADRON;
      break;
    case "robo":
      partida.faseJuego = FaseJuego.ROBO;
      break;
    case "descarte":
      partida.faseJuego = FaseJuego.DESCARTE;
      partida.turnoActual = ANGEL;
      partida.jugadoresParaDescartar.set(BOT, 4);
      break;
    case "oferta":
      partida.faseJuego = FaseJuego.ACCIONES;
      partida.turnoActual = ANGEL;
      partida.ofertaIntercambio.jugador = ANGEL;
      partida.ofertaIntercambio.respuestas.set(BOT, 0);
      break;
  }
}

describe("bots junto a los relojes de la sala", () => {

  let originales: DecisionesBot;

  beforeEach(() => {
    originales = { ...DECISIONES_BOT };
    for (const situacion of Object.keys(DECISIONES_BOT) as SituacionBot[]) delete DECISIONES_BOT[situacion];
    for (const situacion of SITUACIONES) DECISIONES_BOT[situacion] = () => {};
  });

  afterEach(() => {
    for (const situacion of Object.keys(DECISIONES_BOT) as SituacionBot[]) delete DECISIONES_BOT[situacion];
    Object.assign(DECISIONES_BOT, originales);
  });

  describe("despiertan al bot cuando arranca el reloj de", () => {

    const relojes: [string, SituacionBot, (sala: CatanRoom) => void][] = [
      ["preconstruccion", "asentamientoInicial", iniciarRelojPreconstruccion],
      ["dados", "dados", iniciarRelojDados],
      ["acciones", "acciones", iniciarRelojAcciones],
      ["ladron", "ladron", iniciarRelojLadron],
      ["robo", "robo", iniciarRelojRobo],
      ["descarte", "descarte", iniciarRelojDescarte],
      ["oferta", "oferta", iniciarRelojOferta]
    ];

    for (const [nombre, situacion, iniciarReloj] of relojes) {
      it(nombre, () => {
        const { sala, programados } = armarConBot();
        ponerEnSituacion(sala, situacion);

        iniciarReloj(sala);

        assert.strictEqual(programados.length, 1);
        assert.strictEqual(programados[0].milisegundos, PAUSA_BOT_MS);
      });
    }

    it("acciones, aunque el reloj ya estuviera en marcha", () => {
      const { sala, programados } = armarConBot();
      ponerEnSituacion(sala, "acciones");
      sala.temporizador.estaActivo = () => true;

      iniciarRelojAcciones(sala);

      assert.strictEqual(programados.length, 1);
    });
  });

  describe("manejarDestruccion", () => {

    it("cancela lo que los bots tenian programado", () => {
      const { sala, reloj, programados } = armarConBot();
      ponerEnSituacion(sala, "acciones");
      despertarBots(sala, reloj);

      manejarDestruccion(sala);

      assert.strictEqual(programados[0].cancelado, true);
    });
  });
});
