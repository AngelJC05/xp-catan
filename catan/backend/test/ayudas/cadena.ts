import { Construccion } from "../../src/common/enums.js";
import { aristasDelVertice, extremosDeArista } from "../../src/functions/aristas.js";
import { hexagonosDelVertice } from "../../src/functions/hexagonosDelVertice.js";
import type { Tablero } from "../../src/schemas/Tablero.js";
import type { Vertice } from "../../src/schemas/Vertices.js";
import { armarSala } from "./salaFalsa.js";

//? Funcion que busca en el tablero (el indicado o uno nuevo) una cadena de 4 caminos seguidos: v0 - v1 - v2 - v3 - v4
//? Todos los vertices tocan 3 terrenos. Devuelve los 5 vertices y los 4 caminos, donde caminos[i] une vertices[i] con vertices[i + 1]
export function armarCadena(tableroExistente?: Tablero) {
  const tablero = tableroExistente ?? armarSala().tablero;

  function esInterior(vertice: string) {
    const objeto = tablero.vertices.get(vertice);
    return !!objeto && hexagonosDelVertice(tablero.hexagonos, objeto).length === 3;
  }

  //* Desde un vertice da un paso a un camino y vertice que existan, sin volver al anterior
  function paso(vertice: string, anterior: string | null) {
    for (const camino of aristasDelVertice(vertice)) {
      if (!tablero.aristas.has(camino)) continue;
      const [a, b] = extremosDeArista(camino);
      const siguiente = a === vertice ? b : a;
      if (siguiente !== anterior && esInterior(siguiente)) return { camino, siguiente };
    }
    return null;
  }

  for (const inicio of tablero.vertices.keys()) {
    if (!esInterior(inicio)) continue;

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

export type Cadena = ReturnType<typeof armarCadena>;

//? Funcion que pone una construccion de alguien en un vertice
export function construir(cadena: Cadena, vertice: string, sessionId: string) {
  cadena.tablero.vertices.get(vertice)?.setPropietario(sessionId);
  cadena.tablero.vertices.get(vertice)?.setConstruccion(Construccion.ASENTAMIENTO);
}

//? Funcion que pone un camino de alguien
export function trazar(cadena: Cadena, camino: string, sessionId: string) {
  cadena.tablero.aristas.get(camino)?.setPropietario(sessionId);
}

//? Funcion que le pone el mismo numero a todos los terrenos
export function fijarNumeros(cadena: Cadena, numero: number) {
  cadena.tablero.hexagonos.forEach((hexagono) => { hexagono.numero = numero; });
}

//? Funcion que hace relevantes a dos vertices vecinos: los terrenos que comparten pasan a ser 8
//? Con el resto de numeros en 0, solo esos dos vertices llegan al valor de interes
export function hacerRelevantes(cadena: Cadena, a: string, b: string) {
  const { tablero } = cadena;
  const delA = hexagonosDelVertice(tablero.hexagonos, tablero.vertices.get(a) as Vertice);
  const delB = hexagonosDelVertice(tablero.hexagonos, tablero.vertices.get(b) as Vertice);

  for (const hexagono of delA) {
    if (delB.some((otro) => otro.h === hexagono.h && otro.d === hexagono.d)) hexagono.numero = 8;
  }
}

//? Funcion que devuelve un vecino de un vertice que no sea el indicado
export function vecinoDe(cadena: Cadena, vertice: string, excepto: string): string {
  for (const camino of aristasDelVertice(vertice)) {
    if (!cadena.tablero.aristas.has(camino)) continue;
    const [a, b] = extremosDeArista(camino);
    const otro = a === vertice ? b : a;
    if (otro !== excepto && cadena.tablero.vertices.has(otro)) return otro;
  }

  throw new Error("El vertice no tiene otro vecino");
}

//? Funcion que le da un valor mediano a dos vertices vecinos: un solo terreno que comparten, y que no toca el vertice anterior, pasa a tener el numero
//? Con el numero 9 valen 4 y con el 8 valen 5; el vertice anterior queda en 0 para que no compita
export function hacerMedianos(cadena: Cadena, a: string, b: string, anterior: string, numero: number) {
  const { tablero } = cadena;
  const terrenosDe = (vertice: string) => hexagonosDelVertice(tablero.hexagonos, tablero.vertices.get(vertice) as Vertice);
  const mismo = (uno: { h: number, d: number }, otro: { h: number, d: number }) => uno.h === otro.h && uno.d === otro.d;

  const compartido = terrenosDe(a).find((terreno) =>
    terrenosDe(b).some((otro) => mismo(terreno, otro)) && !terrenosDe(anterior).some((otro) => mismo(terreno, otro)));

  if (!compartido) throw new Error("Los vertices no comparten un terreno que no toque el anterior");
  compartido.numero = numero;
}
