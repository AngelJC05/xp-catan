import { describe, it } from "mocha";
import assert from "node:assert";
import { decidirCarreteras } from "../../../src/bots/decisiones/decidirCarreteras.js";
import { Construccion, FaseJuego } from "../../../src/common/enums.js";
import { ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";
import { armarCadena, fijarNumeros, hacerRelevantes, trazar } from "../../ayudas/cadena.js";

//? Funcion que deja a Angel en la fase de carreteras con dos caminos gratis, un camino suyo y dos vertices valiosos a 2 caminos
function armarEscenario() {
  const armado = armarJuegoConReloj();
  armado.partida.faseJuego = FaseJuego.CARRETERAS;
  armado.partida.carreterasGratis = 2;

  const cadena = armarCadena(armado.tablero);
  fijarNumeros(cadena, 0);
  const [, , , v3, v4] = cadena.vertices;
  trazar(cadena, cadena.caminos[0], ANGEL);
  hacerRelevantes(cadena, v3, v4);

  const angel = armado.jugadores.get(ANGEL);
  angel.recursos.set("madera", 0);
  angel.recursos.set("ladrillo", 0);

  return { ...armado, cadena, angel };
}

describe("decision del bot en la fase de carreteras", () => {

  it("construye un camino gratis hacia el mejor destino sin cobrar recursos", () => {
    const escenario = armarEscenario();

    decidirCarreteras(escenario.sala, ANGEL);

    assert.strictEqual(escenario.tablero.aristas.get(escenario.cadena.caminos[1])?.propietario, ANGEL);
    assert.strictEqual(escenario.angel.recursos.get("madera"), 0);
    assert.strictEqual(escenario.angel.recursos.get("ladrillo"), 0);
  });

  it("construye un solo camino por vez y sigue en la fase de carreteras", () => {
    const escenario = armarEscenario();

    decidirCarreteras(escenario.sala, ANGEL);

    assert.strictEqual(escenario.partida.carreterasGratis, 1);
    assert.strictEqual(escenario.partida.faseJuego, FaseJuego.CARRETERAS);
  });

  it("con el segundo camino vuelve a la fase de acciones", () => {
    const escenario = armarEscenario();

    decidirCarreteras(escenario.sala, ANGEL);
    decidirCarreteras(escenario.sala, ANGEL);

    assert.strictEqual(escenario.tablero.aristas.get(escenario.cadena.caminos[2])?.propietario, ANGEL);
    assert.strictEqual(escenario.partida.carreterasGratis, 0);
    assert.strictEqual(escenario.partida.faseJuego, FaseJuego.ACCIONES);
  });

  it("si ya no le quedan caminos por poner gasta el camino gratis para no atascarse", () => {
    const escenario = armarEscenario();
    escenario.angel.construccionesDisponibles.set(`${Construccion.CAMINO}`, 0);

    decidirCarreteras(escenario.sala, ANGEL);

    assert.strictEqual(escenario.partida.carreterasGratis, 1);
    assert.strictEqual(escenario.tablero.aristas.get(escenario.cadena.caminos[1])?.propietario, "");
  });
});
