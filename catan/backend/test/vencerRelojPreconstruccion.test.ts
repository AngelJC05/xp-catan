import { describe, it } from "mocha";
import assert from "node:assert";
import { FasePartida, FasePreconstruccion } from "../src/common/enums.js";
import { Temporizador } from "../src/timers/Temporizador.js";
import { TIEMPOS_POR_DEFECTO } from "../src/timers/tiempos.js";
import { iniciarRelojPreconstruccion } from "../src/autoFunctions/iniciarRelojPreconstruccion.js";
import { armarReloj } from "./ayudas/relojFalso.js";
import { armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en preconstruccion con el temporizador
function armarPreconstruccionConReloj() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  const { reloj, vencer } = armarReloj();

  Object.assign(armado.sala, {
    temporizador: new Temporizador(reloj),
    tiempos: { ...TIEMPOS_POR_DEFECTO }
  });

  armado.partida.fase = FasePartida.PRECONSTRUCCION;
  armado.partida.fasePreconstruccion = FasePreconstruccion.ASENTAMIENTO;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;

  return { ...armado, vencer };
}

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
