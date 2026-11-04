import { describe, it } from "mocha";
import assert from "node:assert";
import { Construccion, FaseJuego } from "../../../src/common/enums.js";
import { verticesDelHexagono } from "../../../src/functions/verticesDelHexagono.js";
import { Jugador } from "../../../src/schemas/Jugador.js";
import type { Hexagono } from "../../../src/schemas/Hexagono.js";
import type { Tablero } from "../../../src/schemas/Tablero.js";
import { TIEMPOS_POR_DEFECTO } from "../../../src/timers/tiempos.js";
import { moverLadronAutomatico } from "../../../src/autoFunctions/ladron/moverLadronAutomatico.js";
import { aplicarTirada } from "../../../src/rooms/acciones/dados/aplicarTirada.js";
import { manejarDescartarRecursos } from "../../../src/rooms/handlers/descarte/descartarRecursos.js";
import { manejarMoverLadron } from "../../../src/rooms/handlers/ladron/moverLadron.js";
import { manejarSalida } from "../../../src/rooms/handlers/sala/salirDeSala.js";
import { ALAN, ANGEL, armarJuegoConReloj, tiradaDe } from "../../ayudas/juegoConReloj.js";
import { armarCliente } from "../../ayudas/salaFalsa.js";

const LUIS = "jugadorLuis";

//? Funcion que devuelve el juego con tres jugadores en el turno de Angel, antes de tirar
function armarJuegoConTres() {
  const armado = armarJuegoConReloj();
  armado.jugadores.set(LUIS, new Jugador("Luis"));
  armado.partida.ordenJugadores.push(LUIS);
  return armado;
}

//? Funcion que devuelve la partida ya en la fase del ladron: salio un 7 y nadie tenia que descartar
function armarLadron() {
  const armado = armarJuegoConTres();
  aplicarTirada(armado.sala, tiradaDe(7));
  return armado;
}

//? Funcion que devuelve la partida en el descarte: salio un 7 y Alan, con 9 maderas, debe descartar 4
function armarDescarte() {
  const armado = armarJuegoConTres();
  armado.jugadores.get(ALAN).recursos.set("madera", 9);
  aplicarTirada(armado.sala, tiradaDe(7));
  return armado;
}

//? Devuelve un terreno distinto al que tiene el ladron
function otroTerreno(tablero: Tablero): Hexagono {
  let destino: Hexagono | undefined;
  tablero.hexagonos.forEach((hexagono) => {
    const tieneLadron = hexagono.h === tablero.ladron.h && hexagono.d === tablero.ladron.d;
    if (!destino && !tieneLadron) destino = hexagono;
  });
  return destino as Hexagono;
}

//? Busca cual de los relojes programados es el del ladron por su duracion
function relojLadron(programados: { milisegundos: number }[]) {
  return programados.findIndex((programado) => programado.milisegundos === TIEMPOS_POR_DEFECTO.ladron * 1000);
}

describe("reloj del ladron al entrar a la fase del ladron", () => {

  it("arranca con el tiempo del ladron si sale un 7 y nadie descarta", () => {
    const { sala, partida, programados } = armarLadron();

    assert.strictEqual(partida.faseJuego, FaseJuego.LADRON);
    assert.notStrictEqual(relojLadron(programados), -1);
    assert.strictEqual(sala.temporizador.estaActivo("ladron"), true);
  });

  it("no arranca si sale otro numero", () => {
    const { sala } = armarJuegoConTres();

    aplicarTirada(sala, tiradaDe(8));

    assert.strictEqual(sala.temporizador.estaActivo("ladron"), false);
  });

  it("espera a que termine el descarte para arrancar", () => {
    const { sala } = armarDescarte();

    assert.strictEqual(sala.temporizador.estaActivo("ladron"), false);
  });

  it("arranca cuando el ultimo termina de descartar a mano", () => {
    const { sala, partida } = armarDescarte();

    for (let i = 0; i < 4; i++) {
      manejarDescartarRecursos(sala, armarCliente(ALAN).client, { recurso: "madera" });
    }

    assert.strictEqual(partida.faseJuego, FaseJuego.LADRON);
    assert.strictEqual(sala.temporizador.estaActivo("ladron"), true);
  });

  it("arranca cuando el descarte se completa por tiempo", () => {
    const { sala, partida, vencer } = armarDescarte();

    vencer(0);

    assert.strictEqual(partida.faseJuego, FaseJuego.LADRON);
    assert.strictEqual(sala.temporizador.estaActivo("ladron"), true);
  });

  it("arranca si sale de la partida el ultimo que faltaba por descartar", () => {
    const { sala, partida } = armarDescarte();

    manejarSalida(sala, armarCliente(ALAN).client);

    assert.strictEqual(partida.faseJuego, FaseJuego.LADRON);
    assert.strictEqual(sala.temporizador.estaActivo("ladron"), true);
  });
});

describe("reloj del ladron mientras se espera mover al ladron", () => {

  it("se cancela si el jugador mueve al ladron a mano", () => {
    const { sala, tablero, programados } = armarLadron();
    const destino = otroTerreno(tablero);

    manejarMoverLadron(sala, armarCliente(ANGEL).client, { h: destino.h, d: destino.d });

    assert.strictEqual(programados[relojLadron(programados)].cancelado, true);
    assert.strictEqual(sala.temporizador.estaActivo("ladron"), false);
  });

  it("sigue corriendo si el movimiento no es valido", () => {
    const { sala, tablero } = armarLadron();

    manejarMoverLadron(sala, armarCliente(ANGEL).client, { h: tablero.ladron.h, d: tablero.ladron.d });

    assert.strictEqual(sala.temporizador.estaActivo("ladron"), true);
  });

  it("no se reinicia si sale de la partida otro jugador", () => {
    const { sala, programados } = armarLadron();
    const relojesAntes = programados.length;

    manejarSalida(sala, armarCliente(LUIS).client);

    assert.strictEqual(programados.length, relojesAntes);
    assert.strictEqual(sala.temporizador.estaActivo("ladron"), true);
  });

  it("se cancela si sale de la partida el jugador del turno", () => {
    const { sala } = armarLadron();

    manejarSalida(sala, armarCliente(ANGEL).client);

    assert.strictEqual(sala.temporizador.estaActivo("ladron"), false);
  });
});

describe("reloj del ladron al vencer", () => {

  it("mueve al ladron a otro terreno y sigue a las acciones si no hay a quien robar", () => {
    const { sala, partida, tablero, programados, vencer } = armarLadron();
    const antes = `${tablero.ladron.h},${tablero.ladron.d}`;

    vencer(relojLadron(programados));

    assert.notStrictEqual(`${tablero.ladron.h},${tablero.ladron.d}`, antes);
    assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
    assert.strictEqual(sala.temporizador.estaActivo("ladron"), false);
  });

  it("avisa en el registro que se movio por tiempo", () => {
    const { difundidos, programados, vencer } = armarLadron();

    vencer(relojLadron(programados));

    const avisos = difundidos.filter((envio) =>
      envio.tipo === "log" && JSON.stringify(envio.mensaje).includes("a tiempo"));
    assert.strictEqual(avisos.length, 1);
  });

  it("si cae junto a un rival con recursos le roba igual que a mano", () => {
    const { sala, partida, tablero, jugadores } = armarLadron();
    const destino = otroTerreno(tablero);
    const vertice = verticesDelHexagono(tablero.vertices, destino)[0];
    vertice.setPropietario(ALAN);
    vertice.setConstruccion(Construccion.ASENTAMIENTO);
    jugadores.get(ALAN).recursos.set("trigo", 1);

    moverLadronAutomatico(sala, () => [destino.h, destino.d]);

    assert.strictEqual(jugadores.get(ALAN).recursos.get("trigo"), 0);
    assert.strictEqual(jugadores.get(ANGEL).recursos.get("trigo"), 1);
    assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
  });

  it("no hace nada si ya no es la fase del ladron", () => {
    const { sala, tablero } = armarJuegoConTres();
    const antes = `${tablero.ladron.h},${tablero.ladron.d}`;

    moverLadronAutomatico(sala);

    assert.strictEqual(`${tablero.ladron.h},${tablero.ladron.d}`, antes);
  });
});
