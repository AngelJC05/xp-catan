import { describe, it } from "mocha";
import assert from "node:assert";
import { decidirDescarte } from "../../../src/bots/decisiones/decidirDescarte.js";
import { Construccion, FaseJuego } from "../../../src/common/enums.js";
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

  //* Sin construcciones el objetivo del bot es una carta: lana, trigo y mineral
  it("se queda con lo que le sirve para su objetivo y descarta lo demas", () => {
    const armado = armarDescarte();
    const alan = armado.jugadores.get(ALAN);
    alan.recursos.set("madera", 6);
    alan.recursos.set("lana", 1);
    alan.recursos.set("trigo", 1);
    alan.recursos.set("mineral", 1);
    armado.partida.jugadoresParaDescartar.set(ALAN, 4);

    decidirDescarte(armado.sala, ALAN);

    assert.strictEqual(alan.recursos.get("madera"), 2);
    assert.strictEqual(alan.recursos.get("lana"), 1);
    assert.strictEqual(alan.recursos.get("trigo"), 1);
    assert.strictEqual(alan.recursos.get("mineral"), 1);
  });

  it("con un asentamiento su objetivo es la ciudad y cuida el mineral y el trigo", () => {
    const armado = armarDescarte();
    const alan = armado.jugadores.get(ALAN);
    const vertice = [...armado.tablero.vertices.values()][0];
    vertice.setPropietario(ALAN);
    vertice.setConstruccion(Construccion.ASENTAMIENTO);
    alan.recursos.set("mineral", 3);
    alan.recursos.set("trigo", 2);
    alan.recursos.set("madera", 2);
    alan.recursos.set("lana", 2);
    armado.partida.jugadoresParaDescartar.set(ALAN, 4);

    decidirDescarte(armado.sala, ALAN);

    assert.strictEqual(alan.recursos.get("mineral"), 3);
    assert.strictEqual(alan.recursos.get("trigo"), 2);
    assert.strictEqual(alan.recursos.get("madera"), 0);
    assert.strictEqual(alan.recursos.get("lana"), 0);
  });

  it("descarta parejo de lo que le sobra", () => {
    //* Luis tiene 4 lanas y 4 trigos y debe 4: le sobran 3 de cada uno para su carta
    const armado = armarDescarte();

    decidirDescarte(armado.sala, LUIS);

    assert.strictEqual(armado.jugadores.get(LUIS).recursos.get("lana"), 2);
    assert.strictEqual(armado.jugadores.get(LUIS).recursos.get("trigo"), 2);
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
