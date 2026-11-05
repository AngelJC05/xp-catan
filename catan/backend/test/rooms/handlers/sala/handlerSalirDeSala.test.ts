import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida } from "../../../../src/common/enums.js";
import { manejarSalida } from "../../../../src/rooms/handlers/sala/salirDeSala.js";
import { armarCliente, armarSala } from "../../../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const LUIS = "jugadorLuis";

//? Funcion que devuelve una sala en lobby con tres jugadores, donde Angel es el creador
function armarLobby() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan", [LUIS]: "Luis" });
  armado.partida.ordenJugadores.push(ANGEL, ALAN, LUIS);
  armado.partida.creador = ANGEL;
  armado.sala.metadata = { alias: "Sala", anfitrion: "Angel" };
  return armado;
}

//? Funcion que devuelve una sala en juego con tres jugadores, donde Angel es el creador y tiene el turno
function armarJuego() {
  const armado = armarLobby();
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.turnoActual = ANGEL;
  return armado;
}

describe("handler de salir de la sala", () => {

  describe("en el lobby", () => {

    it("saca al jugador de los jugadores y del orden", () => {
      const { sala, partida, jugadores } = armarLobby();

      manejarSalida(sala, armarCliente(ALAN).client);

      assert.strictEqual(jugadores.has(ALAN), false);
      assert.deepStrictEqual([...partida.ordenJugadores], [ANGEL, LUIS]);
    });

    it("no cambia al creador si se va otro jugador", () => {
      const { sala, partida } = armarLobby();

      manejarSalida(sala, armarCliente(ALAN).client);

      assert.strictEqual(partida.creador, ANGEL);
      assert.deepStrictEqual(sala.metadata, { alias: "Sala", anfitrion: "Angel" });
    });

    it("si se va el creador, pasa al siguiente en el orden y se actualiza el anfitrion", () => {
      const { sala, partida } = armarLobby();

      manejarSalida(sala, armarCliente(ANGEL).client);

      assert.strictEqual(partida.creador, ALAN);
      assert.deepStrictEqual(sala.metadata, { alias: "Sala", anfitrion: "Alan" });
    });

    it("si se va el ultimo jugador no queda creador ni anfitrion", () => {
      const { sala, partida } = armarSala({ [ANGEL]: "Angel" });
      partida.ordenJugadores.push(ANGEL);
      partida.creador = ANGEL;
      sala.metadata = { alias: "Sala", anfitrion: "Angel" };

      manejarSalida(sala, armarCliente(ANGEL).client);

      assert.strictEqual(partida.creador, "");
      assert.deepStrictEqual(sala.metadata, { alias: "Sala", anfitrion: "" });
    });

    it("no escribe nada en el log", () => {
      const { sala, difundidos } = armarLobby();

      manejarSalida(sala, armarCliente(ALAN).client);

      assert.strictEqual(difundidos.length, 0);
    });

  });

  describe("durante la partida", () => {

    it("avisa en el log que el jugador abandono, con su nombre", () => {
      const { sala, difundidos } = armarJuego();

      manejarSalida(sala, armarCliente(ALAN).client);

      assert.deepStrictEqual(difundidos[0], {
        tipo: "log",
        mensaje: { jugador: "Alan", mensaje: " ha abandonado la partida" }
      });
    });

    it("saca al jugador de los jugadores y del orden", () => {
      const { sala, partida, jugadores } = armarJuego();

      manejarSalida(sala, armarCliente(ALAN).client);

      assert.strictEqual(jugadores.has(ALAN), false);
      assert.deepStrictEqual([...partida.ordenJugadores], [ANGEL, LUIS]);
    });

    it("devuelve sus recursos a la banca", () => {
      const { sala, jugadores, banca } = armarJuego();
      jugadores.get(ALAN).recursos.set("madera", 3);
      const antes = banca.recursos.get("madera");

      manejarSalida(sala, armarCliente(ALAN).client);

      assert.strictEqual(banca.recursos.get("madera"), antes + 3);
    });

    it("revisa el camino mas largo una vez, porque sus caminos desaparecen", () => {
      const { sala, estado } = armarJuego();

      manejarSalida(sala, armarCliente(ALAN).client);

      assert.strictEqual(estado.revisionesCamino, 1);
    });

    it("si se va quien tenia el turno, el turno pasa a otro jugador", () => {
      const { sala, partida } = armarJuego();

      manejarSalida(sala, armarCliente(ANGEL).client);

      assert.notStrictEqual(partida.turnoActual, ANGEL);
      assert.ok(partida.ordenJugadores.includes(partida.turnoActual));
    });

    it("si se va el creador, el anfitrion pasa al nuevo creador", () => {
      const { sala, partida } = armarJuego();

      manejarSalida(sala, armarCliente(ANGEL).client);

      assert.strictEqual(partida.creador, ALAN);
      assert.deepStrictEqual(sala.metadata, { alias: "Sala", anfitrion: "Alan" });
    });

    it("si se va otro jugador, el anfitrion no cambia", () => {
      const { sala } = armarJuego();

      manejarSalida(sala, armarCliente(ALAN).client);

      assert.deepStrictEqual(sala.metadata, { alias: "Sala", anfitrion: "Angel" });
    });

    it("si solo queda un jugador, la partida finaliza y gana por abandono", () => {
      const { sala, partida, difundidos } = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
      partida.ordenJugadores.push(ANGEL, ALAN);
      partida.creador = ANGEL;
      partida.fase = FasePartida.JUEGO;
      partida.turnoActual = ANGEL;

      manejarSalida(sala, armarCliente(ALAN).client);

      assert.strictEqual(partida.fase, FasePartida.FINALIZADA);
      assert.strictEqual(partida.ganador, ANGEL);
      assert.deepStrictEqual(difundidos[difundidos.length - 1], {
        tipo: "log",
        mensaje: { jugador: "Sistema: ", mensaje: "Angel gana por abandono..." }
      });
    });

    it("tambien funciona en la preconstruccion", () => {
      const { sala, partida, jugadores } = armarLobby();
      partida.fase = FasePartida.PRECONSTRUCCION;
      partida.turnoActual = ANGEL;

      manejarSalida(sala, armarCliente(LUIS).client);

      assert.strictEqual(jugadores.has(LUIS), false);
      assert.deepStrictEqual([...partida.ordenJugadores], [ANGEL, ALAN]);
    });

    it("con la partida finalizada tambien registra el abandono y saca al jugador", () => {
      const { sala, partida, jugadores, difundidos } = armarLobby();
      partida.fase = FasePartida.FINALIZADA;
      partida.ganador = ANGEL;

      manejarSalida(sala, armarCliente(ALAN).client);

      assert.strictEqual(jugadores.has(ALAN), false);
      assert.deepStrictEqual(difundidos[0], {
        tipo: "log",
        mensaje: { jugador: "Alan", mensaje: " ha abandonado la partida" }
      });
    });

  });

});
