import { describe, it } from "mocha";
import assert from "node:assert";
import { decidirPreconstruccion } from "../../../src/bots/decisiones/decidirPreconstruccion.js";
import { Construccion, FasePartida, FasePreconstruccion } from "../../../src/common/enums.js";
import { iniciarRelojPreconstruccion } from "../../../src/timers/preconstruccion/iniciarRelojPreconstruccion.js";
import { ALAN, ANGEL, armarPreconstruccionConReloj, armarPreconstruccionEnCamino } from "../../ayudas/preconstruccionConReloj.js";

//? Funcion que cuenta las piezas del tablero que son de un jugador
function contarPiezas(piezas: Iterable<{ propietario: string }>, sessionId: string) {
  let total = 0;
  for (const pieza of piezas) {
    if (pieza.propietario === sessionId) total++;
  }
  return total;
}

//? Funcion que devuelve el paso del camino con el asentamiento de Angel en el centro (0,0,0)
//? Todos los hexagonos valen 0 salvo los numeros elegidos; sus caminos posibles son 0,0,0 / 0,0,1 / 1,-1,2
function armarCaminoConNumeros(numeros: Record<string, number> = {}) {
  const armado = armarPreconstruccionEnCamino();
  const { tablero } = armado;

  tablero.hexagonos.forEach((hexagono) => { hexagono.numero = 0; });
  Object.entries(numeros).forEach(([clave, numero]) => {
    tablero.hexagonos.get(clave).numero = numero;
  });

  tablero.vertices.get("0,0,0").setPropietario(ANGEL);
  tablero.vertices.get("0,0,0").setConstruccion(Construccion.ASENTAMIENTO);
  return armado;
}

//? Las aristas que son de un jugador
function caminosDe(aristas: Map<string, { propietario: string }>, sessionId: string) {
  return [...aristas.entries()].filter(([, arista]) => arista.propietario === sessionId).map(([clave]) => clave);
}

describe("decision del bot en la preconstruccion", () => {

  describe("en el paso del asentamiento", () => {

    it("coloca un asentamiento al bot y no a los demas", () => {
      const { sala, tablero } = armarPreconstruccionConReloj();

      decidirPreconstruccion(sala, ANGEL);

      assert.strictEqual(contarPiezas(tablero.vertices.values(), ANGEL), 1);
      assert.strictEqual(contarPiezas(tablero.vertices.values(), ALAN), 0);
    });

    it("pasa al paso del camino", () => {
      const { sala, partida } = armarPreconstruccionConReloj();

      decidirPreconstruccion(sala, ANGEL);

      assert.strictEqual(partida.fasePreconstruccion, FasePreconstruccion.CAMINO);
    });

    it("reinicia el reloj humano para el paso del camino", () => {
      const { sala, programados } = armarPreconstruccionConReloj();
      iniciarRelojPreconstruccion(sala);

      decidirPreconstruccion(sala, ANGEL);

      assert.strictEqual(programados[0].cancelado, true);
      assert.strictEqual(programados.length, 2);
      assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), true);
    });
  });

  describe("en el paso del camino", () => {

    it("coloca un camino al bot y pasa el turno al siguiente jugador", () => {
      const { sala, partida, tablero } = armarPreconstruccionEnCamino();

      decidirPreconstruccion(sala, ANGEL);

      assert.strictEqual(contarPiezas(tablero.aristas.values(), ANGEL), 1);
      assert.strictEqual(partida.turnoActual, ALAN);
      assert.strictEqual(partida.fasePreconstruccion, FasePreconstruccion.ASENTAMIENTO);
    });

    it("pone el camino que lleva al vertice mejor puntuado", () => {
      //* El hexagono 2,-2 solo lo toca el vertice 1,-1,0, al que se llega por el camino 1,-1,2
      const { sala, tablero } = armarCaminoConNumeros({ "2,-2": 8, "-1,1": 3 });

      decidirPreconstruccion(sala, ANGEL);

      assert.deepStrictEqual(caminosDe(tablero.aristas, ANGEL), ["1,-1,2"]);
    });

    it("cambia de camino si el mejor vertice esta en otra direccion", () => {
      //* El hexagono -1,1 solo lo toca el vertice -1,1,0, al que se llega por el camino 0,0,1
      const { sala, tablero } = armarCaminoConNumeros({ "-1,1": 6, "2,-2": 3 });

      decidirPreconstruccion(sala, ANGEL);

      assert.deepStrictEqual(caminosDe(tablero.aristas, ANGEL), ["0,0,1"]);
    });

    it("si ningun camino lleva a un buen lugar, igual pone uno pegado a su asentamiento", () => {
      //* Los caminos rivales cierran todas las salidas a 2 caminos del asentamiento
      const { sala, tablero, partida } = armarCaminoConNumeros({ "2,-2": 8 });
      ["1,0,1", "1,0,2", "0,0,2", "-1,0,0", "1,-1,1", "0,-1,0"].forEach((arista) => {
        tablero.aristas.get(arista).setPropietario(ALAN);
      });

      decidirPreconstruccion(sala, ANGEL);

      const puestos = caminosDe(tablero.aristas, ANGEL);
      assert.strictEqual(puestos.length, 1);
      assert.ok(["0,0,0", "0,0,1", "1,-1,2"].includes(puestos[0]));
      assert.strictEqual(partida.turnoActual, ALAN);
    });

    it("reinicia el reloj humano para el siguiente jugador", () => {
      const { sala, programados } = armarPreconstruccionEnCamino();
      iniciarRelojPreconstruccion(sala);

      decidirPreconstruccion(sala, ANGEL);

      assert.strictEqual(programados[0].cancelado, true);
      assert.strictEqual(programados.length, 2);
      assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), true);
    });

    it("si era el ultimo camino, termina la preconstruccion y arranca el reloj de los dados", () => {
      const { sala, partida } = armarPreconstruccionEnCamino();
      partida.direccionPreconstruccion = -1;
      iniciarRelojPreconstruccion(sala);

      decidirPreconstruccion(sala, ANGEL);

      assert.strictEqual(partida.fase, FasePartida.JUEGO);
      assert.strictEqual(sala.temporizador.estaActivo("preconstruccion"), false);
      assert.strictEqual(sala.temporizador.estaActivo("dados"), true);
    });
  });
});
