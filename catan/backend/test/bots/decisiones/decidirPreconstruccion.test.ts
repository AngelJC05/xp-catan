import { describe, it } from "mocha";
import assert from "node:assert";
import { decidirPreconstruccion } from "../../../src/bots/decisiones/decidirPreconstruccion.js";
import { FasePartida, FasePreconstruccion } from "../../../src/common/enums.js";
import { iniciarRelojPreconstruccion } from "../../../src/timers/preconstruccion/iniciarRelojPreconstruccion.js";
import { ALAN, ANGEL, armarPreconstruccionConReloj, armarPreconstruccionEnCamino } from "../../ayudas/preconstruccionConReloj.js";

//? Funcion que cuenta las piezas del tablero que son de un jugador
function contarPiezas(piezas: Iterable<{ propietario: string }>, sessionId: string) {
  let total = 0;
  for (const pieza of piezas) {
    if (pieza.propietario === sessionId) total++;
  }
  return total;
}

describe("decision del bot en la preconstruccion", () => {

  describe("en el paso del asentamiento", () => {

    it("coloca un asentamiento al bot y no a los demas", () => {
      const { sala, tablero } = armarPreconstruccionConReloj();

      decidirPreconstruccion(sala, ANGEL);

      assert.strictEqual(contarPiezas(tablero.vertices.values(), ANGEL), 1);
      assert.strictEqual(contarPiezas(tablero.vertices.values(), ALAN), 0);
    });

    it("pasa al paso del camino", () => {
      const { sala, partida } = armarPreconstruccionConReloj();

      decidirPreconstruccion(sala, ANGEL);

      assert.strictEqual(partida.fasePreconstruccion, FasePreconstruccion.CAMINO);
    });

    it("reinicia el reloj humano para el paso del camino", () => {
      const { sala, programados } = armarPreconstruccionConReloj();
      iniciarRelojPreconstruccion(sala);

      decidirPreconstruccion(sala, ANGEL);

      assert.strictEqual(programados[0].cancelado, true);
      assert.strictEqual(programados.length, 2);
      assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), true);
    });
  });

  describe("en el paso del camino", () => {

    it("coloca un camino al bot y pasa el turno al siguiente jugador", () => {
      const { sala, partida, tablero } = armarPreconstruccionEnCamino();

      decidirPreconstruccion(sala, ANGEL);

      assert.strictEqual(contarPiezas(tablero.aristas.values(), ANGEL), 1);
      assert.strictEqual(partida.turnoActual, ALAN);
      assert.strictEqual(partida.fasePreconstruccion, FasePreconstruccion.ASENTAMIENTO);
    });

    it("reinicia el reloj humano para el siguiente jugador", () => {
      const { sala, programados } = armarPreconstruccionEnCamino();
      iniciarRelojPreconstruccion(sala);

      decidirPreconstruccion(sala, ANGEL);

      assert.strictEqual(programados[0].cancelado, true);
      assert.strictEqual(programados.length, 2);
      assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), true);
    });

    it("si era el ultimo camino, termina la preconstruccion y arranca el reloj de los dados", () => {
      const { sala, partida } = armarPreconstruccionEnCamino();
      partida.direccionPreconstruccion = -1;
      iniciarRelojPreconstruccion(sala);

      decidirPreconstruccion(sala, ANGEL);

      assert.strictEqual(partida.fase, FasePartida.JUEGO);
      assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), false);
      assert.strictEqual(sala.temporizador.estaActivo("dados"), true);
    });
  });
});
