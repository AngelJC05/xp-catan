import { describe, it } from "mocha";
import assert from "node:assert";
import { Construccion, Terreno } from "../../../src/common/enums.js";
import { elegirAsentamientoInicial, extraPorRecursosNuevos } from "../../../src/bots/criterios/asentamientoInicial.js";
import { hexagonosDelVertice } from "../../../src/functions/hexagonosDelVertice.js";
import { CatanState } from "../../../src/states/CatanState.js";

const BOT = "jugadorBot";

//* Vertices de prueba y los hexagonos que tocan:
//*   "0,0,0"  toca 0,0 / 1,-1 / 0,-1
//*   "0,3,1"  solo toca 0,2 (orilla)
//*   "2,-1,0" toca 2,-1 / 2,-2 (orilla)
//*   "-1,1,1" toca -1,1 / -1,0 / -2,1 (lejos de los demas)

//? Funcion que devuelve un tablero todo de madera y con numeros en 0, salvo lo que se elija
//? Cada cambio es la clave del hexagono con su terreno y su numero
function armarTablero(cambios: Record<string, [Terreno, number]> = {}) {
  const tablero = new CatanState().tablero;
  tablero.hexagonos.forEach((hexagono) => {
    hexagono.terreno = Terreno.MADERA;
    hexagono.numero = 0;
  });
  Object.entries(cambios).forEach(([clave, [terreno, numero]]) => {
    tablero.hexagonos.get(clave).terreno = terreno;
    tablero.hexagonos.get(clave).numero = numero;
  });
  return tablero;
}

type Tablero = ReturnType<typeof armarTablero>;

//? Pone un asentamiento del bot en un vertice
function construir(tablero: Tablero, vertice: string) {
  tablero.vertices.get(vertice).setPropietario(BOT);
  tablero.vertices.get(vertice).setConstruccion(Construccion.ASENTAMIENTO);
}

//? Indica si el vertice elegido toca ese hexagono
function toca(tablero: Tablero, vertice: string, hexagono: string) {
  return hexagonosDelVertice(tablero.hexagonos, tablero.vertices.get(vertice))
    .some((tocado) => `${tocado.h},${tocado.d}` === hexagono);
}

describe("extra por recursos nuevos en el segundo asentamiento", () => {

  it("el primer recurso nuevo suma 2 y cada uno de los siguientes suma 1", () => {
    assert.strictEqual(extraPorRecursosNuevos(0), 0);
    assert.strictEqual(extraPorRecursosNuevos(1), 2);
    assert.strictEqual(extraPorRecursosNuevos(2), 3);
    assert.strictEqual(extraPorRecursosNuevos(3), 4);
  });
});

describe("asentamiento inicial del bot", () => {

  it("el primero va en el vertice que mejor puntua", () => {
    //* 0,0,0 suma 5 + 4 + 3 = 12; ningun otro vertice toca los tres
    const tablero = armarTablero({
      "0,0": [Terreno.MADERA, 6],
      "1,-1": [Terreno.MADERA, 5],
      "0,-1": [Terreno.MADERA, 4]
    });

    assert.strictEqual(elegirAsentamientoInicial(tablero, BOT), "0,0,0");
  });

  it("el segundo prefiere un recurso nuevo aunque puntue un poco menos", () => {
    //* Por 0,2 tendria 5 puntos de madera, que ya tiene; por 2,-2 tendria 4 puntos de trigo nuevo (4 + 2)
    const tablero = armarTablero({
      "0,2": [Terreno.MADERA, 8],
      "2,-2": [Terreno.TRIGO, 5]
    });
    construir(tablero, "-1,1,1");

    const elegido = elegirAsentamientoInicial(tablero, BOT);
    assert.ok(toca(tablero, elegido, "2,-2"), `eligio ${elegido}`);
  });

  it("el segundo se queda con el mejor si el otro no da recursos nuevos", () => {
    const tablero = armarTablero({
      "0,2": [Terreno.MADERA, 8],
      "2,-2": [Terreno.MADERA, 5]
    });
    construir(tablero, "-1,1,1");

    const elegido = elegirAsentamientoInicial(tablero, BOT);
    assert.ok(toca(tablero, elegido, "0,2"), `eligio ${elegido}`);
  });

  it("el desierto no cuenta como recurso nuevo", () => {
    //* Por 0,2 tendria 5 puntos de madera; el desierto de 2,-2 no da nada aunque tenga numero
    const tablero = armarTablero({
      "0,2": [Terreno.MADERA, 8],
      "2,-2": [Terreno.DESIERTO, 0],
      "2,-1": [Terreno.MADERA, 9]
    });
    construir(tablero, "-1,1,1");

    const elegido = elegirAsentamientoInicial(tablero, BOT);
    assert.ok(toca(tablero, elegido, "0,2"), `eligio ${elegido}`);
  });

  it("solo elige vertices validos: libres y sin vecinos construidos", () => {
    const tablero = armarTablero({
      "0,0": [Terreno.MADERA, 6],
      "1,-1": [Terreno.MADERA, 5],
      "0,-1": [Terreno.MADERA, 4]
    });
    tablero.vertices.get("0,0,0").setPropietario("jugadorRival");
    tablero.vertices.get("0,0,0").setConstruccion(Construccion.ASENTAMIENTO);

    const elegido = elegirAsentamientoInicial(tablero, BOT);
    assert.notStrictEqual(elegido, "0,0,0");
    assert.notStrictEqual(elegido, "0,0,1");
  });

  it("en un empate elige el primer vertice valido", () => {
    //* Con todos los numeros en 0 todos los vertices valen lo mismo
    const tablero = armarTablero();

    assert.strictEqual(elegirAsentamientoInicial(tablero, BOT), [...tablero.vertices.keys()][0]);
  });

  it("devuelve vacio si no hay ningun vertice valido", () => {
    const tablero = armarTablero();
    tablero.vertices.clear();

    assert.strictEqual(elegirAsentamientoInicial(tablero, BOT), "");
  });
});
