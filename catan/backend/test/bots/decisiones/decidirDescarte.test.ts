import { describe, it } from "mocha";
import assert from "node:assert";
import { decidirDescarte } from "../../../src/bots/decisiones/decidirDescarte.js";
import { FaseJuego } from "../../../src/common/enums.js";
import { Jugador } from "../../../src/schemas/Jugador.js";
import { aplicarTirada } from "../../../src/rooms/acciones/dados/aplicarTirada.js";
import { ALAN, ANGEL, armarJuegoConReloj, tiradaDe } from "../../ayudas/juegoConReloj.js";

const LUIS = "jugadorLuis";

//? Funcion que devuelve la partida en descarte: salio un 7, Alan con 9 maderas debe 4 y Luis con 4 lanas y 4 trigos debe 4
function armarDescarte() {
  const armado = armarJuegoConReloj();
  armado.jugadores.set(LUIS, new Jugador("Luis"));
  armado.partida.ordenJugadores.push(LUIS);
  armado.jugadores.get(ALAN).recursos.set("madera", 9);
  armado.jugadores.get(LUIS).recursos.set("lana", 4);
  armado.jugadores.get(LUIS).recursos.set("trigo", 4);
  aplicarTirada(armado.sala, tiradaDe(7));
  return armado;
}

//? Suma todos los recursos de un jugador
function totalDe(armado: ReturnType<typeof armarDescarte>, sessionId: string) {
  let suma = 0;
  armado.jugadores.get(sessionId).recursos.forEach((cantidad) => { suma += cantidad; });
  return suma;
}

describe("decision del bot en el descarte", () => {

  it("descarta lo que debe el bot y no toca a los demas", () => {
    const armado = armarDescarte();

    decidirDescarte(armado.sala, ALAN);

    assert.strictEqual(totalDe(armado, ALAN), 5);
    assert.strictEqual(totalDe(armado, LUIS), 8);
    assert.strictEqual(armado.partida.jugadoresParaDescartar.has(ALAN), false);
    assert.strictEqual(armado.partida.jugadoresParaDescartar.has(LUIS), true);
  });

  it("deja correr el reloj de descarte mientras falte otro jugador", () => {
    const armado = armarDescarte();

    decidirDescarte(armado.sala, ALAN);

    assert.strictEqual(totalDe(armado, ALAN), 5);
    assert.strictEqual(armado.programados[0].cancelado, false);
    assert.strictEqual(armado.sala.temporizador.estaActivo("descarte"), true);
  });

  it("cuando el ultimo termina de descartar pasa al ladron y cancela el reloj", () => {
    const armado = armarDescarte();

    decidirDescarte(armado.sala, ALAN);
    decidirDescarte(armado.sala, LUIS);

    assert.strictEqual(armado.partida.faseJuego, FaseJuego.LADRON);
    assert.strictEqual(armado.sala.temporizador.estaActivo("descarte"), false);
  });

  it("no hace nada si el jugador no tiene que descartar", () => {
    const armado = armarDescarte();

    decidirDescarte(armado.sala, ANGEL);

    assert.strictEqual(totalDe(armado, ALAN), 9);
    assert.strictEqual(totalDe(armado, LUIS), 8);
  });
});
