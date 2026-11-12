import { describe, it } from "mocha";
import assert from "node:assert";
import { COSTOS, type TipoObjetivo } from "../../../src/bots/metas/costos.js";
import { objetivoDelBot, type Objetivo } from "../../../src/bots/metas/objetivoDelBot.js";
import { Construccion } from "../../../src/common/enums.js";
import { Jugador } from "../../../src/schemas/Jugador.js";
import { armarCadena, construir, fijarNumeros, hacerRelevantes, trazar, vecinoDe } from "../../ayudas/cadena.js";

const BOT = "bot-1";
const RIVAL = "jugadorRival";

//? Funcion que devuelve una cadena con todos los numeros en 0, para que ningun vertice valga la pena, y un jugador con todas sus piezas
function armarEscenario() {
  const cadena = armarCadena();
  fijarNumeros(cadena, 0);
  const jugador = new Jugador("Kernel");
  return { cadena, jugador, vertices: cadena.vertices };
}

type Escenario = ReturnType<typeof armarEscenario>;

//? Funcion que calcula el objetivo del bot en el escenario
function calcular({ cadena, jugador }: Escenario) {
  return objetivoDelBot(cadena.tablero, jugador, BOT);
}

//? Funcion que comprueba el tipo, el vertice y que el costo sea el de ese tipo
function verificar(objetivo: Objetivo, tipo: TipoObjetivo, vertice = "") {
  assert.strictEqual(objetivo.tipo, tipo);
  assert.strictEqual(objetivo.vertice, vertice);
  assert.deepStrictEqual(objetivo.costo, COSTOS[tipo]);
}

describe("objetivo del bot", () => {

  describe("ciudad", () => {

    it("es el objetivo si tiene un asentamiento y le quedan ciudades", () => {
      const escenario = armarEscenario();
      construir(escenario.cadena, escenario.vertices[0], BOT);

      verificar(calcular(escenario), "ciudad", escenario.vertices[0]);
    });

    it("va primero aunque haya un vertice relevante cerca", () => {
      const escenario = armarEscenario();
      const [v0, v1, v2] = escenario.vertices;
      construir(escenario.cadena, v0, BOT);
      hacerRelevantes(escenario.cadena, v1, v2);

      verificar(calcular(escenario), "ciudad", v0);
    });

    it("con varios asentamientos mejora el de mayor valor", () => {
      const escenario = armarEscenario();
      const [v0, , , , v4] = escenario.vertices;
      construir(escenario.cadena, v0, BOT);
      construir(escenario.cadena, v4, BOT);
      hacerRelevantes(escenario.cadena, v4, vecinoDe(escenario.cadena, v4, escenario.vertices[3]));

      verificar(calcular(escenario), "ciudad", v4);
    });

    it("si ya no le quedan ciudades pasa a lo siguiente", () => {
      const escenario = armarEscenario();
      construir(escenario.cadena, escenario.vertices[0], BOT);
      escenario.jugador.construccionesDisponibles.set(`${Construccion.CIUDAD}`, 0);

      verificar(calcular(escenario), "carta");
    });
  });

  describe("poblado", () => {

    it("es el objetivo si hay un vertice relevante ya conectado a un camino suyo", () => {
      const escenario = armarEscenario();
      const [, v1, v2] = escenario.vertices;
      trazar(escenario.cadena, escenario.cadena.caminos[0], BOT);
      hacerRelevantes(escenario.cadena, v1, v2);

      verificar(calcular(escenario), "poblado", v1);
    });

    it("se recalcula: si un rival construye pegado al vertice deja de ser el objetivo", () => {
      const escenario = armarEscenario();
      const [, v1, v2] = escenario.vertices;
      trazar(escenario.cadena, escenario.cadena.caminos[0], BOT);
      hacerRelevantes(escenario.cadena, v1, v2);
      verificar(calcular(escenario), "poblado", v1);

      construir(escenario.cadena, v2, RIVAL);

      verificar(calcular(escenario), "carta");
    });
  });

  describe("camino", () => {

    it("es el objetivo si hay un vertice relevante a 2 caminos nuevos", () => {
      const escenario = armarEscenario();
      const [, , , v3, v4] = escenario.vertices;
      trazar(escenario.cadena, escenario.cadena.caminos[0], BOT);
      hacerRelevantes(escenario.cadena, v3, v4);

      verificar(calcular(escenario), "camino", v3);
    });

    it("con dos vertices relevantes del mismo valor prefiere el mas cercano", () => {
      const escenario = armarEscenario();
      const [, , v2, v3] = escenario.vertices;
      trazar(escenario.cadena, escenario.cadena.caminos[0], BOT);
      hacerRelevantes(escenario.cadena, v2, v3);

      verificar(calcular(escenario), "camino", v2);
    });

    it("no considera vertices a mas de 2 caminos nuevos", () => {
      const escenario = armarEscenario();
      const v4 = escenario.vertices[4];
      trazar(escenario.cadena, escenario.cadena.caminos[0], BOT);
      hacerRelevantes(escenario.cadena, v4, vecinoDe(escenario.cadena, v4, escenario.vertices[3]));

      verificar(calcular(escenario), "carta");
    });
  });

  describe("carta", () => {

    it("es el objetivo si no hay ningun vertice relevante", () => {
      const escenario = armarEscenario();
      trazar(escenario.cadena, escenario.cadena.caminos[0], BOT);

      verificar(calcular(escenario), "carta");
    });
  });

  describe("falta y sobra", () => {

    it("devuelve lo que le falta y lo que le sobra para el objetivo", () => {
      const escenario = armarEscenario();
      const [, , , v3, v4] = escenario.vertices;
      trazar(escenario.cadena, escenario.cadena.caminos[0], BOT);
      hacerRelevantes(escenario.cadena, v3, v4);
      escenario.jugador.recursos.set("ladrillo", 3);

      const objetivo = calcular(escenario);

      verificar(objetivo, "camino", v3);
      assert.deepStrictEqual(objetivo.falta, { madera: 1 });
      assert.deepStrictEqual(objetivo.sobra, { ladrillo: 2 });
    });
  });
});
