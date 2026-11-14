import { describe, it } from "mocha";
import assert from "node:assert";
import { accionCarreteras } from "../../../src/bots/acciones/accionCarreteras.js";
import { Construccion, Desarrollo, FaseJuego } from "../../../src/common/enums.js";
import { ALAN, ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";
import { armarCadena, fijarNumeros, hacerRelevantes, trazar } from "../../ayudas/cadena.js";

//? Funcion que deja el juego en la fase de acciones de Angel con un camino suyo y dos vertices valiosos a 2 caminos, con la carta en la mano
function armarEscenario() {
  const armado = armarJuegoConReloj();
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.cartaJugable = true;

  const cadena = armarCadena(armado.tablero);
  fijarNumeros(cadena, 0);
  const [, , , v3, v4] = cadena.vertices;
  trazar(cadena, cadena.caminos[0], ANGEL);
  hacerRelevantes(cadena, v3, v4);

  const angel = armado.jugadores.get(ANGEL);
  angel.cartas_usables.set(`${Desarrollo.CARRETERA}`, 1);

  return { ...armado, angel };
}

describe("accion del bot de la carta de carreteras", () => {

  it("usa la carta si la tiene y hay un camino que lleva a un buen vertice", () => {
    const escenario = armarEscenario();

    assert.strictEqual(accionCarreteras(escenario.sala, ANGEL), true);
    assert.strictEqual(escenario.angel.cartas_usables.get(`${Desarrollo.CARRETERA}`), 0);
  });

  it("deja la partida en la fase de carreteras con dos caminos gratis", () => {
    const escenario = armarEscenario();

    accionCarreteras(escenario.sala, ANGEL);

    assert.strictEqual(escenario.partida.faseJuego, FaseJuego.CARRETERAS);
    assert.strictEqual(escenario.partida.carreterasGratis, 2);
    assert.strictEqual(escenario.partida.cartaJugable, false);
  });

  it("no la usa si no tiene la carta", () => {
    const escenario = armarEscenario();
    escenario.angel.cartas_usables.set(`${Desarrollo.CARRETERA}`, 0);

    assert.strictEqual(accionCarreteras(escenario.sala, ANGEL), false);
    assert.strictEqual(escenario.partida.faseJuego, FaseJuego.ACCIONES);
  });

  it("no la usa si ya uso otra carta este turno", () => {
    const escenario = armarEscenario();
    escenario.partida.cartaJugable = false;

    assert.strictEqual(accionCarreteras(escenario.sala, ANGEL), false);
    assert.strictEqual(escenario.angel.cartas_usables.get(`${Desarrollo.CARRETERA}`), 1);
  });

  it("no la usa si no es su turno", () => {
    const escenario = armarEscenario();
    escenario.partida.turnoActual = ALAN;

    assert.strictEqual(accionCarreteras(escenario.sala, ANGEL), false);
    assert.strictEqual(escenario.angel.cartas_usables.get(`${Desarrollo.CARRETERA}`), 1);
  });

  it("no la usa si no esta en la fase de acciones", () => {
    const escenario = armarEscenario();
    escenario.partida.faseJuego = FaseJuego.DADOS;

    assert.strictEqual(accionCarreteras(escenario.sala, ANGEL), false);
    assert.strictEqual(escenario.angel.cartas_usables.get(`${Desarrollo.CARRETERA}`), 1);
  });

  it("no la usa si ya no le quedan caminos por poner", () => {
    const escenario = armarEscenario();
    escenario.angel.construccionesDisponibles.set(`${Construccion.CAMINO}`, 0);

    assert.strictEqual(accionCarreteras(escenario.sala, ANGEL), false);
    assert.strictEqual(escenario.angel.cartas_usables.get(`${Desarrollo.CARRETERA}`), 1);
  });
});
