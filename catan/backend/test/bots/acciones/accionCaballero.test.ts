import { describe, it } from "mocha";
import assert from "node:assert";
import { accionCaballero, olvidarDecisionCaballero } from "../../../src/bots/acciones/accionCaballero.js";
import { decidirDados } from "../../../src/bots/decisiones/decidirDados.js";
import { Construccion, Desarrollo, FaseJuego } from "../../../src/common/enums.js";
import { verticesDelHexagono } from "../../../src/functions/verticesDelHexagono.js";
import { ALAN, ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";

const CABALLERO = `${Desarrollo.CABALLERO}`;
const JUEGA = () => 0.2;
const NO_JUEGA = () => 0.5;

//? Funcion que devuelve el juego en la fase de acciones de Angel (el bot) con una carta de caballero para usar
function armarCaballero() {
  const armado = armarJuegoConReloj();
  armado.partida.faseJuego = FaseJuego.ACCIONES;
  armado.partida.cartaJugable = true;
  armado.jugadores.get(ANGEL).cartas_usables.set(CABALLERO, 1);
  return armado;
}

type Armado = ReturnType<typeof armarCaballero>;

//? Pone un asentamiento de un jugador en un vertice del terreno donde esta el ladron
function construirJuntoAlLadron(armado: Armado, sessionId: string) {
  const { tablero } = armado;
  const hexagono = tablero.hexagonos.get(`${tablero.ladron.h},${tablero.ladron.d}`);
  const vertice = verticesDelHexagono(tablero.vertices, hexagono)[0];
  vertice.setPropietario(sessionId);
  vertice.setConstruccion(Construccion.ASENTAMIENTO);
}

//? Indica si el bot gasto su carta de caballero
function jugo(armado: Armado) {
  return armado.jugadores.get(ANGEL).cartas_usables.get(CABALLERO) === 0;
}

describe("accion del bot con la carta de caballero", () => {

  it("la juega siempre que el ladron esta en un terreno suyo", () => {
    const armado = armarCaballero();
    construirJuntoAlLadron(armado, ANGEL);
    const antes = `${armado.tablero.ladron.h},${armado.tablero.ladron.d}`;

    assert.strictEqual(accionCaballero(armado.sala, ANGEL, NO_JUEGA), true);

    assert.strictEqual(jugo(armado), true);
    assert.notStrictEqual(`${armado.tablero.ladron.h},${armado.tablero.ladron.d}`, antes);
    assert.strictEqual(armado.partida.cartaJugable, false);
  });

  it("si el ladron no lo afecta, la juega con un 30% de probabilidad", () => {
    const armado = armarCaballero();

    assert.strictEqual(accionCaballero(armado.sala, ANGEL, JUEGA), true);
    assert.strictEqual(jugo(armado), true);
  });

  it("si no sale el 30%, se guarda la carta", () => {
    const armado = armarCaballero();

    assert.strictEqual(accionCaballero(armado.sala, ANGEL, NO_JUEGA), false);
    assert.strictEqual(jugo(armado), false);
  });

  it("el 30% se prueba una sola vez por turno", () => {
    const armado = armarCaballero();

    accionCaballero(armado.sala, ANGEL, NO_JUEGA);

    assert.strictEqual(accionCaballero(armado.sala, ANGEL, JUEGA), false);
    assert.strictEqual(jugo(armado), false);
  });

  it("al tirar los dados en su siguiente turno vuelve a probar", () => {
    const armado = armarCaballero();
    accionCaballero(armado.sala, ANGEL, NO_JUEGA);

    armado.partida.faseJuego = FaseJuego.DADOS;
    decidirDados(armado.sala, ANGEL);
    armado.partida.faseJuego = FaseJuego.ACCIONES;

    assert.strictEqual(accionCaballero(armado.sala, ANGEL, JUEGA), true);
  });

  it("olvidar la decision de un bot no afecta a otro", () => {
    const armado = armarCaballero();
    accionCaballero(armado.sala, ANGEL, NO_JUEGA);

    olvidarDecisionCaballero(armado.sala, ALAN);

    assert.strictEqual(accionCaballero(armado.sala, ANGEL, JUEGA), false);
  });

  it("aunque el ladron lo afecte, no la juega si ya uso una carta este turno", () => {
    const armado = armarCaballero();
    construirJuntoAlLadron(armado, ANGEL);
    armado.partida.cartaJugable = false;

    assert.strictEqual(accionCaballero(armado.sala, ANGEL, JUEGA), false);
    assert.strictEqual(jugo(armado), false);
  });

  it("no la juega si no tiene la carta", () => {
    const armado = armarCaballero();
    armado.jugadores.get(ANGEL).cartas_usables.set(CABALLERO, 0);
    construirJuntoAlLadron(armado, ANGEL);

    assert.strictEqual(accionCaballero(armado.sala, ANGEL, JUEGA), false);
  });

  it("no la juega fuera de la fase de acciones ni fuera de su turno", () => {
    const fueraDeFase = armarCaballero();
    fueraDeFase.partida.faseJuego = FaseJuego.ROBO;
    assert.strictEqual(accionCaballero(fueraDeFase.sala, ANGEL, JUEGA), false);

    const otroTurno = armarCaballero();
    otroTurno.partida.turnoActual = ALAN;
    assert.strictEqual(accionCaballero(otroTurno.sala, ANGEL, JUEGA), false);
  });

  it("un ladron en el terreno de un rival no cuenta como que lo afecta", () => {
    const armado = armarCaballero();
    construirJuntoAlLadron(armado, ALAN);

    assert.strictEqual(accionCaballero(armado.sala, ANGEL, NO_JUEGA), false);
  });
});
