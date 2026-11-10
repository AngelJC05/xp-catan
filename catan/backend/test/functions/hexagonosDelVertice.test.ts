import { describe, it } from "mocha";
import assert from "node:assert";
import { hexagonosDelVertice } from "../../src/functions/hexagonosDelVertice.js";
import { verticesDelHexagono } from "../../src/functions/verticesDelHexagono.js";
import { CatanState } from "../../src/states/CatanState.js";

//? Funcion que devuelve un tablero completo recien generado
function armarTablero() {
  return new CatanState().tablero;
}

//? Las coordenadas de los hexagonos que toca un vertice, ordenadas para compararlas
function coordenadasDe(tablero: ReturnType<typeof armarTablero>, clave: string) {
  return hexagonosDelVertice(tablero.hexagonos, tablero.vertices.get(clave))
    .map((hexagono) => `${hexagono.h},${hexagono.d}`)
    .sort();
}

describe("hexagonos que toca un vertice", () => {

  it("un vertice de arriba (p = 0) toca su hexagono, el de abajo a la derecha y el de abajo", () => {
    const tablero = armarTablero();

    assert.deepStrictEqual(coordenadasDe(tablero, "0,0,0"), ["0,-1", "0,0", "1,-1"]);
  });

  it("un vertice de abajo (p = 1) toca su hexagono, el de abajo y el de la izquierda", () => {
    const tablero = armarTablero();

    assert.deepStrictEqual(coordenadasDe(tablero, "0,0,1"), ["-1,0", "0,-1", "0,0"]);
  });

  it("en la orilla solo devuelve los hexagonos que existen", () => {
    const tablero = armarTablero();

    assert.deepStrictEqual(coordenadasDe(tablero, "0,3,1"), ["0,2"]);
    assert.deepStrictEqual(coordenadasDe(tablero, "-1,3,0"), ["-1,2", "0,2"]);
  });

  it("es lo contrario de los vertices de un hexagono en todo el tablero", () => {
    const tablero = armarTablero();

    tablero.hexagonos.forEach((hexagono) => {
      verticesDelHexagono(tablero.vertices, hexagono).forEach((vertice) => {
        const tocados = hexagonosDelVertice(tablero.hexagonos, vertice);
        assert.ok(
          tocados.includes(hexagono),
          `el vertice ${vertice.h},${vertice.d},${vertice.p} deberia tocar el hexagono ${hexagono.h},${hexagono.d}`
        );
      });
    });
  });

  it("ningun vertice toca mas de tres hexagonos ni se queda sin ninguno", () => {
    const tablero = armarTablero();

    tablero.vertices.forEach((vertice) => {
      const cantidad = hexagonosDelVertice(tablero.hexagonos, vertice).length;
      assert.ok(cantidad >= 1 && cantidad <= 3, `el vertice ${vertice.h},${vertice.d},${vertice.p} toca ${cantidad}`);
    });
  });
});
