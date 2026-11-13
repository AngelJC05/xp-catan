import { describe, it } from "mocha";
import assert from "node:assert";
import { COSTOS, type TipoObjetivo } from "../../../src/bots/metas/costos.js";
import { objetivoDelBot, type Objetivo } from "../../../src/bots/metas/objetivoDelBot.js";
import { Construccion, Desarrollo } from "../../../src/common/enums.js";
import { Jugador } from "../../../src/schemas/Jugador.js";
import { armarCadena, construir, fijarNumeros, hacerRelevantes, trazar, vecinoDe } from "../../ayudas/cadena.js";

const BOT = "bot-1";
const RIVAL = "jugadorRival";

const TODOS = ["madera", "ladrillo", "trigo", "lana", "mineral"];

//? Funcion que arma la produccion con todos los recursos menos los indicados
function produciendoSin(...faltantes: string[]) {
  return new Set(TODOS.filter((recurso) => !faltantes.includes(recurso)));
}

//? Funcion que devuelve una cadena con todos los numeros en 0, para que ningun vertice valga la pena, y un jugador con todas sus piezas
function armarEscenario() {
  const cadena = armarCadena();
  fijarNumeros(cadena, 0);
  const jugador = new Jugador("Kernel");
  return { cadena, jugador, vertices: cadena.vertices };
}

type Escenario = ReturnType<typeof armarEscenario>;

//? Funcion que calcula el objetivo del bot en el escenario; por defecto produce todos los recursos
function calcular({ cadena, jugador }: Escenario, produccion = produciendoSin()) {
  return objetivoDelBot(cadena.tablero, jugador, BOT, produccion);
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

    it("va despues de un camino hacia un vertice relevante", () => {
      const escenario = armarEscenario();
      const [v0, , v2, v3] = escenario.vertices;
      construir(escenario.cadena, v0, BOT);
      hacerRelevantes(escenario.cadena, v2, v3);

      verificar(calcular(escenario), "camino", v2);
    });

    it("va despues de un poblado en un vertice relevante", () => {
      const escenario = armarEscenario();
      const [v0, , v2, v3] = escenario.vertices;
      construir(escenario.cadena, v0, BOT);
      trazar(escenario.cadena, escenario.cadena.caminos[0], BOT);
      trazar(escenario.cadena, escenario.cadena.caminos[1], BOT);
      hacerRelevantes(escenario.cadena, v2, v3);

      verificar(calcular(escenario), "poblado", v2);
    });

    it("va antes que un poblado pobre", () => {
      const escenario = armarEscenario();
      const [v0] = escenario.vertices;
      construir(escenario.cadena, v0, BOT);
      trazar(escenario.cadena, escenario.cadena.caminos[1], BOT);

      verificar(calcular(escenario), "ciudad", v0);
    });

    it("no es objetivo si no produce mineral: busca el poblado pobre", () => {
      const escenario = armarEscenario();
      const [v0, , v2] = escenario.vertices;
      construir(escenario.cadena, v0, BOT);
      trazar(escenario.cadena, escenario.cadena.caminos[1], BOT);

      verificar(calcular(escenario, produciendoSin("mineral")), "poblado", v2);
    });

    it("no es objetivo si no produce trigo", () => {
      const escenario = armarEscenario();
      construir(escenario.cadena, escenario.vertices[0], BOT);

      verificar(calcular(escenario, produciendoSin("trigo")), "carta");
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
      const [v0, v1, v2] = escenario.vertices;
      trazar(escenario.cadena, escenario.cadena.caminos[0], BOT);
      hacerRelevantes(escenario.cadena, v1, v2);
      verificar(calcular(escenario), "poblado", v1);

      construir(escenario.cadena, v2, RIVAL);

      verificar(calcular(escenario), "poblado", v0);
    });

    it("se salta el poblado si no produce uno de sus recursos", () => {
      const escenario = armarEscenario();
      const [, v1, v2] = escenario.vertices;
      trazar(escenario.cadena, escenario.cadena.caminos[0], BOT);
      hacerRelevantes(escenario.cadena, v1, v2);

      verificar(calcular(escenario, produciendoSin("trigo")), "carta");
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
      const [v0, , v2, v3] = escenario.vertices;
      //* Un rival pegado a v1 evita que ese vertice sea un poblado mejor que el camino
      construir(escenario.cadena, v0, RIVAL);
      trazar(escenario.cadena, escenario.cadena.caminos[0], BOT);
      hacerRelevantes(escenario.cadena, v2, v3);

      verificar(calcular(escenario), "camino", v2);
    });

    it("se salta el camino si no podria pagar el poblado al que lleva", () => {
      const escenario = armarEscenario();
      const [, , , v3, v4] = escenario.vertices;
      trazar(escenario.cadena, escenario.cadena.caminos[0], BOT);
      hacerRelevantes(escenario.cadena, v3, v4);

      verificar(calcular(escenario, produciendoSin("lana")), "carta");
    });

    it("no considera vertices a mas de 2 caminos nuevos", () => {
      const escenario = armarEscenario();
      const [v0, , , , v4] = escenario.vertices;
      construir(escenario.cadena, v0, RIVAL);
      trazar(escenario.cadena, escenario.cadena.caminos[0], BOT);
      hacerRelevantes(escenario.cadena, v4, vecinoDe(escenario.cadena, v4, escenario.vertices[3]));

      verificar(calcular(escenario), "carta");
    });
  });

  describe("carta", () => {

    it("es el objetivo si no hay nada que construir", () => {
      const escenario = armarEscenario();
      const v0 = escenario.vertices[0];
      construir(escenario.cadena, v0, RIVAL);
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

  describe("viabilidad con la banca y la abundancia", () => {

    //? Funcion que deja un asentamiento listo para ser ciudad, sin producir piedra, con los recursos indicados
    function armarCiudadSinPiedra(recursos: Record<string, number>, abundancia = 0) {
      const escenario = armarEscenario();
      construir(escenario.cadena, escenario.vertices[0], BOT);
      for (const [recurso, cantidad] of Object.entries(recursos)) escenario.jugador.recursos.set(recurso, cantidad);
      escenario.jugador.cartas_usables.set(`${Desarrollo.ABUNDANCIA}`, abundancia);
      return escenario;
    }

    const calcularSinPiedra = (escenario: Escenario) => calcular(escenario, produciendoSin("mineral"));

    it("mantiene la ciudad si le falta una piedra y le sobra lo de la tasa para cambiarla", () => {
      const escenario = armarCiudadSinPiedra({ mineral: 2, trigo: 2, madera: 4 });

      const objetivo = calcularSinPiedra(escenario);

      verificar(objetivo, "ciudad", escenario.vertices[0]);
      assert.deepStrictEqual(objetivo.falta, { mineral: 1 });
    });

    it("no la mantiene si no le sobra lo que pide la tasa", () => {
      const escenario = armarCiudadSinPiedra({ mineral: 2, trigo: 2, madera: 3 });

      verificar(calcularSinPiedra(escenario), "carta");
    });

    it("no la mantiene si le faltan 2 piedras y solo le alcanza para un cambio", () => {
      const escenario = armarCiudadSinPiedra({ mineral: 1, trigo: 2, madera: 4 });

      verificar(calcularSinPiedra(escenario), "carta");
    });

    it("la mantiene si con una carta de abundancia puede completar lo que le falta", () => {
      const escenario = armarCiudadSinPiedra({ mineral: 1, trigo: 2 }, 1);

      const objetivo = calcularSinPiedra(escenario);

      verificar(objetivo, "ciudad", escenario.vertices[0]);
      assert.deepStrictEqual(objetivo.falta, { mineral: 2 });
    });

    it("no la mantiene si le faltan 3 recursos aunque tenga la carta de abundancia", () => {
      const escenario = armarCiudadSinPiedra({ mineral: 0, trigo: 2 }, 1);

      verificar(calcularSinPiedra(escenario), "carta");
    });

    it("no la mantiene si le faltan recursos y no tiene la carta de abundancia", () => {
      const escenario = armarCiudadSinPiedra({ mineral: 1, trigo: 2 });

      verificar(calcularSinPiedra(escenario), "carta");
    });
  });
});
