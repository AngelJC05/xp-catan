import { describe, it } from "mocha";
import assert from "node:assert";
import { FasePartida, FasePreconstruccion } from "../../../src/common/enums.js";
import { TIEMPOS_POR_DEFECTO } from "../../../src/timers/tiempos.js";
import { iniciarRelojPreconstruccion } from "../../../src/timers/preconstruccion/iniciarRelojPreconstruccion.js";
import { ALAN, ANGEL, armarPreconstruccionConReloj, armarPreconstruccionEnCamino } from "../../ayudas/preconstruccionConReloj.js";

//? Funcion que cuenta los vertices que son de un jugador
function contarVertices(vertices: Iterable<{ propietario: string }>, sessionId: string) {
  let total = 0;
  for (const vertice of vertices) {
    if (vertice.propietario === sessionId) total++;
  }
  return total;
}

describe("reloj de preconstruccion al vencer en el paso del asentamiento", () => {

  it("coloca un asentamiento al jugador del turno", () => {
    const { sala, tablero, vencer } = armarPreconstruccionConReloj();
    iniciarRelojPreconstruccion(sala);

    vencer(0);

    assert.strictEqual(contarVertices(tablero.vertices.values(), ANGEL), 1);
    assert.strictEqual(contarVertices(tablero.vertices.values(), ALAN), 0);
  });

  it("guarda el asentamiento como el ultimo del jugador", () => {
    const { sala, jugadores, vencer } = armarPreconstruccionConReloj();
    iniciarRelojPreconstruccion(sala);

    vencer(0);

    assert.notStrictEqual(jugadores.get(ANGEL).ultimoAsentamiento, "");
  });

  it("pasa al paso del camino", () => {
    const { sala, partida, vencer } = armarPreconstruccionConReloj();
    iniciarRelojPreconstruccion(sala);

    vencer(0);

    assert.strictEqual(partida.fasePreconstruccion, FasePreconstruccion.CAMINO);
  });
});


describe("reloj de preconstruccion al vencer en el paso del camino", () => {

  it("coloca un camino al jugador del turno", () => {
    const { sala, tablero, vencer } = armarPreconstruccionEnCamino();
    iniciarRelojPreconstruccion(sala);

    vencer(0);

    assert.strictEqual(contarVertices(tablero.aristas.values(), ANGEL), 1);
    assert.strictEqual(contarVertices(tablero.aristas.values(), ALAN), 0);
  });

  it("no coloca otro asentamiento", () => {
    const { sala, tablero, vencer } = armarPreconstruccionEnCamino();
    iniciarRelojPreconstruccion(sala);

    vencer(0);

    assert.strictEqual(contarVertices(tablero.vertices.values(), ANGEL), 0);
  });

  it("pasa el turno al siguiente jugador", () => {
    const { sala, partida, vencer } = armarPreconstruccionEnCamino();
    iniciarRelojPreconstruccion(sala);

    vencer(0);

    assert.strictEqual(partida.turnoActual, ALAN);
  });

  it("vuelve al paso del asentamiento", () => {
    const { sala, partida, vencer } = armarPreconstruccionEnCamino();
    iniciarRelojPreconstruccion(sala);

    vencer(0);

    assert.strictEqual(partida.fasePreconstruccion, FasePreconstruccion.ASENTAMIENTO);
  });
});


describe("reloj de preconstruccion se reinicia despues de vencer", () => {

  it("programa otro reloj para el camino despues de colocar el asentamiento", () => {
    const { sala, programados, vencer } = armarPreconstruccionConReloj();
    iniciarRelojPreconstruccion(sala);

    vencer(0);

    assert.strictEqual(programados.length, 2);
    assert.strictEqual(programados[1].milisegundos, TIEMPOS_POR_DEFECTO.preconstruccion * 1000);
    assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), true);
  });

  it("programa otro reloj para el siguiente jugador despues de colocar el camino", () => {
    const { sala, programados, vencer } = armarPreconstruccionEnCamino();
    iniciarRelojPreconstruccion(sala);

    vencer(0);

    assert.strictEqual(programados.length, 2);
    assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), true);
  });

  it("no programa otro reloj cuando la preconstruccion termina", () => {
    const { sala, partida, programados, vencer } = armarPreconstruccionEnCamino();
    partida.direccionPreconstruccion = -1;
    iniciarRelojPreconstruccion(sala);

    vencer(0);

    assert.strictEqual(partida.fase, FasePartida.JUEGO);
    assert.strictEqual(programados.length, 1);
    assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), false);
  });
});
