import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego } from "../../src/common/enums.js";
import { aplicarTirada } from "../../src/rooms/acciones/dados/aplicarTirada.js";
import { iniciarRelojAcciones } from "../../src/timers/acciones/iniciarRelojAcciones.js";
import { PAUSA_BOT_MS } from "../../src/bots/despertarBots.js";
import { iniciarRelojDados } from "../../src/timers/dados/iniciarRelojDados.js";
import { iniciarRelojPreconstruccion } from "../../src/timers/preconstruccion/iniciarRelojPreconstruccion.js";
import { Jugador } from "../../src/schemas/Jugador.js";
import { armarJuegoConReloj, tiradaDe } from "../ayudas/juegoConReloj.js";
import { ALAN, ANGEL, armarPreconstruccionConReloj } from "../ayudas/preconstruccionConReloj.js";
import { armarReloj } from "../ayudas/relojFalso.js";

const LUIS = "jugadorLuis";

//? Funcion que cuenta las piezas del tablero que son de un jugador
function contarPiezas(piezas: Iterable<{ propietario: string }>, sessionId: string) {
  let total = 0;
  for (const pieza of piezas) {
    if (pieza.propietario === sessionId) total++;
  }
  return total;
}

//? Funcion que le da a la sala un reloj propio para los bots y marca a esos jugadores como bots
function ponerBots<T extends { sala: object, jugadores: { get(id: string): { esBot: boolean } } }>(armado: T, ...ids: string[]) {
  const relojBot = armarReloj();
  Object.assign(armado.sala, { clock: relojBot.reloj });
  for (const id of ids) armado.jugadores.get(id).esBot = true;
  return relojBot;
}

describe("bots jugando con las decisiones reales", () => {

  describe("preconstruccion", () => {

    it("un bot coloca asentamiento y camino con una pausa antes de cada uno", () => {
      const armado = armarPreconstruccionConReloj();
      const { programados, vencer } = ponerBots(armado, ANGEL);

      iniciarRelojPreconstruccion(armado.sala);
      assert.strictEqual(programados.length, 1);

      vencer(0);
      assert.strictEqual(contarPiezas(armado.tablero.vertices.values(), ANGEL), 1);
      assert.strictEqual(programados.length, 2);

      vencer(1);
      assert.strictEqual(contarPiezas(armado.tablero.aristas.values(), ANGEL), 1);
      assert.strictEqual(armado.partida.turnoActual, ALAN);
    });

    it("no programa nada para el siguiente turno si es de un humano", () => {
      const armado = armarPreconstruccionConReloj();
      const { programados, vencer } = ponerBots(armado, ANGEL);
      iniciarRelojPreconstruccion(armado.sala);

      vencer(0);
      vencer(1);

      assert.strictEqual(programados.length, 2);
    });

    it("cuando el turno pasa de un bot a otro, el segundo se despierta solo", () => {
      const armado = armarPreconstruccionConReloj();
      const { programados, vencer } = ponerBots(armado, ANGEL, ALAN);
      iniciarRelojPreconstruccion(armado.sala);

      vencer(0);
      vencer(1);
      assert.strictEqual(programados.length, 3);

      vencer(2);
      assert.strictEqual(contarPiezas(armado.tablero.vertices.values(), ALAN), 1);
    });
  });

  describe("dados", () => {

    it("el bot tira los dados al despertar y cancela el reloj humano", () => {
      const armado = armarJuegoConReloj();
      const { programados, vencer } = ponerBots(armado, ANGEL);
      iniciarRelojDados(armado.sala);
      assert.strictEqual(programados.length, 1);

      vencer(0);

      const dados = armado.difundidos.filter((envio) => envio.tipo === "dados");
      assert.strictEqual(dados.length, 1);
      assert.notStrictEqual(armado.partida.faseJuego, FaseJuego.DADOS);
      assert.strictEqual(armado.programados[0].cancelado, true);
    });
  });

  describe("descarte", () => {

    it("solo descartan los bots, el humano conserva su tiempo", () => {
      const armado = armarJuegoConReloj();
      armado.jugadores.set(LUIS, new Jugador("Luis"));
      armado.partida.ordenJugadores.push(LUIS);
      armado.jugadores.get(ALAN).recursos.set("madera", 9);
      armado.jugadores.get(LUIS).recursos.set("lana", 8);
      const { programados, vencer } = ponerBots(armado, ALAN);

      aplicarTirada(armado.sala, tiradaDe(7));
      assert.strictEqual(programados.length, 1);

      vencer(0);

      assert.strictEqual(armado.partida.jugadoresParaDescartar.has(ALAN), false);
      assert.strictEqual(armado.partida.jugadoresParaDescartar.has(LUIS), true);
      assert.strictEqual(armado.sala.temporizador.estaActivo("descarte"), true);
    });
  });

  describe("acciones", () => {

    //? Funcion que deja el juego en la fase de acciones del turno de Angel con el reloj humano en marcha
    function armarEnAcciones() {
      const armado = armarJuegoConReloj();
      armado.partida.faseJuego = FaseJuego.ACCIONES;
      return armado;
    }

    it("el bot pasa el turno tras su pausa sin esperar el reloj humano de las acciones", () => {
      const armado = armarEnAcciones();
      const { programados, vencer } = ponerBots(armado, ANGEL);
      iniciarRelojAcciones(armado.sala);
      assert.strictEqual(programados.length, 1);
      assert.strictEqual(programados[0].milisegundos, PAUSA_BOT_MS);

      vencer(0);

      assert.strictEqual(armado.partida.turnoActual, ALAN);
      assert.strictEqual(armado.partida.faseJuego, FaseJuego.DADOS);
      assert.strictEqual(armado.sala.temporizador.estaActivo("acciones"), false);
    });

    it("si el siguiente jugador es un bot se despierta solo y tira los dados", () => {
      const armado = armarEnAcciones();
      const { programados, vencer } = ponerBots(armado, ANGEL, ALAN);
      iniciarRelojAcciones(armado.sala);

      vencer(0);
      assert.strictEqual(programados.length, 2);

      vencer(1);
      const dados = armado.difundidos.filter((envio) => envio.tipo === "dados");
      assert.strictEqual(dados.length, 1);
    });

    it("una partida solo de bots recorre todos los turnos sin bloquearse", () => {
      const armado = armarJuegoConReloj();
      armado.jugadores.set(LUIS, new Jugador("Luis"));
      armado.partida.ordenJugadores.push(LUIS);
      const { programados, vencer } = ponerBots(armado, ANGEL, ALAN, LUIS);
      iniciarRelojDados(armado.sala);

      const turnos = new Set<string>();
      for (let paso = 0; paso < 30; paso++) {
        assert.ok(programados.length > paso, `el bot se quedo sin accion en el paso ${paso}`);
        vencer(paso);
        turnos.add(armado.partida.turnoActual);
      }

      assert.deepStrictEqual([...turnos].sort(), [ALAN, ANGEL, LUIS].sort());
    });
  });
});
