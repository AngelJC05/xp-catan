import { describe, it } from "mocha";
import assert from "node:assert";
import { decidirLadron } from "../../../src/bots/decisiones/decidirLadron.js";
import { FaseJuego } from "../../../src/common/enums.js";
import { aplicarTirada } from "../../../src/rooms/acciones/dados/aplicarTirada.js";
import { ANGEL, armarJuegoConReloj, tiradaDe } from "../../ayudas/juegoConReloj.js";

//? Funcion que devuelve la partida en la fase del ladron: salio un 7 y nadie tenia que descartar
function armarLadron() {
  const armado = armarJuegoConReloj();
  aplicarTirada(armado.sala, tiradaDe(7));
  return armado;
}

describe("decision del bot con el ladron", () => {

  it("mueve al ladron a otro terreno", () => {
    const { sala, tablero } = armarLadron();
    const antes = `${tablero.ladron.h},${tablero.ladron.d}`;

    decidirLadron(sala, ANGEL);

    assert.notStrictEqual(`${tablero.ladron.h},${tablero.ladron.d}`, antes);
  });

  it("cancela el reloj humano del ladron", () => {
    const { sala, programados } = armarLadron();

    decidirLadron(sala, ANGEL);

    assert.strictEqual(programados[0].cancelado, true);
    assert.strictEqual(sala.temporizador.estaActivo("ladron"), false);
  });

  it("si no hay rivales junto al terreno pasa a la fase de acciones", () => {
    const { sala, partida } = armarLadron();

    decidirLadron(sala, ANGEL);

    assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
    assert.strictEqual(sala.temporizador.estaActivo("acciones"), true);
  });
});
