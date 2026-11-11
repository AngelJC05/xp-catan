import { describe, it } from "mocha";
import assert from "node:assert";
import { verticesAlcanzables } from "../../../src/bots/metas/verticesAlcanzables.js";
import { Construccion } from "../../../src/common/enums.js";
import { aristasDelVertice, extremosDeArista } from "../../../src/functions/aristas.js";
import { armarSala } from "../../ayudas/salaFalsa.js";

const BOT = "bot-1";
const RIVAL = "jugadorRival";

//? Funcion que busca en el tablero una cadena de 4 caminos seguidos: v0 - v1 - v2 - v3 - v4
//? Devuelve los 5 vertices y los 4 caminos, donde caminos[i] une vertices[i] con vertices[i + 1]
function armarCadena() {
  const { tablero } = armarSala();

  //* Desde un vertice da un paso a un camino y vertice que existan, sin volver al anterior
  function paso(vertice: string, anterior: string | null) {
    for (const camino of aristasDelVertice(vertice)) {
      if (!tablero.aristas.has(camino)) continue;
      const [a, b] = extremosDeArista(camino);
      const siguiente = a === vertice ? b : a;
      if (siguiente !== anterior && tablero.vertices.has(siguiente)) return { camino, siguiente };
    }
    return null;
  }

  for (const inicio of tablero.vertices.keys()) {
    const vertices = [inicio];
    const caminos: string[] = [];

    for (let i = 0; i < 4; i++) {
      const dado = paso(vertices[i], vertices[i - 1] ?? null);
      if (!dado) break;
      caminos.push(dado.camino);
      vertices.push(dado.siguiente);
    }

    if (caminos.length === 4) return { tablero, vertices, caminos };
  }

  throw new Error("No se encontro una cadena de 4 caminos en el tablero");
}

type Cadena = ReturnType<typeof armarCadena>;

//? Funcion que pone una construccion de alguien en un vertice
function construir(cadena: Cadena, vertice: string, sessionId: string) {
  cadena.tablero.vertices.get(vertice)?.setPropietario(sessionId);
  cadena.tablero.vertices.get(vertice)?.setConstruccion(Construccion.ASENTAMIENTO);
}

//? Funcion que pone un camino de alguien
function trazar(cadena: Cadena, camino: string, sessionId: string) {
  cadena.tablero.aristas.get(camino)?.setPropietario(sessionId);
}

describe("vertices alcanzables", () => {

  it("sin construcciones ni caminos propios no alcanza nada", () => {
    const { tablero } = armarCadena();

    assert.strictEqual(verticesAlcanzables(tablero, BOT, 2).size, 0);
  });

  describe("desde una construccion", () => {

    it("su vertice esta a 0 caminos y cada paso por un camino libre suma 1", () => {
      const cadena = armarCadena();
      const [v0, v1, v2, v3] = cadena.vertices;
      construir(cadena, v0, BOT);

      const alcanzables = verticesAlcanzables(cadena.tablero, BOT, 2);

      assert.strictEqual(alcanzables.get(v0), 0);
      assert.strictEqual(alcanzables.get(v1), 1);
      assert.strictEqual(alcanzables.get(v2), 2);
      assert.strictEqual(alcanzables.has(v3), false);
    });

    it("respeta el maximo de caminos nuevos que se le pida", () => {
      const cadena = armarCadena();
      const [v0, v1, v2] = cadena.vertices;
      construir(cadena, v0, BOT);

      const hasta1 = verticesAlcanzables(cadena.tablero, BOT, 1);
      const hasta0 = verticesAlcanzables(cadena.tablero, BOT, 0);

      assert.strictEqual(hasta1.get(v1), 1);
      assert.strictEqual(hasta1.has(v2), false);
      assert.deepStrictEqual([...hasta0.keys()], [v0]);
    });
  });

  describe("desde un camino propio", () => {

    it("sus dos extremos estan a 0 caminos y el camino propio no cuenta como nuevo", () => {
      const cadena = armarCadena();
      const [v0, v1, v2, v3, v4] = cadena.vertices;
      trazar(cadena, cadena.caminos[1], BOT);

      const alcanzables = verticesAlcanzables(cadena.tablero, BOT, 2);

      assert.strictEqual(alcanzables.get(v1), 0);
      assert.strictEqual(alcanzables.get(v2), 0);
      assert.strictEqual(alcanzables.get(v0), 1);
      assert.strictEqual(alcanzables.get(v3), 1);
      assert.strictEqual(alcanzables.has(v4), true);
    });

    it("avanza por los caminos propios sin sumar", () => {
      const cadena = armarCadena();
      const [v0, , v2, v3] = cadena.vertices;
      construir(cadena, v0, BOT);
      trazar(cadena, cadena.caminos[0], BOT);
      trazar(cadena, cadena.caminos[1], BOT);

      const alcanzables = verticesAlcanzables(cadena.tablero, BOT, 2);

      assert.strictEqual(alcanzables.get(v2), 0);
      assert.strictEqual(alcanzables.get(v3), 1);
    });
  });

  it("toma el menor numero de caminos cuando hay dos formas de llegar", () => {
    const cadena = armarCadena();
    const [v0, v1] = cadena.vertices;
    construir(cadena, v0, BOT);
    trazar(cadena, cadena.caminos[1], BOT);

    const alcanzables = verticesAlcanzables(cadena.tablero, BOT, 2);

    assert.strictEqual(alcanzables.get(v1), 0);
  });

  describe("lo que bloquea el paso", () => {

    it("un camino de un rival no se puede usar", () => {
      const cadena = armarCadena();
      const [v0, v1, v2] = cadena.vertices;
      construir(cadena, v0, BOT);
      trazar(cadena, cadena.caminos[1], RIVAL);

      const alcanzables = verticesAlcanzables(cadena.tablero, BOT, 2);

      assert.strictEqual(alcanzables.get(v1), 1);
      assert.strictEqual(alcanzables.has(v2), false);
    });

    it("una construccion de un rival ni se alcanza ni deja seguir de largo", () => {
      const cadena = armarCadena();
      const [v0, v1, v2] = cadena.vertices;
      construir(cadena, v0, BOT);
      construir(cadena, v1, RIVAL);

      const alcanzables = verticesAlcanzables(cadena.tablero, BOT, 2);

      assert.strictEqual(alcanzables.get(v0), 0);
      assert.strictEqual(alcanzables.has(v1), false);
      assert.strictEqual(alcanzables.has(v2), false);
    });

    it("las piezas de los rivales no cuentan como puntos de partida", () => {
      const cadena = armarCadena();
      construir(cadena, cadena.vertices[0], RIVAL);
      trazar(cadena, cadena.caminos[2], RIVAL);

      assert.strictEqual(verticesAlcanzables(cadena.tablero, BOT, 2).size, 0);
    });
  });
});
