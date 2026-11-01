import { describe, it } from "mocha";
import assert from "node:assert";
import { FasePartida } from "../src/common/enums.js";
import { Jugador } from "../src/schemas/Jugador.js";
import { iniciarRelojPreconstruccion } from "../src/autoFunctions/iniciarRelojPreconstruccion.js";
import { manejarSalida } from "../src/rooms/handlers/sala/salirDeSala.js";
import { ALAN, ANGEL, armarPreconstruccionConReloj } from "./ayudas/preconstruccionConReloj.js";
import { armarCliente } from "./ayudas/salaFalsa.js";

const LUIS = "jugadorLuis";

//? Funcion que devuelve la preconstruccion con tres jugadores, el turno de Angel y su reloj en marcha
function armarPreconstruccionConTresJugadores() {
  const armado = armarPreconstruccionConReloj();
  armado.jugadores.set(LUIS, new Jugador("Luis"));
  armado.partida.ordenJugadores.push(LUIS);
  iniciarRelojPreconstruccion(armado.sala);
  return armado;
}

describe("reloj de preconstruccion cuando un jugador sale de la partida", () => {

  it("reinicia el reloj para el siguiente si sale el jugador del turno", () => {
    const { sala, partida, programados } = armarPreconstruccionConTresJugadores();

    manejarSalida(sala, armarCliente(ANGEL).client);

    assert.strictEqual(partida.turnoActual, ALAN);
    assert.strictEqual(programados.length, 2);
    assert.strictEqual(programados[0].cancelado, true);
    assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), true);
  });

  it("deja el reloj como estaba si sale un jugador que no tenia el turno", () => {
    const { sala, programados } = armarPreconstruccionConTresJugadores();

    manejarSalida(sala, armarCliente(LUIS).client);

    assert.strictEqual(programados.length, 1);
    assert.strictEqual(programados[0].cancelado, false);
    assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), true);
  });

  it("cancela el reloj si sale el jugador del turno y la partida termina", () => {
    const { sala, partida, programados } = armarPreconstruccionConReloj();
    iniciarRelojPreconstruccion(sala);

    manejarSalida(sala, armarCliente(ANGEL).client);

    assert.strictEqual(partida.fase, FasePartida.FINALIZADA);
    assert.strictEqual(programados[0].cancelado, true);
    assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), false);
  });

  it("cancela el reloj si sale otro jugador y la partida termina", () => {
    const { sala, partida, programados } = armarPreconstruccionConReloj();
    iniciarRelojPreconstruccion(sala);

    manejarSalida(sala, armarCliente(ALAN).client);

    assert.strictEqual(partida.fase, FasePartida.FINALIZADA);
    assert.strictEqual(programados[0].cancelado, true);
    assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), false);
  });
});
