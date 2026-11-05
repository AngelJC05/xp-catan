import { describe, it } from "mocha";
import assert from "node:assert";
import { Construccion, FaseJuego, FasePartida, Terreno } from "../../../../src/common/enums.js";
import { recursoTexto } from "../../../../src/common/recursoTexto.js";
import { aplicarTirada } from "../../../../src/rooms/acciones/dados/aplicarTirada.js";
import type { Hexagono } from "../../../../src/schemas/Hexagono.js";
import { verticesDelHexagono } from "../../../../src/functions/verticesDelHexagono.js";
import { armarSala } from "../../../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una sala en juego, en la fase de dados
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.fase = FasePartida.JUEGO;
  armado.partida.faseJuego = FaseJuego.DADOS;
  armado.partida.ordenJugadores.push(ANGEL, ALAN);
  armado.partida.turnoActual = ANGEL;
  return armado;
}

//? Funcion que arma una tirada a partir de la suma
function tiradaDe(suma: number) {
  return { dado1: suma - 1, dado2: 1, suma };
}

describe("aplicar una tirada de dados", () => {

  it("avisa a todos el resultado de los dados", () => {
    const { sala, difundidos } = armarJuego();

    aplicarTirada(sala, { dado1: 3, dado2: 4, suma: 7 });

    assert.deepStrictEqual(difundidos, [
      { tipo: "dados", mensaje: { dado1: 3, dado2: 4, suma: 7 } }
    ]);
  });

  it("con 7 y sin nadie que descartar pasa a mover el ladron", () => {
    const { sala, partida } = armarJuego();

    aplicarTirada(sala, tiradaDe(7));

    assert.strictEqual(partida.faseJuego, FaseJuego.LADRON);
    assert.strictEqual(partida.jugadoresParaDescartar.size, 0);
  });

  it("con 7 manda a descartar la mitad a quien tiene mas de 7 recursos", () => {
    const { sala, partida, jugadores } = armarJuego();
    jugadores.get(ANGEL).recursos.set("madera", 9);
    jugadores.get(ALAN).recursos.set("madera", 7);

    aplicarTirada(sala, tiradaDe(7));

    assert.strictEqual(partida.faseJuego, FaseJuego.DESCARTE);
    assert.strictEqual(partida.jugadoresParaDescartar.get(ANGEL), 4);
    assert.strictEqual(partida.jugadoresParaDescartar.has(ALAN), false);
  });

  it("con 7 limpia los descartes pendientes de una tirada anterior", () => {
    const { sala, partida } = armarJuego();
    partida.jugadoresParaDescartar.set(ALAN, 3);

    aplicarTirada(sala, tiradaDe(7));

    assert.strictEqual(partida.jugadoresParaDescartar.size, 0);
  });

  it("con otro numero da el recurso a quien tiene un asentamiento en ese hexagono y pasa a acciones", () => {
    const { sala, partida, jugadores, tablero } = armarJuego();

    //* Se elige un hexagono con recurso, sin ladron, y se evita que otro comparta su numero
    const candidatos: Hexagono[] = [];
    tablero.hexagonos.forEach((hexagono) => {
      const tieneLadron = hexagono.h === tablero.ladron.h && hexagono.d === tablero.ladron.d;
      if (hexagono.terreno !== Terreno.DESIERTO && !tieneLadron) candidatos.push(hexagono);
    });
    
    const elegido = candidatos[0];
    tablero.hexagonos.forEach((hexagono) => {
      if (hexagono !== elegido && hexagono.numero === elegido.numero) hexagono.numero = 99;
    });

    const vertice = verticesDelHexagono(tablero.vertices, elegido)[0];
    vertice.setPropietario(ANGEL);
    vertice.setConstruccion(Construccion.ASENTAMIENTO);

    aplicarTirada(sala, tiradaDe(elegido.numero));

    assert.strictEqual(jugadores.get(ANGEL).recursos.get(recursoTexto(elegido.terreno)), 1);
    assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
  });

});
