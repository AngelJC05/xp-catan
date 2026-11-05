import { describe, it } from "mocha";
import assert from "node:assert";
import { Construccion, Desarrollo, FaseJuego } from "../../../src/common/enums.js";
import { verticesDelHexagono } from "../../../src/functions/verticesDelHexagono.js";
import { Jugador } from "../../../src/schemas/Jugador.js";
import type { Hexagono } from "../../../src/schemas/Hexagono.js";
import { TIEMPOS_POR_DEFECTO } from "../../../src/timers/tiempos.js";
import { roboAutomatico } from "../../../src/autoFunctions/robo/roboAutomatico.js";
import { manejarCartaCaballero } from "../../../src/rooms/handlers/cartas/cartaCaballero.js";
import { manejarMoverLadron } from "../../../src/rooms/handlers/ladron/moverLadron.js";
import { manejarRobarJugador } from "../../../src/rooms/handlers/ladron/robarJugador.js";
import { manejarSalida } from "../../../src/rooms/handlers/sala/salirDeSala.js";
import { ALAN, ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";
import { armarCliente } from "../../ayudas/salaFalsa.js";

const LUIS = "jugadorLuis";
const MARIA = "jugadorMaria";

//? Funcion que devuelve el juego con cuatro jugadores en el turno de Angel
//? Alan y Luis tienen un asentamiento junto al terreno destino y un trigo cada uno; Maria no esta cerca
function armarJuegoConRivales(rivales = [ALAN, LUIS]) {
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

  const vertices = verticesDelHexagono(armado.tablero.vertices, destino as Hexagono);
  rivales.forEach((rival, i) => {
    vertices[i * 3].setPropietario(rival);
    vertices[i * 3].setConstruccion(Construccion.ASENTAMIENTO);
    armado.jugadores.get(rival).recursos.set("trigo", 1);
  });

  return { ...armado, destino: destino as Hexagono };
}

//? Funcion que devuelve la partida en la fase de robo: Angel movio al ladron del 7 junto a Alan y Luis
function armarRobo() {
  const armado = armarJuegoConRivales();
  armado.partida.faseJuego = FaseJuego.LADRON;
  manejarMoverLadron(armado.sala, armarCliente(ANGEL).client, { h: armado.destino.h, d: armado.destino.d });
  return armado;
}

//? Suma el trigo de varios jugadores
function trigoDe(armado: ReturnType<typeof armarJuegoConRivales>, ...ids: string[]) {
  return ids.reduce((suma, id) => suma + armado.jugadores.get(id).recursos.get("trigo"), 0);
}

describe("reloj de robo al entrar a la fase de robo", () => {

  it("arranca con el tiempo de robo si el ladron del 7 cae junto a dos rivales", () => {
    const { sala, partida, programados } = armarRobo();

    assert.strictEqual(partida.faseJuego, FaseJuego.ROBO);
    assert.strictEqual(programados.length, 1);
    assert.strictEqual(programados[0].milisegundos, TIEMPOS_POR_DEFECTO.robo * 1000);
    assert.strictEqual(sala.temporizador.estaActivo("robo"), true);
  });

  it("arranca si la carta de caballero cae junto a dos rivales", () => {
    const { sala, partida, jugadores, destino } = armarJuegoConRivales();
    partida.faseJuego = FaseJuego.ACCIONES;
    partida.cartaJugable = true;
    jugadores.get(ANGEL).cartas_usables.set(`${Desarrollo.CABALLERO}`, 1);

    manejarCartaCaballero(sala, armarCliente(ANGEL).client, { h: destino.h, d: destino.d });

    assert.strictEqual(partida.faseJuego, FaseJuego.ROBO);
    assert.strictEqual(sala.temporizador.estaActivo("robo"), true);
  });

  it("no arranca si solo hay un rival, porque se le roba directo", () => {
    const { sala, partida, destino } = armarJuegoConRivales([ALAN]);
    partida.faseJuego = FaseJuego.LADRON;

    manejarMoverLadron(sala, armarCliente(ANGEL).client, { h: destino.h, d: destino.d });

    assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
    assert.strictEqual(sala.temporizador.estaActivo("robo"), false);
  });
});

describe("reloj de robo mientras se espera elegir a quien robar", () => {

  it("se cancela si el jugador elige a mano", () => {
    const { sala, programados } = armarRobo();

    manejarRobarJugador(sala, armarCliente(ANGEL).client, { jugadorRobado: ALAN });

    assert.strictEqual(programados[0].cancelado, true);
    assert.strictEqual(sala.temporizador.estaActivo("robo"), false);
  });

  it("sigue corriendo si elige a alguien que no esta en la lista", () => {
    const { sala } = armarRobo();

    manejarRobarJugador(sala, armarCliente(ANGEL).client, { jugadorRobado: MARIA });

    assert.strictEqual(sala.temporizador.estaActivo("robo"), true);
  });

  it("sigue corriendo si sale uno de la lista y todavia queda otro", () => {
    const { sala, partida } = armarRobo();

    manejarSalida(sala, armarCliente(LUIS).client);

    assert.strictEqual(partida.faseJuego, FaseJuego.ROBO);
    assert.strictEqual(sala.temporizador.estaActivo("robo"), true);
  });

  it("se cancela si ya no queda nadie a quien robar", () => {
    const { sala, partida } = armarRobo();

    manejarSalida(sala, armarCliente(LUIS).client);
    manejarSalida(sala, armarCliente(ALAN).client);

    assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
    assert.strictEqual(sala.temporizador.estaActivo("robo"), false);
  });

  it("se cancela si sale el jugador del turno", () => {
    const { sala } = armarRobo();

    manejarSalida(sala, armarCliente(ANGEL).client);

    assert.strictEqual(sala.temporizador.estaActivo("robo"), false);
  });
});

describe("reloj de robo al vencer", () => {

  it("le roba un recurso a uno de la lista y vuelve a las acciones", () => {
    const armado = armarRobo();

    armado.vencer(0);

    assert.strictEqual(trigoDe(armado, ALAN, LUIS), 1);
    assert.strictEqual(trigoDe(armado, ANGEL), 1);
    assert.strictEqual(armado.partida.jugadoresParaRobar.length, 0);
    assert.strictEqual(armado.partida.faseJuego, FaseJuego.ACCIONES);
    assert.strictEqual(armado.sala.temporizador.estaActivo("robo"), false);
  });

  it("avisa en el registro que se eligio por tiempo", () => {
    const { difundidos, vencer } = armarRobo();

    vencer(0);

    const avisos = difundidos.filter((envio) =>
      envio.tipo === "log" && JSON.stringify(envio.mensaje).includes("a tiempo"));
    assert.strictEqual(avisos.length, 1);
  });

  it("le roba al jugador que salga elegido", () => {
    const armado = armarRobo();

    roboAutomatico(armado.sala, () => LUIS);

    assert.strictEqual(trigoDe(armado, LUIS), 0);
    assert.strictEqual(trigoDe(armado, ALAN), 1);
  });

  it("no hace nada si ya no es la fase de robo", () => {
    const armado = armarJuegoConRivales();
    armado.partida.faseJuego = FaseJuego.ACCIONES;

    roboAutomatico(armado.sala);

    assert.strictEqual(trigoDe(armado, ALAN, LUIS), 2);
  });
});
