import { describe, it } from "mocha";
import assert from "node:assert";
import { Partida } from "../src/schemas/Partida.js";
import { FaseJuego, FasePartida } from "../src/common/enums.js";
import {
  enFaseJuego,
  enFasePartida,
  esCreador,
  esSuTurno,
  partidaEnCurso
} from "../src/rooms/validaciones/guardias.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una partida de prueba en la fase de juego y con el turno de Angel
function armarPartida() {
  const partida = new Partida();
  partida.creador = ANGEL;
  partida.turnoActual = ANGEL;
  partida.fase = FasePartida.JUEGO;
  partida.faseJuego = FaseJuego.ACCIONES;
  return partida;
}

describe("guardias de partida y turno", () => {

  it("partidaEnCurso no da error mientras se juega", () => {
    const partida = armarPartida();

    assert.strictEqual(partidaEnCurso({ partida, sessionId: ANGEL }), null);
  });

  it("partidaEnCurso da error si la partida ya finalizo", () => {
    const partida = armarPartida();
    partida.fase = FasePartida.FINALIZADA;

    assert.strictEqual(partidaEnCurso({ partida, sessionId: ANGEL }), "La partida ha finalizado");
  });

  it("esSuTurno no da error si es el turno del jugador", () => {
    const partida = armarPartida();

    assert.strictEqual(esSuTurno({ partida, sessionId: ANGEL }), null);
  });

  it("esSuTurno da error si el turno es de otro jugador", () => {
    const partida = armarPartida();

    assert.strictEqual(esSuTurno({ partida, sessionId: ALAN }), "No es tu turno");
  });

  it("esCreador no da error si el jugador creo la sala", () => {
    const partida = armarPartida();

    assert.strictEqual(esCreador({ partida, sessionId: ANGEL }), null);
  });

  it("esCreador da error si el jugador no creo la sala", () => {
    const partida = armarPartida();

    assert.notStrictEqual(esCreador({ partida, sessionId: ALAN }), null);
  });

  it("enFasePartida no da error si la partida esta en esa fase", () => {
    const partida = armarPartida();

    assert.strictEqual(enFasePartida(FasePartida.JUEGO)({ partida, sessionId: ANGEL }), null);
  });

  it("enFasePartida da error si la partida esta en otra fase", () => {
    const partida = armarPartida();
    partida.fase = FasePartida.PRECONSTRUCCION;

    assert.notStrictEqual(enFasePartida(FasePartida.JUEGO)({ partida, sessionId: ANGEL }), null);
  });

  it("enFaseJuego no da error si el juego esta en esa fase", () => {
    const partida = armarPartida();

    assert.strictEqual(enFaseJuego(FaseJuego.ACCIONES)({ partida, sessionId: ANGEL }), null);
  });

  it("enFaseJuego da error si aun no se lanzaron los dados", () => {
    const partida = armarPartida();
    partida.faseJuego = FaseJuego.DADOS;

    assert.strictEqual(
      enFaseJuego(FaseJuego.ACCIONES)({ partida, sessionId: ANGEL }),
      "Debes lanzar los dados primero"
    );
  });

  it("enFaseJuego da error si ya se lanzaron los dados", () => {
    const partida = armarPartida();

    assert.strictEqual(
      enFaseJuego(FaseJuego.DADOS)({ partida, sessionId: ANGEL }),
      "Ya lanzaste los dados"
    );
  });

});
