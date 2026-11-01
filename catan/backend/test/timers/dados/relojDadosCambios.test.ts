import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego, FasePartida } from "../../../src/common/enums.js";
import { Jugador } from "../../../src/schemas/Jugador.js";
import { iniciarRelojDados } from "../../../src/timers/dados/iniciarRelojDados.js";
import { iniciarRelojPreconstruccion } from "../../../src/timers/preconstruccion/iniciarRelojPreconstruccion.js";
import { manejarCaminoPreconstruccion } from "../../../src/rooms/handlers/construccion/caminoPreconstruccion.js";
import { manejarLanzarDados } from "../../../src/rooms/handlers/dados/lanzarDados.js";
import { manejarPasarTurno } from "../../../src/rooms/handlers/turno/pasarTurno.js";
import { manejarSalida } from "../../../src/rooms/handlers/sala/salirDeSala.js";
import { ALAN, ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";
import { armarPreconstruccionEnCamino } from "../../ayudas/preconstruccionConReloj.js";
import { armarCliente } from "../../ayudas/salaFalsa.js";

const LUIS = "jugadorLuis";

//? Funcion que devuelve la preconstruccion en su ultimo camino, el que la termina
function armarUltimoCamino() {
  const armado = armarPreconstruccionEnCamino();
  armado.partida.direccionPreconstruccion = -1;
  iniciarRelojPreconstruccion(armado.sala);
  return armado;
}

//? Funcion que devuelve el juego con tres jugadores, el turno de Angel y su reloj de dados en marcha
function armarJuegoConTresJugadores() {
  const armado = armarJuegoConReloj();
  armado.jugadores.set(LUIS, new Jugador("Luis"));
  armado.partida.ordenJugadores.push(LUIS);
  iniciarRelojDados(armado.sala);
  return armado;
}

describe("reloj de dados al terminar la preconstruccion", () => {

  it("inicia el reloj si el ultimo camino se coloca a mano", () => {
    const { sala, partida } = armarUltimoCamino();

    manejarCaminoPreconstruccion(sala, armarCliente(ANGEL).client, { h: 0, d: 0, p: 0 });

    assert.strictEqual(partida.faseJuego, FaseJuego.DADOS);
    assert.strictEqual(sala.temporizador.estaActivo("dados"), true);
  });

  it("inicia el reloj si el ultimo camino lo coloca el reloj de preconstruccion", () => {
    const { sala, partida, vencer } = armarUltimoCamino();

    vencer(0);

    assert.strictEqual(partida.fase, FasePartida.JUEGO);
    assert.strictEqual(sala.temporizador.estaActivo("dados"), true);
  });
});

describe("reloj de dados cuando el jugador tira a mano", () => {

  it("cancela el reloj", () => {
    const { sala, programados } = armarJuegoConReloj();
    iniciarRelojDados(sala);

    manejarLanzarDados(sala, armarCliente(ANGEL).client);

    assert.strictEqual(programados[0].cancelado, true);
    assert.strictEqual(sala.temporizador.estaActivo("dados"), false);
  });

  it("no toca el reloj si no era su turno", () => {
    const { sala, programados } = armarJuegoConReloj();
    iniciarRelojDados(sala);

    manejarLanzarDados(sala, armarCliente(ALAN).client);

    assert.strictEqual(programados[0].cancelado, false);
    assert.strictEqual(sala.temporizador.estaActivo("dados"), true);
  });
});

describe("reloj de dados al pasar el turno", () => {

  it("inicia el reloj para el siguiente jugador", () => {
    const { sala, partida } = armarJuegoConReloj();
    partida.faseJuego = FaseJuego.ACCIONES;

    manejarPasarTurno(sala, armarCliente(ANGEL).client);

    assert.strictEqual(partida.turnoActual, ALAN);
    assert.strictEqual(sala.temporizador.estaActivo("dados"), true);
  });
});

describe("reloj de dados cuando un jugador sale de la partida", () => {

  it("reinicia el reloj para el siguiente si sale el jugador del turno", () => {
    const { sala, partida, programados } = armarJuegoConTresJugadores();

    manejarSalida(sala, armarCliente(ANGEL).client);

    assert.strictEqual(partida.turnoActual, ALAN);
    assert.strictEqual(programados.length, 2);
    assert.strictEqual(programados[0].cancelado, true);
    assert.strictEqual(sala.temporizador.estaActivo("dados"), true);
  });

  it("deja el reloj como estaba si sale un jugador que no tenia el turno", () => {
    const { sala, programados } = armarJuegoConTresJugadores();

    manejarSalida(sala, armarCliente(LUIS).client);

    assert.strictEqual(programados.length, 1);
    assert.strictEqual(programados[0].cancelado, false);
  });

  it("cancela el reloj si la partida termina", () => {
    const { sala, partida, programados } = armarJuegoConReloj();
    iniciarRelojDados(sala);

    manejarSalida(sala, armarCliente(ALAN).client);

    assert.strictEqual(partida.fase, FasePartida.FINALIZADA);
    assert.strictEqual(programados[0].cancelado, true);
    assert.strictEqual(sala.temporizador.estaActivo("dados"), false);
  });
});
