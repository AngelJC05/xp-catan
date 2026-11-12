import { describe, it } from "mocha";
import assert from "node:assert";
import { esConstruible } from "../../../src/bots/criterios/esConstruible.js";
import { Construccion } from "../../../src/common/enums.js";
import { aristasDelVertice, extremosDeArista } from "../../../src/functions/aristas.js";
import { armarSala } from "../../ayudas/salaFalsa.js";

//? Funcion que devuelve un vertice del centro del tablero, con sus tres caminos y tres vecinos
function armarVerticeInterior() {
  const { tablero } = armarSala();
  const vertice = [...tablero.vertices.keys()].find((clave) =>
    aristasDelVertice(clave).every((arista) => tablero.aristas.has(arista))) as string;

  const vecinos = aristasDelVertice(vertice).map((arista) => {
    const [a, b] = extremosDeArista(arista);
    return a === vertice ? b : a;
  });

  return { tablero, vertice, vecinos };
}

//? Funcion que pone un asentamiento de alguien en un vertice
function construir(tablero: ReturnType<typeof armarVerticeInterior>["tablero"], vertice: string) {
  tablero.vertices.get(vertice)?.setPropietario("jugadorRival");
  tablero.vertices.get(vertice)?.setConstruccion(Construccion.ASENTAMIENTO);
}

describe("esConstruible", () => {

  it("un vertice libre con los vecinos libres se puede construir", () => {
    const { tablero, vertice } = armarVerticeInterior();

    assert.strictEqual(esConstruible(tablero, vertice), true);
  });

  it("un vertice que ya tiene construccion no se puede construir", () => {
    const { tablero, vertice } = armarVerticeInterior();
    construir(tablero, vertice);

    assert.strictEqual(esConstruible(tablero, vertice), false);
  });

  it("un vertice con una construccion en un vecino directo no se puede construir", () => {
    const { tablero, vertice, vecinos } = armarVerticeInterior();
    construir(tablero, vecinos[1]);

    assert.strictEqual(esConstruible(tablero, vertice), false);
  });

  it("una construccion a dos caminos de distancia no lo impide", () => {
    const { tablero, vertice, vecinos } = armarVerticeInterior();
    const lejano = aristasDelVertice(vecinos[0])
      .flatMap((arista) => extremosDeArista(arista))
      .find((clave) => clave !== vecinos[0] && clave !== vertice && tablero.vertices.has(clave)) as string;
    construir(tablero, lejano);

    assert.strictEqual(esConstruible(tablero, vertice), true);
  });

  it("un vertice que no existe en el tablero no se puede construir", () => {
    const { tablero } = armarVerticeInterior();

    assert.strictEqual(esConstruible(tablero, "99,99,0"), false);
  });
});
