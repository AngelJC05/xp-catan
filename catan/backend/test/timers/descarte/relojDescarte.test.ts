import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego } from "../../../src/common/enums.js";
import { Jugador } from "../../../src/schemas/Jugador.js";
import { TIEMPOS_POR_DEFECTO } from "../../../src/timers/tiempos.js";
import { descarteAutomatico } from "../../../src/autoFunctions/descarte/descarteAutomatico.js";
import { aplicarTirada } from "../../../src/rooms/acciones/dados/aplicarTirada.js";
import { manejarDescartarRecursos } from "../../../src/rooms/handlers/descarte/descartarRecursos.js";
import { manejarSalida } from "../../../src/rooms/handlers/sala/salirDeSala.js";
import { ALAN, ANGEL, armarJuegoConReloj, tiradaDe } from "../../ayudas/juegoConReloj.js";
import { armarCliente } from "../../ayudas/salaFalsa.js";

const LUIS = "jugadorLuis";

//? Funcion que devuelve el juego con tres jugadores: Alan con 9 maderas y Luis con 4 lanas y 4 trigos
function armarJuegoConManosLlenas() {
  const armado = armarJuegoConReloj();
  armado.jugadores.set(LUIS, new Jugador("Luis"));
  armado.partida.ordenJugadores.push(LUIS);
  armado.jugadores.get(ALAN).recursos.set("madera", 9);
  armado.jugadores.get(LUIS).recursos.set("lana", 4);
  armado.jugadores.get(LUIS).recursos.set("trigo", 4);
  return armado;
}

//? Funcion que devuelve la partida ya en descarte: salio un 7, Alan debe 4 y Luis debe 4
function armarDescarte() {
  const armado = armarJuegoConManosLlenas();
  aplicarTirada(armado.sala, tiradaDe(7));
  return armado;
}

//? Descarta a mano varias veces el mismo recurso
function descartar(armado: ReturnType<typeof armarDescarte>, sessionId: string, recurso: string, veces: number) {
  for (let i = 0; i < veces; i++) {
    manejarDescartarRecursos(armado.sala, armarCliente(sessionId).client, { recurso });
  }
}

//? Suma todos los recursos de un mapa
function total(recursos: Map<string, number>) {
  let suma = 0;
  recursos.forEach((cantidad) => { suma += cantidad; });
  return suma;
}

describe("reloj de descarte al salir un 7", () => {

  it("arranca con el tiempo de descarte si alguien tiene mas de 7 recursos", () => {
    const { sala, programados } = armarDescarte();

    assert.strictEqual(sala.partida.faseJuego, FaseJuego.DESCARTE);
    assert.strictEqual(programados.length, 1);
    assert.strictEqual(programados[0].milisegundos, TIEMPOS_POR_DEFECTO.descarte * 1000);
    assert.strictEqual(sala.temporizador.estaActivo("descarte"), true);
  });

  it("no arranca si con el 7 nadie tiene que descartar", () => {
    const { sala, partida } = armarJuegoConReloj();

    aplicarTirada(sala, tiradaDe(7));

    assert.strictEqual(partida.faseJuego, FaseJuego.LADRON);
    assert.strictEqual(sala.temporizador.estaActivo("descarte"), false);
  });

  it("no arranca si sale otro numero", () => {
    const { sala } = armarJuegoConManosLlenas();

    aplicarTirada(sala, tiradaDe(8));

    assert.strictEqual(sala.temporizador.estaActivo("descarte"), false);
  });
});

describe("reloj de descarte cuando se descarta a mano", () => {

  it("sigue corriendo si todavia falta alguien por descartar", () => {
    const armado = armarDescarte();

    descartar(armado, ALAN, "madera", 4);

    assert.strictEqual(armado.programados[0].cancelado, false);
    assert.strictEqual(armado.sala.temporizador.estaActivo("descarte"), true);
  });

  it("se cancela cuando el ultimo termina de descartar", () => {
    const armado = armarDescarte();

    descartar(armado, ALAN, "madera", 4);
    descartar(armado, LUIS, "lana", 4);

    assert.strictEqual(armado.partida.faseJuego, FaseJuego.LADRON);
    assert.strictEqual(armado.sala.temporizador.estaActivo("descarte"), false);
  });
});

describe("reloj de descarte cuando un jugador sale de la partida", () => {

  it("se cancela si sale el ultimo que faltaba por descartar", () => {
    const armado = armarDescarte();
    descartar(armado, ALAN, "madera", 4);

    manejarSalida(armado.sala, armarCliente(LUIS).client);

    assert.strictEqual(armado.partida.faseJuego, FaseJuego.LADRON);
    assert.strictEqual(armado.sala.temporizador.estaActivo("descarte"), false);
  });

  it("sigue corriendo si sale alguien y todavia falta otro", () => {
    const armado = armarDescarte();

    manejarSalida(armado.sala, armarCliente(LUIS).client);

    assert.strictEqual(armado.partida.faseJuego, FaseJuego.DESCARTE);
    assert.strictEqual(armado.sala.temporizador.estaActivo("descarte"), true);
  });

  it("se cancela si sale el jugador del turno", () => {
    const armado = armarDescarte();

    manejarSalida(armado.sala, armarCliente(ANGEL).client);

    assert.strictEqual(armado.sala.temporizador.estaActivo("descarte"), false);
  });
});

describe("reloj de descarte al vencer", () => {

  it("descarta a cada uno lo que le faltaba y pasa a mover al ladron", () => {
    const { sala, partida, jugadores, vencer } = armarDescarte();

    vencer(0);

    assert.strictEqual(total(jugadores.get(ALAN).recursos), 5);
    assert.strictEqual(total(jugadores.get(LUIS).recursos), 4);
    assert.strictEqual(partida.jugadoresParaDescartar.size, 0);
    assert.strictEqual(partida.faseJuego, FaseJuego.LADRON);
    assert.strictEqual(sala.temporizador.estaActivo("descarte"), false);
  });

  it("respeta lo que el jugador ya habia descartado a mano", () => {
    const armado = armarDescarte();
    descartar(armado, ALAN, "madera", 3);

    armado.vencer(0);

    assert.strictEqual(total(armado.jugadores.get(ALAN).recursos), 5);
  });

  it("solo descarta recursos que el jugador tiene y los devuelve a la banca", () => {
    const { banca, jugadores, vencer } = armarDescarte();
    const bancaAntes = total(banca.recursos);

    vencer(0);

    jugadores.get(LUIS).recursos.forEach((cantidad) => assert.ok(cantidad >= 0));
    assert.strictEqual(total(banca.recursos), bancaAntes + 8);
  });

  it("avisa en el registro a quien se le descarto por tiempo", () => {
    const { difundidos, vencer } = armarDescarte();

    vencer(0);

    const avisos = difundidos.filter((envio) =>
      envio.tipo === "log" && JSON.stringify(envio.mensaje).includes("a tiempo"));
    assert.strictEqual(avisos.length, 2);
  });

  it("no hace nada si ya no es la fase de descarte", () => {
    const { sala, jugadores } = armarJuegoConManosLlenas();

    descarteAutomatico(sala);

    assert.strictEqual(total(jugadores.get(ALAN).recursos), 9);
  });
});
