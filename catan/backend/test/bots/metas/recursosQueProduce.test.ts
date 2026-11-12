import { describe, it } from "mocha";
import assert from "node:assert";
import { recursosQueProduce } from "../../../src/bots/metas/recursosQueProduce.js";
import { Construccion, Terreno } from "../../../src/common/enums.js";
import { hexagonosDelVertice } from "../../../src/functions/hexagonosDelVertice.js";
import type { Vertice } from "../../../src/schemas/Vertices.js";
import { armarCadena, construir, fijarNumeros, type Cadena } from "../../ayudas/cadena.js";

const BOT = "bot-1";
const RIVAL = "jugadorRival";

//? Funcion que arma una cadena con numeros en 0 y devuelve los 3 terrenos que toca el primer vertice
function armarEscenario() {
  const cadena = armarCadena();
  fijarNumeros(cadena, 0);
  const vertice = cadena.vertices[0];
  const terrenos = hexagonosDelVertice(cadena.tablero.hexagonos, cadena.tablero.vertices.get(vertice) as Vertice);
  return { cadena, vertice, terrenos };
}

//? Funcion que le pone terreno y numero a un hexagono
function poner(hexagono: { terreno: Terreno, numero: number }, terreno: Terreno, numero: number) {
  hexagono.terreno = terreno;
  hexagono.numero = numero;
}

function produce(cadena: Cadena, sessionId = BOT) {
  return [...recursosQueProduce(cadena.tablero, sessionId)].sort();
}

describe("recursos que produce el bot", () => {

  it("sin construcciones no produce nada", () => {
    const { cadena } = armarEscenario();

    assert.deepStrictEqual(produce(cadena), []);
  });

  it("produce los recursos de los terrenos que toca su asentamiento", () => {
    const { cadena, vertice, terrenos } = armarEscenario();
    poner(terrenos[0], Terreno.MINERAL, 8);
    poner(terrenos[1], Terreno.TRIGO, 5);
    poner(terrenos[2], Terreno.LANA, 6);
    construir(cadena, vertice, BOT);

    assert.deepStrictEqual(produce(cadena), ["lana", "mineral", "trigo"]);
  });

  it("no cuenta los terrenos con 2, 3, 11 o 12", () => {
    const { cadena, vertice, terrenos } = armarEscenario();
    poner(terrenos[0], Terreno.MINERAL, 2);
    poner(terrenos[1], Terreno.TRIGO, 12);
    poner(terrenos[2], Terreno.LANA, 3);
    construir(cadena, vertice, BOT);

    assert.deepStrictEqual(produce(cadena), []);
  });

  it("cuenta desde el 4 y el 10", () => {
    const { cadena, vertice, terrenos } = armarEscenario();
    poner(terrenos[0], Terreno.MADERA, 4);
    poner(terrenos[1], Terreno.LADRILLO, 10);
    poner(terrenos[2], Terreno.LANA, 11);
    construir(cadena, vertice, BOT);

    assert.deepStrictEqual(produce(cadena), ["ladrillo", "madera"]);
  });

  it("el desierto no produce nada", () => {
    const { cadena, vertice, terrenos } = armarEscenario();
    poner(terrenos[0], Terreno.DESIERTO, 0);
    poner(terrenos[1], Terreno.TRIGO, 8);
    construir(cadena, vertice, BOT);

    assert.deepStrictEqual(produce(cadena), ["trigo"]);
  });

  it("una ciudad produce igual que un asentamiento", () => {
    const { cadena, vertice, terrenos } = armarEscenario();
    poner(terrenos[0], Terreno.MINERAL, 9);
    construir(cadena, vertice, BOT);
    cadena.tablero.vertices.get(vertice)?.setConstruccion(Construccion.CIUDAD);

    assert.deepStrictEqual(produce(cadena), ["mineral"]);
  });

  it("no cuenta las construcciones de un rival", () => {
    const { cadena, vertice, terrenos } = armarEscenario();
    poner(terrenos[0], Terreno.MINERAL, 8);
    construir(cadena, vertice, RIVAL);

    assert.deepStrictEqual(produce(cadena), []);
  });

  it("junta los recursos de todas sus construcciones", () => {
    const { cadena, vertice, terrenos } = armarEscenario();
    const lejano = cadena.vertices[4];
    const terrenosLejanos = hexagonosDelVertice(cadena.tablero.hexagonos, cadena.tablero.vertices.get(lejano) as Vertice);
    poner(terrenos[0], Terreno.MINERAL, 8);
    const propio = terrenosLejanos.find((hexagono) => !terrenos.includes(hexagono));
    assert.ok(propio, "el vertice lejano debe tocar un terreno distinto");
    poner(propio, Terreno.TRIGO, 6);
    construir(cadena, vertice, BOT);
    construir(cadena, lejano, BOT);

    assert.deepStrictEqual(produce(cadena), ["mineral", "trigo"]);
  });
});
