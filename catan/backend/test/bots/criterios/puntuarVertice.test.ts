import { describe, it } from "mocha";
import assert from "node:assert";
import {
  VALOR_INTERES,
  esVerticeRelevante,
  puntosDelNumero,
  puntuarVertice
} from "../../../src/bots/criterios/puntuarVertice.js";
import { CatanState } from "../../../src/states/CatanState.js";

//? Funcion que devuelve un tablero completo con los numeros elegidos en algunos hexagonos
//? Las claves son las coordenadas del hexagono, por ejemplo "0,0"
function armarTablero(numeros: Record<string, number> = {}) {
  const tablero = new CatanState().tablero;
  Object.entries(numeros).forEach(([clave, numero]) => {
    tablero.hexagonos.get(clave).numero = numero;
  });
  return tablero;
}

//? Puntua el vertice con esa clave, por ejemplo "0,0,0"
function puntuar(tablero: ReturnType<typeof armarTablero>, clave: string) {
  return puntuarVertice(tablero.hexagonos, tablero.vertices.get(clave));
}

describe("puntos de cada numero de hexagono", () => {

  it("vale mas mientras mas probable es que salga el numero", () => {
    assert.strictEqual(puntosDelNumero(6), 5);
    assert.strictEqual(puntosDelNumero(8), 5);
    assert.strictEqual(puntosDelNumero(5), 4);
    assert.strictEqual(puntosDelNumero(9), 4);
    assert.strictEqual(puntosDelNumero(4), 3);
    assert.strictEqual(puntosDelNumero(10), 3);
    assert.strictEqual(puntosDelNumero(3), 2);
    assert.strictEqual(puntosDelNumero(11), 2);
    assert.strictEqual(puntosDelNumero(2), 1);
    assert.strictEqual(puntosDelNumero(12), 1);
  });

  it("el desierto no vale nada", () => {
    assert.strictEqual(puntosDelNumero(0), 0);
  });
});

describe("puntuar un vertice", () => {

  //* El vertice 0,0,0 toca los hexagonos 0,0 / 1,-1 / 0,-1
  it("suma los puntos de los tres hexagonos que toca", () => {
    const tablero = armarTablero({ "0,0": 6, "1,-1": 8, "0,-1": 5 });

    assert.strictEqual(puntuar(tablero, "0,0,0"), 14);
  });

  it("un hexagono del desierto no suma", () => {
    const tablero = armarTablero({ "0,0": 0, "1,-1": 9, "0,-1": 3 });

    assert.strictEqual(puntuar(tablero, "0,0,0"), 6);
  });

  //* El vertice 0,3,1 de la orilla solo toca el hexagono 0,2
  it("en la orilla solo suma los hexagonos que existen", () => {
    const tablero = armarTablero({ "0,2": 8 });

    assert.strictEqual(puntuar(tablero, "0,3,1"), 5);
  });

  //* El vertice 0,0,1 toca los hexagonos 0,0 / 0,-1 / -1,0
  it("puntua los vertices de abajo con sus propios hexagonos", () => {
    const tablero = armarTablero({ "0,0": 4, "0,-1": 10, "-1,0": 11, "1,-1": 6 });

    assert.strictEqual(puntuar(tablero, "0,0,1"), 8);
  });
});

describe("vertice que vale la pena", () => {

  it("la constante de interes es 6", () => {
    assert.strictEqual(VALOR_INTERES, 6);
  });

  it("vale la pena si llega justo a 6", () => {
    const tablero = armarTablero({ "0,0": 0, "1,-1": 9, "0,-1": 3 });

    assert.strictEqual(esVerticeRelevante(tablero.hexagonos, tablero.vertices.get("0,0,0")), true);
  });

  it("vale la pena si pasa de 6", () => {
    const tablero = armarTablero({ "0,0": 6, "1,-1": 8, "0,-1": 5 });

    assert.strictEqual(esVerticeRelevante(tablero.hexagonos, tablero.vertices.get("0,0,0")), true);
  });

  it("no vale la pena con numeros poco probables", () => {
    const tablero = armarTablero({ "0,0": 2, "1,-1": 12, "0,-1": 3 });

    assert.strictEqual(esVerticeRelevante(tablero.hexagonos, tablero.vertices.get("0,0,0")), false);
  });
});
