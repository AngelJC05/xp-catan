import { describe, it } from "mocha";
import assert from "node:assert";
import { Construccion } from "../../../src/common/enums.js";
import { elegirMejorCamino } from "../../../src/bots/criterios/elegirMejorCamino.js";
import { CatanState } from "../../../src/states/CatanState.js";

const BOT = "jugadorBot";
const RIVAL = "jugadorRival";

//* El bot tiene su asentamiento en el centro (0,0,0); sus tres caminos posibles son:
//*   "0,0,0"  hacia el vertice 1,0,1  -> a 2 caminos: 1,0,0 y 0,1,0
//*   "0,0,1"  hacia el vertice 0,0,1  -> a 2 caminos: -1,1,0 y -1,0,0
//*   "1,-1,2" hacia el vertice 1,-1,1 -> a 2 caminos: 1,-1,0 y 0,-1,0
const ASENTAMIENTO = "0,0,0";
const POSIBLES = ["0,0,0", "0,0,1", "1,-1,2"];

//? Funcion que devuelve un tablero con el asentamiento del bot en el centro
//? Todos los hexagonos valen 0 salvo los numeros elegidos (claves como "2,-2")
function armarTablero(numeros: Record<string, number> = {}) {
  const tablero = new CatanState().tablero;
  tablero.hexagonos.forEach((hexagono) => { hexagono.numero = 0; });
  Object.entries(numeros).forEach(([clave, numero]) => {
    tablero.hexagonos.get(clave).numero = numero;
  });
  construir(tablero, ASENTAMIENTO, BOT);
  return tablero;
}

type Tablero = ReturnType<typeof armarTablero>;

//? Pone un asentamiento de un jugador en un vertice
function construir(tablero: Tablero, vertice: string, propietario: string) {
  tablero.vertices.get(vertice).setPropietario(propietario);
  tablero.vertices.get(vertice).setConstruccion(Construccion.ASENTAMIENTO);
}

//? Pone un camino de un jugador en una arista
function caminoDe(tablero: Tablero, arista: string, propietario: string) {
  tablero.aristas.get(arista).setPropietario(propietario);
}

describe("elegir el mejor camino para el bot", () => {

  it("elige el camino que lleva al vertice mejor puntuado", () => {
    //* El hexagono 2,-2 solo lo toca el vertice 1,-1,0, al que se llega por 1,-1,2
    const tablero = armarTablero({ "2,-2": 8, "-1,1": 3 });

    assert.strictEqual(elegirMejorCamino(tablero, BOT, POSIBLES), "1,-1,2");
  });

  it("cambia de camino si el mejor vertice esta en otra direccion", () => {
    //* El hexagono -1,1 solo lo toca el vertice -1,1,0, al que se llega por 0,0,1
    const tablero = armarTablero({ "-1,1": 6, "2,-2": 3 });

    assert.strictEqual(elegirMejorCamino(tablero, BOT, POSIBLES), "0,0,1");
  });

  it("no ve vertices a 3 caminos o mas", () => {
    //* El hexagono 2,0 solo lo tocan vertices a 3 caminos; aunque valga mas no cuenta
    const tablero = armarTablero({ "2,0": 8, "-1,1": 2 });

    assert.strictEqual(elegirMejorCamino(tablero, BOT, POSIBLES), "0,0,1");
  });

  it("no pasa por un camino de un rival", () => {
    const tablero = armarTablero({ "2,-2": 8, "-1,1": 2 });
    caminoDe(tablero, "1,-1,1", RIVAL);

    assert.strictEqual(elegirMejorCamino(tablero, BOT, POSIBLES), "0,0,1");
  });

  it("no apunta a un vertice pegado a una construccion, por la regla de distancia", () => {
    const tablero = armarTablero({ "2,-2": 8, "-1,1": 2 });
    construir(tablero, "2,-1,1", RIVAL);

    assert.strictEqual(elegirMejorCamino(tablero, BOT, POSIBLES), "0,0,1");
  });

  it("ante el mismo valor prefiere el vertice mas cercano", () => {
    //* Con un camino propio hacia 0,0,1 el bot puede seguir por 0,0,2 o por -1,0,0
    //* Por 0,0,2 llega a -1,1,0 en 1 camino; por -1,0,0 llega a -1,0,1 en 2 caminos; los dos valen 5
    const tablero = armarTablero({ "-1,1": 6, "-2,0": 8 });
    caminoDe(tablero, "0,0,1", BOT);

    assert.strictEqual(elegirMejorCamino(tablero, BOT, ["-1,0,0", "0,0,2"]), "0,0,2");
  });

  it("solo cuenta lo que esta hacia adelante del camino, no lo que queda atras", () => {
    //* Con un camino propio hacia 0,0,1, el camino -1,0,0 avanza hacia 0 puntos.
    //* El vertice -1,1,0 (5 puntos) queda atras, por el otro lado de 0,0,1; no cuenta para -1,0,0
    const tablero = armarTablero({ "-1,1": 6, "2,-2": 3 });
    caminoDe(tablero, "0,0,1", BOT);

    assert.strictEqual(elegirMejorCamino(tablero, BOT, ["-1,0,0", "1,-1,2"]), "1,-1,2");
  });

  it("ante el mismo valor y distancia elige el primero de la lista", () => {
    const tablero = armarTablero();

    assert.strictEqual(elegirMejorCamino(tablero, BOT, ["1,-1,2", "0,0,0"]), "1,-1,2");
  });

  it("devuelve vacio si no hay caminos posibles", () => {
    const tablero = armarTablero({ "2,-2": 8 });

    assert.strictEqual(elegirMejorCamino(tablero, BOT, []), "");
  });

  it("devuelve vacio si ningun camino lleva a un vertice donde se pueda construir", () => {
    //* Desde 1,-1,1 los dos caminos siguientes son del rival, y 1,-1,1 esta pegado al asentamiento
    const tablero = armarTablero({ "2,-2": 8 });
    caminoDe(tablero, "1,-1,1", RIVAL);
    caminoDe(tablero, "0,-1,0", RIVAL);

    assert.strictEqual(elegirMejorCamino(tablero, BOT, ["1,-1,2"]), "");
  });
});
