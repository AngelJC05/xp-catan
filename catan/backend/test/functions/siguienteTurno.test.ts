import { describe, it } from "mocha";
import assert from "node:assert";
import { siguienteTurno } from "../../src/functions/siguienteTurno.js";
import { Partida } from "../../src/schemas/Partida.js";

describe("siguienteTurno", () => {

  it("el siguiente jugador empieza sin ofertas propuestas en el turno", () => {
    const partida = new Partida();
    partida.ordenJugadores.push("jugadorA", "jugadorB");
    partida.turnoActual = "jugadorA";
    partida.ofertasDelTurno.push({ ofrecidos: { madera: 1 }, solicitados: { lana: 1 } });

    siguienteTurno(partida);

    assert.strictEqual(partida.turnoActual, "jugadorB");
    assert.deepStrictEqual(partida.ofertasDelTurno, []);
  });
});
