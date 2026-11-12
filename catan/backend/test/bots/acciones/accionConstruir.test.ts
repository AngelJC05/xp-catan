import { describe, it } from "mocha";
import assert from "node:assert";
import { accionConstruir } from "../../../src/bots/acciones/accionConstruir.js";
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
  return accionConstruir(escenario.sala, ANGEL, PRODUCE_TODO);
}

function vertice(escenario: Escenario, clave: string) {
  return escenario.tablero.vertices.get(clave);
}

const POBLADO = { madera: 1, ladrillo: 1, trigo: 1, lana: 1 };
const CIUDAD = { mineral: 3, trigo: 2 };

describe("accion del bot de construir", () => {

  describe("poblado", () => {

    //* El camino 0 une v0 y v1, y v1 y v2 valen la pena: el objetivo es un poblado en v1
    function armarPoblado() {
      const escenario = armarEscenario();
      const [, v1, v2] = escenario.vertices;
      trazar(escenario.cadena, escenario.cadena.caminos[0], ANGEL);
      hacerRelevantes(escenario.cadena, v1, v2);
      return escenario;
    }

    it("construye el poblado de su objetivo si le alcanzan los recursos", () => {
      const escenario = armarPoblado();
      dar(escenario, POBLADO);

      assert.strictEqual(actuar(escenario), true);

      const construido = vertice(escenario, escenario.vertices[1]);
      assert.strictEqual(construido.propietario, ANGEL);
      assert.strictEqual(construido.constuccion, Construccion.ASENTAMIENTO);
    });

    it("cobra los recursos del poblado", () => {
      const escenario = armarPoblado();
      dar(escenario, POBLADO);

      actuar(escenario);

      for (const recurso of Object.keys(POBLADO)) assert.strictEqual(escenario.angel.recursos.get(recurso), 0);
    });

    it("no hace nada si le falta un recurso", () => {
      const escenario = armarPoblado();
      dar(escenario, { ...POBLADO, lana: 0 });

      assert.strictEqual(actuar(escenario), false);
      assert.strictEqual(vertice(escenario, escenario.vertices[1]).propietario, "");
      assert.strictEqual(escenario.angel.recursos.get("madera"), 1);
    });
  });

  describe("ciudad", () => {

    //* Con un asentamiento y ningun vertice que valga la pena, el objetivo es mejorarlo
    function armarCiudad() {
      const escenario = armarEscenario();
      construir(escenario.cadena, escenario.vertices[0], ANGEL);
      return escenario;
    }

    it("mejora a ciudad el asentamiento de su objetivo si le alcanzan los recursos", () => {
      const escenario = armarCiudad();
      dar(escenario, CIUDAD);

      assert.strictEqual(actuar(escenario), true);
      assert.strictEqual(vertice(escenario, escenario.vertices[0]).constuccion, Construccion.CIUDAD);
    });

    it("cobra los recursos de la ciudad", () => {
      const escenario = armarCiudad();
      dar(escenario, CIUDAD);

      actuar(escenario);

      assert.strictEqual(escenario.angel.recursos.get("mineral"), 0);
      assert.strictEqual(escenario.angel.recursos.get("trigo"), 0);
    });

    it("no hace nada si le falta un recurso", () => {
      const escenario = armarCiudad();
      dar(escenario, { mineral: 2, trigo: 2 });

      assert.strictEqual(actuar(escenario), false);
      assert.strictEqual(vertice(escenario, escenario.vertices[0]).constuccion, Construccion.ASENTAMIENTO);
    });
  });

  describe("preferencia", () => {

    it("si le alcanza para poblado y ciudad construye el poblado", () => {
      const escenario = armarEscenario();
      const [v0, , v2, v3] = escenario.vertices;
      construir(escenario.cadena, v0, ANGEL);
      trazar(escenario.cadena, escenario.cadena.caminos[1], ANGEL);
      hacerRelevantes(escenario.cadena, v2, v3);
      dar(escenario, { madera: 1, ladrillo: 1, lana: 1, trigo: 3, mineral: 3 });

      assert.strictEqual(actuar(escenario), true);
      assert.strictEqual(vertice(escenario, v2).constuccion, Construccion.ASENTAMIENTO);
      assert.strictEqual(vertice(escenario, v0).constuccion, Construccion.ASENTAMIENTO);
      assert.strictEqual(escenario.angel.recursos.get("mineral"), 3);
    });
  });

  describe("otros objetivos", () => {

    it("no hace nada si su objetivo es una carta", () => {
      const escenario = armarEscenario();
      dar(escenario, { ...POBLADO, ...CIUDAD });

      assert.strictEqual(actuar(escenario), false);
    });

    it("no hace nada si su objetivo es un camino", () => {
      const escenario = armarEscenario();
      const [, , , v3, v4] = escenario.vertices;
      trazar(escenario.cadena, escenario.cadena.caminos[0], ANGEL);
      hacerRelevantes(escenario.cadena, v3, v4);
      dar(escenario, { madera: 5, ladrillo: 5 });

      assert.strictEqual(actuar(escenario), false);
      assert.strictEqual(escenario.angel.recursos.get("madera"), 5);
    });
  });
});
