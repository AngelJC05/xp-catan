import { describe, it } from "mocha";
import assert from "node:assert";
import { accionConstruirCamino } from "../../../src/bots/acciones/accionConstruirCamino.js";
import { Construccion, FaseJuego } from "../../../src/common/enums.js";
import { ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";
import { armarCadena, construir, fijarNumeros, hacerRelevantes, trazar } from "../../ayudas/cadena.js";

const PRODUCE_TODO = new Set(["madera", "ladrillo", "trigo", "lana", "mineral"]);

//? Funcion que devuelve el juego en la fase de acciones de Angel, con los numeros del tablero en 0 y una cadena de vertices para armar casos
function armarEscenario() {
  const armado = armarJuegoConReloj();
  armado.partida.faseJuego = FaseJuego.ACCIONES;

  const cadena = armarCadena(armado.tablero);
  fijarNumeros(cadena, 0);

  return { ...armado, cadena, angel: armado.jugadores.get(ANGEL), vertices: cadena.vertices };
}

type Escenario = ReturnType<typeof armarEscenario>;

//? Funcion que le da recursos al jugador
function dar(escenario: Escenario, recursos: Record<string, number>) {
  for (const [recurso, cantidad] of Object.entries(recursos)) escenario.angel.recursos.set(recurso, cantidad);
}

function actuar(escenario: Escenario) {
  return accionConstruirCamino(escenario.sala, ANGEL, PRODUCE_TODO);
}

//? Funcion que cuenta los caminos del tablero que son de Angel
function caminosDeAngel(escenario: Escenario) {
  let total = 0;
  for (const arista of escenario.tablero.aristas.values()) {
    if (arista.propietario === ANGEL) total++;
  }
  return total;
}

describe("accion del bot de construir caminos", () => {

  //* El camino 0 es suyo y v3 y v4 valen la pena, a 2 caminos de distancia: su objetivo es un camino
  function armarCamino() {
    const escenario = armarEscenario();
    const [, , , v3, v4] = escenario.vertices;
    trazar(escenario.cadena, escenario.cadena.caminos[0], ANGEL);
    hacerRelevantes(escenario.cadena, v3, v4);
    return escenario;
  }

  it("construye un camino si su objetivo es un camino y le alcanzan los recursos", () => {
    const escenario = armarCamino();
    dar(escenario, { madera: 1, ladrillo: 1 });

    assert.strictEqual(actuar(escenario), true);
    assert.strictEqual(caminosDeAngel(escenario), 2);
  });

  it("cobra una madera y un ladrillo", () => {
    const escenario = armarCamino();
    dar(escenario, { madera: 2, ladrillo: 2 });

    actuar(escenario);

    assert.strictEqual(escenario.angel.recursos.get("madera"), 1);
    assert.strictEqual(escenario.angel.recursos.get("ladrillo"), 1);
  });

  it("no hace nada si le falta un recurso", () => {
    const escenario = armarCamino();
    dar(escenario, { madera: 1, ladrillo: 0 });

    assert.strictEqual(actuar(escenario), false);
    assert.strictEqual(caminosDeAngel(escenario), 1);
  });

  it("no hace nada si su objetivo es un poblado", () => {
    const escenario = armarEscenario();
    const [, v1, v2] = escenario.vertices;
    trazar(escenario.cadena, escenario.cadena.caminos[0], ANGEL);
    hacerRelevantes(escenario.cadena, v1, v2);
    dar(escenario, { madera: 1, ladrillo: 1 });

    assert.strictEqual(actuar(escenario), false);
    assert.strictEqual(caminosDeAngel(escenario), 1);
  });

  it("no hace nada si su objetivo es una ciudad", () => {
    const escenario = armarEscenario();
    construir(escenario.cadena, escenario.vertices[0], ANGEL);
    dar(escenario, { madera: 1, ladrillo: 1, mineral: 3, trigo: 2 });

    assert.strictEqual(actuar(escenario), false);
    assert.strictEqual(caminosDeAngel(escenario), 0);
  });

  it("no hace nada si ya no le quedan caminos por poner", () => {
    const escenario = armarCamino();
    dar(escenario, { madera: 1, ladrillo: 1 });
    escenario.angel.construccionesDisponibles.set(`${Construccion.CAMINO}`, 0);

    assert.strictEqual(actuar(escenario), false);
    assert.strictEqual(caminosDeAngel(escenario), 1);
  });
});
