import { describe, it } from "mocha";
import assert from "node:assert";
import { Construccion, Desarrollo, FaseJuego, Terreno } from "../../src/common/enums.js";
import { hexagonosDelVertice } from "../../src/functions/hexagonosDelVertice.js";
import { aplicarTirada } from "../../src/rooms/acciones/dados/aplicarTirada.js";
import { iniciarRelojAcciones } from "../../src/timers/acciones/iniciarRelojAcciones.js";
import { PAUSA_BOT_MS } from "../../src/bots/despertarBots.js";
import { iniciarRelojDados } from "../../src/timers/dados/iniciarRelojDados.js";
import { iniciarRelojPreconstruccion } from "../../src/timers/preconstruccion/iniciarRelojPreconstruccion.js";
import { Jugador } from "../../src/schemas/Jugador.js";
import { armarJuegoConReloj, tiradaDe } from "../ayudas/juegoConReloj.js";
import { ALAN, ANGEL, armarPreconstruccionConReloj } from "../ayudas/preconstruccionConReloj.js";
import { armarCadena, construir, fijarNumeros, hacerRelevantes, trazar } from "../ayudas/cadena.js";
import { armarReloj } from "../ayudas/relojFalso.js";

const LUIS = "jugadorLuis";

//? Funcion que cuenta las piezas del tablero que son de un jugador
function contarPiezas(piezas: Iterable<{ propietario: string }>, sessionId: string) {
  let total = 0;
  for (const pieza of piezas) {
    if (pieza.propietario === sessionId) total++;
  }
  return total;
}

//? Funcion que le da a la sala un reloj propio para los bots y marca a esos jugadores como bots
function ponerBots<T extends { sala: object, jugadores: { get(id: string): { esBot: boolean } } }>(armado: T, ...ids: string[]) {
  const relojBot = armarReloj();
  Object.assign(armado.sala, { clock: relojBot.reloj });
  for (const id of ids) armado.jugadores.get(id).esBot = true;
  return relojBot;
}

describe("bots jugando con las decisiones reales", () => {

  describe("preconstruccion", () => {

    it("un bot coloca asentamiento y camino con una pausa antes de cada uno", () => {
      const armado = armarPreconstruccionConReloj();
      const { programados, vencer } = ponerBots(armado, ANGEL);

      iniciarRelojPreconstruccion(armado.sala);
      assert.strictEqual(programados.length, 1);

      vencer(0);
      assert.strictEqual(contarPiezas(armado.tablero.vertices.values(), ANGEL), 1);
      assert.strictEqual(programados.length, 2);

      vencer(1);
      assert.strictEqual(contarPiezas(armado.tablero.aristas.values(), ANGEL), 1);
      assert.strictEqual(armado.partida.turnoActual, ALAN);
    });

    it("no programa nada para el siguiente turno si es de un humano", () => {
      const armado = armarPreconstruccionConReloj();
      const { programados, vencer } = ponerBots(armado, ANGEL);
      iniciarRelojPreconstruccion(armado.sala);

      vencer(0);
      vencer(1);

      assert.strictEqual(programados.length, 2);
    });

    it("cuando el turno pasa de un bot a otro, el segundo se despierta solo", () => {
      const armado = armarPreconstruccionConReloj();
      const { programados, vencer } = ponerBots(armado, ANGEL, ALAN);
      iniciarRelojPreconstruccion(armado.sala);

      vencer(0);
      vencer(1);
      assert.strictEqual(programados.length, 3);

      vencer(2);
      assert.strictEqual(contarPiezas(armado.tablero.vertices.values(), ALAN), 1);
    });
  });

  describe("dados", () => {

    it("el bot tira los dados al despertar y cancela el reloj humano", () => {
      const armado = armarJuegoConReloj();
      const { programados, vencer } = ponerBots(armado, ANGEL);
      iniciarRelojDados(armado.sala);
      assert.strictEqual(programados.length, 1);

      vencer(0);

      const dados = armado.difundidos.filter((envio) => envio.tipo === "dados");
      assert.strictEqual(dados.length, 1);
      assert.notStrictEqual(armado.partida.faseJuego, FaseJuego.DADOS);
      assert.strictEqual(armado.programados[0].cancelado, true);
    });
  });

  describe("descarte", () => {

    it("solo descartan los bots, el humano conserva su tiempo", () => {
      const armado = armarJuegoConReloj();
      armado.jugadores.set(LUIS, new Jugador("Luis"));
      armado.partida.ordenJugadores.push(LUIS);
      armado.jugadores.get(ALAN).recursos.set("madera", 9);
      armado.jugadores.get(LUIS).recursos.set("lana", 8);
      const { programados, vencer } = ponerBots(armado, ALAN);

      aplicarTirada(armado.sala, tiradaDe(7));
      assert.strictEqual(programados.length, 1);

      vencer(0);

      assert.strictEqual(armado.partida.jugadoresParaDescartar.has(ALAN), false);
      assert.strictEqual(armado.partida.jugadoresParaDescartar.has(LUIS), true);
      assert.strictEqual(armado.sala.temporizador.estaActivo("descarte"), true);
    });
  });

  describe("acciones", () => {

    //? Funcion que deja el juego en la fase de acciones del turno de Angel con el reloj humano en marcha
    function armarEnAcciones() {
      const armado = armarJuegoConReloj();
      armado.partida.faseJuego = FaseJuego.ACCIONES;
      return armado;
    }

    it("el bot pasa el turno tras su pausa sin esperar el reloj humano de las acciones", () => {
      const armado = armarEnAcciones();
      const { programados, vencer } = ponerBots(armado, ANGEL);
      iniciarRelojAcciones(armado.sala);
      assert.strictEqual(programados.length, 1);
      assert.strictEqual(programados[0].milisegundos, PAUSA_BOT_MS);

      vencer(0);

      assert.strictEqual(armado.partida.turnoActual, ALAN);
      assert.strictEqual(armado.partida.faseJuego, FaseJuego.DADOS);
      assert.strictEqual(armado.sala.temporizador.estaActivo("acciones"), false);
    });

    it("si el siguiente jugador es un bot se despierta solo y tira los dados", () => {
      const armado = armarEnAcciones();
      const { programados, vencer } = ponerBots(armado, ANGEL, ALAN);
      iniciarRelojAcciones(armado.sala);

      vencer(0);
      assert.strictEqual(programados.length, 2);

      vencer(1);
      const dados = armado.difundidos.filter((envio) => envio.tipo === "dados");
      assert.strictEqual(dados.length, 1);
    });

    it("una partida solo de bots recorre todos los turnos sin bloquearse", () => {
      const armado = armarJuegoConReloj();
      armado.jugadores.set(LUIS, new Jugador("Luis"));
      armado.partida.ordenJugadores.push(LUIS);
      const { programados, vencer } = ponerBots(armado, ANGEL, ALAN, LUIS);
      iniciarRelojDados(armado.sala);

      const turnos = new Set<string>();
      for (let paso = 0; paso < 30; paso++) {
        assert.ok(programados.length > paso, `el bot se quedo sin accion en el paso ${paso}`);
        vencer(paso);
        turnos.add(armado.partida.turnoActual);
      }

      assert.deepStrictEqual([...turnos].sort(), [ALAN, ANGEL, LUIS].sort());
    });
  });

  describe("construccion", () => {

    //? Funcion que deja a Angel con asentamientos en los dos extremos de una cadena de vertices; el primero produce mineral y trigo
    function armarConAsentamientos() {
      const armado = armarJuegoConReloj();
      armado.partida.faseJuego = FaseJuego.ACCIONES;

      const cadena = armarCadena(armado.tablero);
      fijarNumeros(cadena, 0);
      const [inicio, , , , fin] = cadena.vertices;
      construir(cadena, inicio, ANGEL);
      construir(cadena, fin, ANGEL);

      const [mineral, trigo] = hexagonosDelVertice(armado.tablero.hexagonos, armado.tablero.vertices.get(inicio));
      mineral.terreno = Terreno.MINERAL;
      mineral.numero = 8;
      trigo.terreno = Terreno.TRIGO;
      trigo.numero = 6;

      return { ...armado, ciudades: () => contarCiudades(armado.tablero.vertices.values()) };
    }

    //? Funcion que cuenta las ciudades del bot
    function contarCiudades(vertices: Iterable<{ propietario: string, constuccion: number }>) {
      let total = 0;
      for (const vertice of vertices) {
        if (vertice.propietario === ANGEL && vertice.constuccion === Construccion.CIUDAD) total++;
      }
      return total;
    }

    it("el bot mejora una ciudad por cada despertar y despues pasa el turno", () => {
      const armado = armarConAsentamientos();
      const jugador = armado.jugadores.get(ANGEL);
      jugador.recursos.set("mineral", 6);
      jugador.recursos.set("trigo", 4);
      const { programados, vencer } = ponerBots(armado, ANGEL);
      iniciarRelojAcciones(armado.sala);

      vencer(0);
      assert.strictEqual(armado.ciudades(), 1);
      assert.strictEqual(armado.partida.turnoActual, ANGEL);
      assert.strictEqual(programados.length, 2);

      vencer(1);
      assert.strictEqual(armado.ciudades(), 2);
      assert.strictEqual(armado.partida.turnoActual, ANGEL);

      vencer(2);
      assert.strictEqual(armado.partida.turnoActual, ALAN);
      assert.strictEqual(armado.partida.faseJuego, FaseJuego.DADOS);
    });

    it("si no le alcanzan los recursos no construye y pasa el turno", () => {
      const armado = armarConAsentamientos();
      armado.jugadores.get(ANGEL).recursos.set("mineral", 2);
      const { vencer } = ponerBots(armado, ANGEL);
      iniciarRelojAcciones(armado.sala);

      vencer(0);

      assert.strictEqual(armado.ciudades(), 0);
      assert.strictEqual(armado.partida.turnoActual, ALAN);
    });
  });

  describe("compra de cartas", () => {

    //? Funcion que deja el juego en la fase de acciones de Angel, sin construcciones, para que su objetivo sea la carta
    function armarSinConstrucciones(recursos: number) {
      const armado = armarJuegoConReloj();
      armado.partida.faseJuego = FaseJuego.ACCIONES;

      const jugador = armado.jugadores.get(ANGEL);
      for (const recurso of ["mineral", "trigo", "lana"]) jugador.recursos.set(recurso, recursos);

      return { ...armado, cartas: () => contarCartas(jugador.cartas_inusables.values()) + contarCartas(jugador.cartas_usables.values()) };
    }

    //? Funcion que suma las cantidades de cartas; al pasar el turno las compradas pasan de inusables a usables
    function contarCartas(cantidades: Iterable<number>) {
      let total = 0;
      for (const cantidad of cantidades) total += cantidad;
      return total;
    }

    it("el bot compra una carta por cada despertar mientras le alcance y despues pasa el turno", () => {
      const armado = armarSinConstrucciones(2);
      const { programados, vencer } = ponerBots(armado, ANGEL);
      iniciarRelojAcciones(armado.sala);

      vencer(0);
      assert.strictEqual(armado.cartas(), 1);
      assert.strictEqual(armado.partida.turnoActual, ANGEL);
      assert.strictEqual(programados.length, 2);

      vencer(1);
      assert.strictEqual(armado.cartas(), 2);
      assert.strictEqual(armado.partida.turnoActual, ANGEL);

      vencer(2);
      assert.strictEqual(armado.cartas(), 2);
      assert.strictEqual(armado.partida.turnoActual, ALAN);
      assert.strictEqual(armado.partida.faseJuego, FaseJuego.DADOS);
    });

    it("si el mazo esta vacio no compra y pasa el turno", () => {
      const armado = armarSinConstrucciones(2);
      while (armado.banca.cartas.length > 0) armado.banca.cartas.shift();
      const { vencer } = ponerBots(armado, ANGEL);
      iniciarRelojAcciones(armado.sala);

      vencer(0);

      assert.strictEqual(armado.cartas(), 0);
      assert.strictEqual(armado.partida.turnoActual, ALAN);
    });
  });

  describe("construccion de caminos", () => {

    //? Funcion que deja a Angel con un camino y dos vertices valiosos a 2 caminos de distancia, con recursos para un solo camino
    function armarParaCamino() {
      const armado = armarJuegoConReloj();
      armado.partida.faseJuego = FaseJuego.ACCIONES;

      const cadena = armarCadena(armado.tablero);
      fijarNumeros(cadena, 0);
      const [, , , v3, v4] = cadena.vertices;
      trazar(cadena, cadena.caminos[0], ANGEL);
      hacerRelevantes(cadena, v3, v4);

      //* Con trigo y lana en la mano el poblado al que lleva el camino se puede pagar
      const jugador = armado.jugadores.get(ANGEL);
      for (const [recurso, cantidad] of Object.entries({ madera: 1, ladrillo: 1, trigo: 1, lana: 1 })) {
        jugador.recursos.set(recurso, cantidad);
      }

      return { ...armado, jugador, caminos: () => contarPiezas(armado.tablero.aristas.values(), ANGEL) };
    }

    it("el bot construye un camino en su despertar y despues pasa el turno", () => {
      const armado = armarParaCamino();
      const { programados, vencer } = ponerBots(armado, ANGEL);
      iniciarRelojAcciones(armado.sala);
      assert.strictEqual(armado.caminos(), 1);

      vencer(0);
      assert.strictEqual(armado.caminos(), 2);
      assert.strictEqual(armado.jugador.recursos.get("madera"), 0);
      assert.strictEqual(armado.partida.turnoActual, ANGEL);
      assert.strictEqual(programados.length, 2);

      vencer(1);
      assert.strictEqual(armado.caminos(), 2);
      assert.strictEqual(armado.partida.turnoActual, ALAN);
      assert.strictEqual(armado.partida.faseJuego, FaseJuego.DADOS);
    });
  });

  describe("completar una meta con la banca o la abundancia", () => {

    //? Funcion que deja a Angel con un asentamiento que no produce nada y los recursos indicados, para que su objetivo sea la ciudad
    function armarCiudadIncompleta(recursos: Record<string, number>, abundancia = 0) {
      const armado = armarJuegoConReloj();
      armado.partida.faseJuego = FaseJuego.ACCIONES;
      armado.partida.cartaJugable = true;

      const cadena = armarCadena(armado.tablero);
      fijarNumeros(cadena, 0);
      construir(cadena, cadena.vertices[0], ANGEL);

      const jugador = armado.jugadores.get(ANGEL);
      for (const [recurso, cantidad] of Object.entries(recursos)) jugador.recursos.set(recurso, cantidad);
      jugador.cartas_usables.set(`${Desarrollo.ABUNDANCIA}`, abundancia);

      return {
        ...armado,
        jugador,
        ciudades: () => [...armado.tablero.vertices.values()]
          .filter((vertice) => vertice.propietario === ANGEL && vertice.constuccion === Construccion.CIUDAD).length
      };
    }

    it("cambia con la banca lo que le falta, construye la ciudad y pasa el turno", () => {
      const armado = armarCiudadIncompleta({ mineral: 2, trigo: 2, madera: 4 });
      const { programados, vencer } = ponerBots(armado, ANGEL);
      iniciarRelojAcciones(armado.sala);

      vencer(0);
      assert.strictEqual(armado.jugador.recursos.get("mineral"), 3);
      assert.strictEqual(armado.jugador.recursos.get("madera"), 0);
      assert.strictEqual(armado.ciudades(), 0);

      vencer(1);
      assert.strictEqual(armado.ciudades(), 1);
      assert.strictEqual(armado.partida.turnoActual, ANGEL);
      assert.strictEqual(programados.length, 3);

      vencer(2);
      assert.strictEqual(armado.partida.turnoActual, ALAN);
    });

    it("usa la carta de abundancia para completar lo que le falta, construye la ciudad y pasa el turno", () => {
      const armado = armarCiudadIncompleta({ mineral: 1, trigo: 2 }, 1);
      const { vencer } = ponerBots(armado, ANGEL);
      iniciarRelojAcciones(armado.sala);

      vencer(0);
      assert.strictEqual(armado.jugador.recursos.get("mineral"), 3);
      assert.strictEqual(armado.jugador.cartas_usables.get(`${Desarrollo.ABUNDANCIA}`), 0);
      assert.strictEqual(armado.ciudades(), 0);

      vencer(1);
      assert.strictEqual(armado.ciudades(), 1);

      vencer(2);
      assert.strictEqual(armado.partida.turnoActual, ALAN);
    });
  });
});
