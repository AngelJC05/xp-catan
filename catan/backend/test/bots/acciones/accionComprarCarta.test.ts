import { describe, it } from "mocha";
import assert from "node:assert";
import { accionComprarCarta } from "../../../src/bots/acciones/accionComprarCarta.js";
import { FaseJuego } from "../../../src/common/enums.js";
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
  return accionComprarCarta(escenario.sala, ANGEL, PRODUCE_TODO);
}

//? Funcion que cuenta las cartas de desarrollo que tiene el jugador sin usar
function cartasDelJugador(escenario: Escenario) {
  let total = 0;
  escenario.angel.cartas_inusables.forEach((cantidad) => { total += cantidad; });
  return total;
}

const CARTA = { mineral: 1, trigo: 1, lana: 1 };

describe("accion del bot de comprar cartas", () => {

  describe("cuando su objetivo es la carta", () => {

    it("compra una carta si le alcanzan los recursos", () => {
      const escenario = armarEscenario();
      dar(escenario, CARTA);
      const enMazo = escenario.banca.cartas.length;

      assert.strictEqual(actuar(escenario), true);
      assert.strictEqual(cartasDelJugador(escenario), 1);
      assert.strictEqual(escenario.banca.cartas.length, enMazo - 1);
    });

    it("cobra un mineral, un trigo y una lana", () => {
      const escenario = armarEscenario();
      dar(escenario, { mineral: 2, trigo: 2, lana: 2 });

      actuar(escenario);

      assert.strictEqual(escenario.angel.recursos.get("mineral"), 1);
      assert.strictEqual(escenario.angel.recursos.get("trigo"), 1);
      assert.strictEqual(escenario.angel.recursos.get("lana"), 1);
    });

    it("no compra si le falta un recurso", () => {
      const escenario = armarEscenario();
      dar(escenario, { mineral: 1, trigo: 1, lana: 0 });

      assert.strictEqual(actuar(escenario), false);
      assert.strictEqual(cartasDelJugador(escenario), 0);
    });

    it("no compra si el mazo esta vacio", () => {
      const escenario = armarEscenario();
      dar(escenario, CARTA);
      while (escenario.banca.cartas.length > 0) escenario.banca.cartas.shift();

      assert.strictEqual(actuar(escenario), false);
      assert.strictEqual(escenario.angel.recursos.get("mineral"), 1);
    });
  });

  describe("cuando su objetivo es otro", () => {

    //* El camino 0 une v0 y v1, y v1 y v2 valen la pena: el objetivo es un poblado en v1, al que le falta el ladrillo
    function armarPoblado() {
      const escenario = armarEscenario();
      const [, v1, v2] = escenario.vertices;
      trazar(escenario.cadena, escenario.cadena.caminos[0], ANGEL);
      hacerRelevantes(escenario.cadena, v1, v2);
      return escenario;
    }

    it("compra si despues de pagar la carta todavia le sobra para su poblado", () => {
      const escenario = armarPoblado();
      dar(escenario, { madera: 1, ladrillo: 0, trigo: 2, lana: 2, mineral: 1 });

      assert.strictEqual(actuar(escenario), true);
      assert.strictEqual(cartasDelJugador(escenario), 1);
    });

    it("no compra si la carta le quitaria trigo o lana de su poblado", () => {
      const escenario = armarPoblado();
      dar(escenario, { madera: 1, ladrillo: 0, trigo: 1, lana: 1, mineral: 1 });

      assert.strictEqual(actuar(escenario), false);
      assert.strictEqual(cartasDelJugador(escenario), 0);
    });

    it("compra si su objetivo es un camino, porque no usa los mismos recursos", () => {
      const escenario = armarEscenario();
      const [, , , v3, v4] = escenario.vertices;
      trazar(escenario.cadena, escenario.cadena.caminos[0], ANGEL);
      hacerRelevantes(escenario.cadena, v3, v4);
      dar(escenario, CARTA);

      assert.strictEqual(actuar(escenario), true);
    });

    it("no compra si la carta le quitaria la piedra o el trigo de su ciudad", () => {
      const escenario = armarEscenario();
      construir(escenario.cadena, escenario.vertices[0], ANGEL);
      dar(escenario, { mineral: 3, trigo: 2, lana: 1 });

      assert.strictEqual(actuar(escenario), false);
      assert.strictEqual(cartasDelJugador(escenario), 0);
    });
  });
});
