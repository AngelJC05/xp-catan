import { describe, it } from "mocha";
import assert from "node:assert";
import { MapSchema } from "@colyseus/schema";
import { Construccion } from "../../../src/common/enums.js";
import { hexagonoParaLadron } from "../../../src/bots/criterios/hexagonoParaLadron.js";
import { Jugador } from "../../../src/schemas/Jugador.js";
import { CatanState } from "../../../src/states/CatanState.js";

const BOT = "jugadorBot";
const LIDER = "jugadorLider";
const OTRO = "jugadorOtro";

//* Vertices de prueba y los hexagonos que tocan:
//*   "0,0,0" toca 0,0 / 1,-1 / 0,-1      "0,3,1" solo toca 0,2
//*   "2,-1,0" toca 2,-1 / 3,-2 (no existe) / 2,-2

//? Funcion que devuelve un tablero con todos los hexagonos en 0 salvo los numeros elegidos
//? El ladron empieza en -2,0 para que no estorbe, salvo que se diga otra cosa
function armarTablero(numeros: Record<string, number> = {}, ladron = "-2,0") {
  const tablero = new CatanState().tablero;
  tablero.hexagonos.forEach((hexagono) => { hexagono.numero = 0; });
  Object.entries(numeros).forEach(([clave, numero]) => {
    tablero.hexagonos.get(clave).numero = numero;
  });
  const [h, d] = ladron.split(",").map(Number);
  tablero.ladron.h = h;
  tablero.ladron.d = d;
  return tablero;
}

type Tablero = ReturnType<typeof armarTablero>;

//? Funcion que devuelve los jugadores con sus puntos
function armarJugadores(puntos: Record<string, number> = { [BOT]: 0, [LIDER]: 5, [OTRO]: 2 }) {
  const jugadores = new MapSchema<Jugador>();
  Object.entries(puntos).forEach(([id, puntuacion]) => {
    const jugador = new Jugador(id);
    jugador.puntuacion = puntuacion;
    jugadores.set(id, jugador);
  });
  return jugadores;
}

//? Pone un asentamiento de un jugador en un vertice
function construir(tablero: Tablero, vertice: string, propietario: string) {
  tablero.vertices.get(vertice).setPropietario(propietario);
  tablero.vertices.get(vertice).setConstruccion(Construccion.ASENTAMIENTO);
}

describe("hexagono donde el bot pone al ladron", () => {

  it("sin rivales cerca elige el hexagono con el numero mas probable", () => {
    const tablero = armarTablero({ "2,-2": 8, "1,1": 4 });

    assert.deepStrictEqual(hexagonoParaLadron(tablero, armarJugadores(), BOT), [2, -2]);
  });

  it("nunca lo deja donde ya esta", () => {
    const tablero = armarTablero({ "2,-2": 8, "1,1": 4 }, "2,-2");

    assert.deepStrictEqual(hexagonoParaLadron(tablero, armarJugadores(), BOT), [1, 1]);
  });

  it("no lo pone en un hexagono con construcciones propias aunque valga mas", () => {
    const tablero = armarTablero({ "0,0": 8, "2,-2": 6 });
    construir(tablero, "0,0,0", BOT);

    assert.deepStrictEqual(hexagonoParaLadron(tablero, armarJugadores(), BOT), [2, -2]);
  });

  it("prefiere un hexagono del rival con mas puntos aunque valga menos", () => {
    const tablero = armarTablero({ "0,2": 2, "0,0": 8 });
    construir(tablero, "0,3,1", LIDER);
    construir(tablero, "0,0,0", OTRO);

    assert.deepStrictEqual(hexagonoParaLadron(tablero, armarJugadores(), BOT), [0, 2]);
  });

  it("entre los hexagonos del rival con mas puntos elige el mejor valuado", () => {
    const tablero = armarTablero({ "0,0": 3, "1,-1": 6, "2,-2": 8 });
    construir(tablero, "0,0,0", LIDER);

    assert.deepStrictEqual(hexagonoParaLadron(tablero, armarJugadores(), BOT), [1, -1]);
  });

  it("si dos rivales empatan en puntos, cuenta los hexagonos de los dos", () => {
    const tablero = armarTablero({ "0,2": 2, "0,0": 8 });
    construir(tablero, "0,3,1", LIDER);
    construir(tablero, "0,0,0", OTRO);

    const jugadores = armarJugadores({ [BOT]: 0, [LIDER]: 5, [OTRO]: 5 });
    assert.deepStrictEqual(hexagonoParaLadron(tablero, jugadores, BOT), [0, 0]);
  });

  it("no cuenta al propio bot como el de mas puntos", () => {
    const tablero = armarTablero({ "0,0": 8, "0,2": 2 });
    construir(tablero, "2,-1,0", BOT);
    construir(tablero, "0,3,1", LIDER);

    const jugadores = armarJugadores({ [BOT]: 9, [LIDER]: 5 });
    assert.deepStrictEqual(hexagonoParaLadron(tablero, jugadores, BOT), [0, 2]);
  });

  it("si todos los hexagonos tienen construcciones propias, igual elige uno", () => {
    const tablero = armarTablero({ "0,0": 3, "1,-1": 6 }, "0,-1");
    //* Solo quedan los tres hexagonos que toca el vertice 0,0,0, todos con el asentamiento del bot
    [...tablero.hexagonos.keys()]
      .filter((clave) => !["0,0", "1,-1", "0,-1"].includes(clave))
      .forEach((clave) => tablero.hexagonos.delete(clave));
    construir(tablero, "0,0,0", BOT);

    assert.deepStrictEqual(hexagonoParaLadron(tablero, armarJugadores(), BOT), [1, -1]);
  });
});
