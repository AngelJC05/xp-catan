import { describe, it } from "mocha";
import assert from "node:assert";
import { Construccion, Desarrollo, FaseJuego, FasePartida } from "../../../src/common/enums.js";
import { verticesDelHexagono } from "../../../src/functions/verticesDelHexagono.js";
import { Jugador } from "../../../src/schemas/Jugador.js";
import type { Hexagono } from "../../../src/schemas/Hexagono.js";
import { TIEMPOS_POR_DEFECTO } from "../../../src/timers/tiempos.js";
import { terminarTurnoAutomatico } from "../../../src/autoFunctions/turno/terminarTurnoAutomatico.js";
import { aplicarTirada } from "../../../src/rooms/acciones/dados/aplicarTirada.js";
import { manejarCartaCaballero } from "../../../src/rooms/handlers/cartas/cartaCaballero.js";
import { manejarCartaCarreteras } from "../../../src/rooms/handlers/cartas/cartaCarreteras.js";
import { manejarOfrecerIntercambio } from "../../../src/rooms/handlers/comercio/ofrecerIntercambio.js";
import { manejarMoverLadron } from "../../../src/rooms/handlers/ladron/moverLadron.js";
import { manejarRobarJugador } from "../../../src/rooms/handlers/ladron/robarJugador.js";
import { manejarSalida } from "../../../src/rooms/handlers/sala/salirDeSala.js";
import { manejarPasarTurno } from "../../../src/rooms/handlers/turno/pasarTurno.js";
import { ALAN, ANGEL, armarJuegoConReloj, tiradaDe } from "../../ayudas/juegoConReloj.js";
import { armarCliente } from "../../ayudas/salaFalsa.js";

const LUIS = "jugadorLuis";
const MARIA = "jugadorMaria";

const MILISEGUNDOS_ACCIONES = TIEMPOS_POR_DEFECTO.acciones * 1000;

//? Funcion que devuelve el juego con cuatro jugadores en el turno de Angel, en la fase de dados
//? Con rivales, Alan y Luis tienen un asentamiento junto al terreno destino y un trigo cada uno
function armarTurno(conRivales = false) {
  const armado = armarJuegoConReloj();
  armado.jugadores.set(LUIS, new Jugador("Luis"));
  armado.jugadores.set(MARIA, new Jugador("Maria"));
  armado.partida.ordenJugadores.push(LUIS, MARIA);

  //* Un terreno distinto al que tiene el ladron
  let destino: Hexagono | undefined;
  armado.tablero.hexagonos.forEach((hexagono) => {
    const tieneLadron = hexagono.h === armado.tablero.ladron.h && hexagono.d === armado.tablero.ladron.d;
    if (!destino && !tieneLadron) destino = hexagono;
  });

  if (conRivales) {
    const vertices = verticesDelHexagono(armado.tablero.vertices, destino as Hexagono);
    [ALAN, LUIS].forEach((rival, i) => {
      vertices[i * 3].setPropietario(rival);
      vertices[i * 3].setConstruccion(Construccion.ASENTAMIENTO);
      armado.jugadores.get(rival).recursos.set("trigo", 1);
    });
  }

  return { ...armado, destino: destino as Hexagono };
}

type Turno = ReturnType<typeof armarTurno>;

//? Funcion que devuelve el turno de Angel ya en las acciones despues de una tirada normal
function armarAcciones(conRivales = false) {
  const armado = armarTurno(conRivales);
  aplicarTirada(armado.sala, tiradaDe(6));
  return armado;
}

//? Mueve al ladron al terreno destino como el jugador del turno
function moverLadronADestino(armado: Turno) {
  manejarMoverLadron(armado.sala, armarCliente(ANGEL).client, { h: armado.destino.h, d: armado.destino.d });
}

//? Juega la carta de caballero de Angel hacia el terreno destino
function jugarCaballero(armado: Turno) {
  armado.partida.cartaJugable = true;
  armado.jugadores.get(ANGEL).cartas_usables.set(`${Desarrollo.CABALLERO}`, 1);
  manejarCartaCaballero(armado.sala, armarCliente(ANGEL).client, { h: armado.destino.h, d: armado.destino.d });
}

//? Los relojes de acciones que se programaron
function relojesDeAcciones(armado: Turno) {
  return armado.programados.filter((programado) => programado.milisegundos === MILISEGUNDOS_ACCIONES);
}

//? Simula que se acabo el tiempo del reloj de acciones que sigue en marcha
function vencerAcciones(armado: Turno) {
  const indice = armado.programados.findIndex((programado) =>
    programado.milisegundos === MILISEGUNDOS_ACCIONES && !programado.cancelado);
  armado.vencer(indice);
}

//? Suma todos los recursos de varios jugadores
function recursosDe(armado: Turno, ...ids: string[]) {
  let total = 0;
  ids.forEach((id) => armado.jugadores.get(id).recursos.forEach((cantidad) => { total += cantidad; }));
  return total;
}

describe("reloj de acciones al entrar a las acciones", () => {

  it("arranca con el tiempo de acciones de la sala despues de una tirada normal", () => {
    const armado = armarAcciones();

    assert.strictEqual(armado.partida.faseJuego, FaseJuego.ACCIONES);
    assert.strictEqual(relojesDeAcciones(armado).length, 1);
    assert.strictEqual(armado.sala.temporizador.estaActivo("acciones"), true);
  });

  it("no arranca mientras se resuelve el 7", () => {
    const { sala, partida } = armarTurno();

    aplicarTirada(sala, tiradaDe(7));

    assert.strictEqual(partida.faseJuego, FaseJuego.LADRON);
    assert.strictEqual(sala.temporizador.estaActivo("acciones"), false);
  });

  it("arranca cuando el ladron del 7 cae donde no hay a quien robar", () => {
    const armado = armarTurno();
    aplicarTirada(armado.sala, tiradaDe(7));

    moverLadronADestino(armado);

    assert.strictEqual(armado.partida.faseJuego, FaseJuego.ACCIONES);
    assert.strictEqual(armado.sala.temporizador.estaActivo("acciones"), true);
  });

  it("arranca hasta que se termina el robo del 7", () => {
    const armado = armarTurno(true);
    aplicarTirada(armado.sala, tiradaDe(7));
    moverLadronADestino(armado);

    assert.strictEqual(armado.partida.faseJuego, FaseJuego.ROBO);
    assert.strictEqual(armado.sala.temporizador.estaActivo("acciones"), false);

    manejarRobarJugador(armado.sala, armarCliente(ANGEL).client, { jugadorRobado: ALAN });

    assert.strictEqual(armado.partida.faseJuego, FaseJuego.ACCIONES);
    assert.strictEqual(armado.sala.temporizador.estaActivo("acciones"), true);
  });

  it("no se reinicia al volver de robar con la carta de caballero", () => {
    const armado = armarAcciones(true);

    jugarCaballero(armado);
    manejarRobarJugador(armado.sala, armarCliente(ANGEL).client, { jugadorRobado: ALAN });

    assert.strictEqual(armado.partida.faseJuego, FaseJuego.ACCIONES);
    assert.strictEqual(relojesDeAcciones(armado).length, 1);
    assert.strictEqual(relojesDeAcciones(armado)[0].cancelado, false);
  });
});

describe("reloj de acciones al pasar el turno o salir", () => {

  it("se cancela al pasar el turno", () => {
    const armado = armarAcciones();

    manejarPasarTurno(armado.sala, armarCliente(ANGEL).client);

    assert.strictEqual(relojesDeAcciones(armado)[0].cancelado, true);
    assert.strictEqual(armado.sala.temporizador.estaActivo("acciones"), false);
  });

  it("se cancela si sale el jugador del turno", () => {
    const armado = armarAcciones();

    manejarSalida(armado.sala, armarCliente(ANGEL).client);

    assert.strictEqual(armado.sala.temporizador.estaActivo("acciones"), false);
  });

  it("sigue corriendo sin reiniciarse si sale otro jugador", () => {
    const armado = armarAcciones();

    manejarSalida(armado.sala, armarCliente(LUIS).client);

    assert.strictEqual(relojesDeAcciones(armado).length, 1);
    assert.strictEqual(armado.sala.temporizador.estaActivo("acciones"), true);
  });

  it("sigue corriendo si sale otro jugador mientras usa la carta de carreteras", () => {
    const armado = armarAcciones();
    armado.partida.cartaJugable = true;
    armado.jugadores.get(ANGEL).cartas_usables.set(`${Desarrollo.CARRETERA}`, 1);
    manejarCartaCarreteras(armado.sala, armarCliente(ANGEL).client);

    manejarSalida(armado.sala, armarCliente(LUIS).client);

    assert.strictEqual(armado.partida.faseJuego, FaseJuego.CARRETERAS);
    assert.strictEqual(armado.sala.temporizador.estaActivo("acciones"), true);
  });

  it("arranca si al salir ya no queda a quien robar despues del 7", () => {
    const armado = armarTurno(true);
    aplicarTirada(armado.sala, tiradaDe(7));
    moverLadronADestino(armado);

    manejarSalida(armado.sala, armarCliente(LUIS).client);
    manejarSalida(armado.sala, armarCliente(ALAN).client);

    assert.strictEqual(armado.partida.faseJuego, FaseJuego.ACCIONES);
    assert.strictEqual(armado.sala.temporizador.estaActivo("acciones"), true);
  });
});

describe("reloj de acciones al vencer", () => {

  it("pasa el turno al siguiente jugador, que empieza con el reloj de los dados", () => {
    const armado = armarAcciones();

    vencerAcciones(armado);

    assert.strictEqual(armado.partida.turnoActual, ALAN);
    assert.strictEqual(armado.partida.faseJuego, FaseJuego.DADOS);
    assert.strictEqual(armado.sala.temporizador.estaActivo("dados"), true);
    assert.strictEqual(armado.sala.temporizador.estaActivo("acciones"), false);
  });

  it("avisa en el registro que se acabo el tiempo del turno", () => {
    const armado = armarAcciones();

    vencerAcciones(armado);

    const avisos = armado.difundidos.filter((envio) =>
      envio.tipo === "log" && JSON.stringify(envio.mensaje).includes("tiempo"));
    assert.strictEqual(avisos.length, 1);
  });

  it("cierra la oferta abierta y cancela su reloj", () => {
    const armado = armarAcciones();
    armado.jugadores.get(ANGEL).recursos.set("madera", 2);
    armado.jugadores.get(ALAN).recursos.set("trigo", 1);
    manejarOfrecerIntercambio(armado.sala, armarCliente(ANGEL).client, {
      ofrecidos: { madera: 2 }, solicitados: { trigo: 1 }
    });
    assert.strictEqual(armado.sala.temporizador.estaActivo("oferta"), true);

    vencerAcciones(armado);

    assert.strictEqual(armado.partida.ofertaIntercambio.jugador, "");
    assert.strictEqual(armado.sala.temporizador.estaActivo("oferta"), false);
    assert.strictEqual(armado.partida.turnoActual, ALAN);
  });

  it("si estaba eligiendo a quien robar con el caballero, roba al azar antes de pasar", () => {
    const armado = armarAcciones(true);
    jugarCaballero(armado);
    assert.strictEqual(armado.partida.faseJuego, FaseJuego.ROBO);
    //* La tirada pudo repartir recursos, asi que se compara con lo que tenian antes
    const recursosRivales = recursosDe(armado, ALAN, LUIS);
    const recursosAngel = recursosDe(armado, ANGEL);

    vencerAcciones(armado);

    assert.strictEqual(recursosDe(armado, ALAN, LUIS), recursosRivales - 1);
    assert.strictEqual(recursosDe(armado, ANGEL), recursosAngel + 1);
    assert.strictEqual(armado.partida.jugadoresParaRobar.length, 0);
    assert.strictEqual(armado.sala.temporizador.estaActivo("robo"), false);
    assert.strictEqual(armado.partida.turnoActual, ALAN);
    assert.strictEqual(armado.sala.temporizador.estaActivo("acciones"), false);
  });

  it("si estaba usando la carta de carreteras, pierde los caminos gratis", () => {
    const armado = armarAcciones();
    armado.partida.cartaJugable = true;
    armado.jugadores.get(ANGEL).cartas_usables.set(`${Desarrollo.CARRETERA}`, 1);
    manejarCartaCarreteras(armado.sala, armarCliente(ANGEL).client);
    assert.strictEqual(armado.partida.carreterasGratis, 2);

    vencerAcciones(armado);

    assert.strictEqual(armado.partida.carreterasGratis, 0);
    assert.strictEqual(armado.partida.turnoActual, ALAN);
    assert.strictEqual(armado.partida.faseJuego, FaseJuego.DADOS);
  });

  it("no hace nada si la partida ya termino", () => {
    const armado = armarAcciones();
    armado.partida.fase = FasePartida.FINALIZADA;

    terminarTurnoAutomatico(armado.sala);

    assert.strictEqual(armado.partida.turnoActual, ANGEL);
  });
});
